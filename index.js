const pino = require('pino');
const qrcode = require('qrcode-terminal');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const config = require('./config');
const { initDB, checkLimit, reduceLimit } = require('./lib/database');
const { handleCommand } = require('./lib/command');

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
let reconnecting = false;

async function startBot() {
  await initDB();
  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger,
    auth: state,
    printQRInTerminal: false,
    browser: [config.botName, 'Chrome', '1.0.0'],
    markOnlineOnConnect: false,
    syncFullHistory: false
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log('\\nScan QR ini dari WhatsApp > Perangkat tertaut > Tautkan perangkat:\\n');
      qrcode.generate(qr, { small: true });
    }
    if (connection === 'open') {
      reconnecting = false;
      console.log(`${config.botName} terhubung.`);
    }
    if (connection === 'close') {
      const status = new Boom(lastDisconnect?.error).output?.statusCode;
      if (status === DisconnectReason.loggedOut) {
        console.error('Sesi logout. Hapus sesi hanya jika memang ingin menautkan ulang.');
        return;
      }
      if (!reconnecting) {
        reconnecting = true;
        setTimeout(() => {
          reconnecting = false;
          startBot().catch(err => logger.error(err, 'Gagal reconnect'));
        }, 3000);
      }
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const m of messages) {
      if (!m.message || m.key.fromMe) continue;
      const from = m.key.remoteJid;
      if (!from || from === 'status@broadcast') continue;
      const text = m.message.conversation
        || m.message.extendedTextMessage?.text
        || m.message.imageMessage?.caption
        || m.message.videoMessage?.caption
        || '';
      if (!text.startsWith(config.prefix)) continue;

      const sender = m.key.participant || m.key.remoteJid;
      const senderNumber = sender.split('@')[0];
      const isOwner = Boolean(config.ownerNumberBare) &&
        senderNumber === config.ownerNumberBare.replace(/\\D/g, '');
      const isGroup = from.endsWith('@g.us');
      const parts = text.slice(config.prefix.length).trim().split(/\\s+/);
      const command = (parts.shift() || '').toLowerCase();
      const args = parts;

      try {
        if (!isOwner) {
          const hasLimit = await checkLimit(senderNumber);
          if (!hasLimit) {
            await sock.sendMessage(from, { text: 'Limit harian habis. Coba lagi besok.' }, { quoted: m });
            continue;
          }
        }
        await handleCommand(sock, m, {
          from, sender, senderNumber, isOwner, isGroup, command, args, text
        });
        if (!isOwner) await reduceLimit(senderNumber);
      } catch (err) {
        logger.error(err, 'Command gagal');
        await sock.sendMessage(from, { text: 'Terjadi error saat menjalankan command. Periksa log server.' }, { quoted: m });
      }
    }
  });
}

startBot().catch(err => {
  logger.error(err, 'Bot gagal start');
  process.exitCode = 1;
});
