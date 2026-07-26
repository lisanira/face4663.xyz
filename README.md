# FACE4663 Website

Landing page statis untuk menampilkan contract address, chart, tombol buy, explorer, dan social links.

## 1. Ubah data project

Buka `script.js`, lalu edit bagian:

```js
const CONFIG = {
  contractAddress: "0x...",
  buyUrl: "https://...",
  explorerUrl: "https://...",
  chartUrl: "https://...",
  twitterUrl: "https://x.com/...",
  telegramUrl: "https://t.me/...",
  dexUrl: "https://..."
};
```

Kalau token belum launch, biarkan `chartUrl` kosong.

## 2. Preview di laptop

Cara termudah:

```bash
python -m http.server 3000
```

Lalu buka `http://localhost:3000`.

## 3. Deploy ke Vercel

1. Buat repository GitHub baru.
2. Upload semua file dari folder ini.
3. Masuk ke Vercel dan import repository tersebut.
4. Framework preset: `Other`.
5. Deploy.
6. Tambahkan domain `face4663.xyz` di menu Domains.
7. Salin DNS record dari Vercel ke pengaturan DNS Spaceship.

## Catatan

Website ini tidak membutuhkan database, server berbayar, atau wallet connect.
