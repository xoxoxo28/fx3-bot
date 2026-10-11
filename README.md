# FX³ BOT — Starter WhatsApp

Starter minimal berbasis Node.js dan Baileys. Saat ini command yang diaktifkan dan disiapkan sebagai baseline: `.menu`, `.ping`, `.infobot`, `.owner`. Fitur downloader, AI, HD/upscale, sticker, dan moderasi grup dari rancangan awal belum dimasukkan karena beberapa implementasi/API di source awal tidak valid dan harus diperbaiki serta diuji satu per satu.

## Prasyarat
- Node.js 20 atau lebih baru
- Akun WhatsApp yang akan ditautkan
- GitHub untuk menyimpan source
- Host Node.js dengan penyimpanan persisten untuk folder `session/` dan `database.json`

## Jalankan lokal
1. Salin `.env.example` menjadi `.env`, lalu isi `OWNER_NUMBER` jika diperlukan. Jangan commit `.env`.
2. Jalankan `npm install`.
3. Jalankan `npm start`.
4. Pindai QR yang tampil melalui WhatsApp > Perangkat tertaut > Tautkan perangkat.
5. Kirim `.menu` ke chat bot.

## Deploy
Upload file project ke repository GitHub. Di host Node.js, gunakan perintah build `npm install` dan start `npm start`. Pastikan folder `session/` dan `database.json` berada pada persistent volume/storage. Jangan mengunggah sesi atau kredensial WhatsApp ke GitHub.

## Catatan
- Baileys adalah integrasi tidak resmi dan dapat berubah sewaktu-waktu. Gunakan dengan mematuhi ketentuan WhatsApp; hindari spam.
- Jangan pernah membagikan QR pairing, file sesi, token, atau API key.
- Bot ini adalah starter yang belum menyediakan seluruh fitur yang tercantum pada rancangan awal.
