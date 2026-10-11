const config = require('../config');
const { getLimit } = require('./database');

const commands = {
  menu: async (sock, m, ctx) => {
    const limit = ctx.isOwner ? 'Unlimited' : String(await getLimit(ctx.senderNumber));
    const text = [
      `╭─「 ${config.botName} 」`,
      `│ Status: Online`,
      `│ Limit: ${limit}`,
      `│ Prefix: ${config.prefix}`,
      '╰────────────',
      '',
      'INFO',
      '.menu — daftar command',
      '.ping — cek respons bot',
      '.infobot — info bot',
      '.owner — info owner',
      '',
      'TOOLS',
      '.qrcode <teks> — buat QR code (segera tersedia)',
      '',
      'Catatan: starter ini hanya mengaktifkan command dasar yang sudah diuji sintaks.'
    ].join('\\n');
    await sock.sendMessage(ctx.from, { text }, { quoted: m });
  },
  ping: async (sock, m, ctx) => {
    await sock.sendMessage(ctx.from, { text: 'Pong! Bot aktif.' }, { quoted: m });
  },
  infobot: async (sock, m, ctx) => {
    await sock.sendMessage(ctx.from, {
      text: `${config.botName}\\nPrefix: ${config.prefix}\\nLimit harian: ${config.maxLimit}\\nOwner dikonfigurasi: ${config.ownerNumberBare ? 'Ya' : 'Belum'}`
    }, { quoted: m });
  },
  owner: async (sock, m, ctx) => {
    const owner = config.ownerNumberBare.replace(/\\D/g, '');
    await sock.sendMessage(ctx.from, {
      text: owner ? `Nomor owner: +${owner}` : 'Nomor owner belum diatur. Atur environment variable OWNER_NUMBER di server.'
    }, { quoted: m });
  },
  help: async (sock, m, ctx) => commands.menu(sock, m, ctx)
};

async function handleCommand(sock, m, ctx) {
  if (!ctx.command) return;
  const fn = commands[ctx.command];
  if (!fn) {
    await sock.sendMessage(ctx.from, {
      text: `Command .${ctx.command} belum tersedia. Ketik .menu.`
    }, { quoted: m });
    return;
  }
  await fn(sock, m, ctx);
}

module.exports = { handleCommand };
