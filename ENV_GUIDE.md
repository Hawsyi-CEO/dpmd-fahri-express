# Environment Configuration Guide

## Setup untuk Development (Local)

1. Copy file `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update konfigurasi di `.env` sesuai dengan environment lokal Anda:
   ```
   DB_HOST=127.0.0.1
   DB_USER=root
   DB_PASSWORD=
   CORS_ORIGIN=http://localhost:5173
   ```

3. File `.env` tidak akan di-track oleh git (ada di .gitignore), jadi setiap developer bebas mengatur sesuai kebutuhan lokal mereka.

## Setup untuk Production

1. File `.env.production` sudah di-track di git dan berisi konfigurasi untuk production.

2. **PENTING**: Sebelum deploy ke production, update nilai-nilai berikut di `.env.production`:
   - `DB_HOST`: Host database production
   - `DB_USER`: Username database production
   - `DB_PASSWORD`: Password database production
   - `CORS_ORIGIN`: URL frontend production
   - `LARAVEL_API_URL`: URL Laravel API production (jika ada)

3. Saat deploy, gunakan file `.env.production`:
   ```bash
   # Copy .env.production menjadi .env di server production
   cp .env.production .env
   ```

## File Environment yang Ada

- `.env` - **Local development** (ignored by git)
- `.env.example` - Template untuk setup awal (tracked by git)
- `.env.production` - **Production config** (tracked by git untuk kolaborasi tim)

## Tips Kolaborasi Tim

1. Setiap anggota tim setup `.env` sendiri untuk local development
2. Diskusikan dan update `.env.production` bersama untuk production
3. Jangan commit `.env` lokal ke git
4. Selalu sync `.env.production` dengan tim sebelum deploy
