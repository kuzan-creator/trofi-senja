# Trofi Senja — Panduan Platinum GTA 6

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/kuzan-creator/trofi-senja/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/kuzan-creator/trofi-senja/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Panduan platinum **Grand Theft Auto VI (PS5)** yang jalan offline di browser desktop: checklist 55 trofi resmi, panduan tiap trofi, roadmap ke platinum, halaman missables, dan penghitung PSN.

## Jalankan offline

```sh
node serve.ts
# buka http://localhost:8080
```

Tanpa build, tanpa jaringan saat dipakai. Semua data tersimpan di `localStorage` di perangkatmu.

## Isi

- **55 trofi resmi** — nama, deskripsi, dan grade persis dari daftar resmi (1 platinum, 2 emas, 6 perak, 46 perunggu, 28 tersembunyi), di `app/data/trophies.json`.
- **Panduan tiap trofi dengan kata-kata sendiri** — apa yang harus dilakukan, kapan, dan apakah bisa terlewat. Setiap trofi mencantumkan sumbernya (daftar resmi / Exophase untuk nama-deskripsi-grade, PSNProfiles untuk target hitungan PSN). Kalau sebuah lokasi atau langkah belum dicek di dalam game, panduan menuliskannya jelas — tidak ada lokasi yang ditebak.
- **Checklist tersimpan** — centang trofi yang sudah didapat, ekspor/impor progres sebagai JSON.
- **Spoiler Shield** — nama & deskripsi trofi cerita tersembunyi sampai trofi itu didapat (bisa dimatikan, pintasan `s`).
- **Filter & cari** — menurut grade, jenis (cerita, bisa terlewat, koleksi, aktivitas, penjelajahan, tempur, uang), status, dan teks.
- **Roadmap ke Platinum** — urutan bab/misi, kemajuan per bab, dan perencana **Next Up** (5 trofi berikutnya).
- **Missables** — 21 trofi yang bisa terlewat, kotak missable di setiap detail trofi, dan 5 titik tanpa jalan kembali dalam urutan bab.
- **Penghitung PSN** — untuk trofi yang dilacak PSN dengan hitungan, misalnya 250 stunt, 42 shooting range, 100 kendaraan, 100 WAiNK, 18 titik meditasi, 14 balapan drone, 20 balapan, 50 tantangan, 52 area, 8 rangkaian orang asing, 3 set kartu, 5 brankas bank, 500 pilihan.
- **Catatan per trofi** — tersimpan bersama progresmu.
- **Pintasan keyboard** — `/` cari, `1` checklist, `2` roadmap, `3` missables, `s` spoiler, `e` ekspor.
- **Audit strip** — jumlah klaim dikutip yang terlihat di atas halaman, dengan rincian sumbernya.

## Bounty

Dibuat untuk [make.fun — Build the best GTA 6 trophy guide](https://make.fun/bounty/gta6-trophy-guide-01).
