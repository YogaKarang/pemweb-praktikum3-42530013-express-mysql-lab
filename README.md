# Praktikum 3 - Express + MySQL (Guided Lab)

- **Mata Kuliah:** Pemrograman Web (MK11)
- **Modul:** Praktikum 3 - Rekayasa Sistem Basis Data: Persistensi MySQL, Connection Pooling, Prepared Statements, dan Arsitektur CRUD Aman
- **Nama:** I Wayan Yoga Karang Saputra
- **NIM:** 42530013
- **Kelas:** Pagi - Teknologi Informasi

Aplikasi web monolith (Server-Side Rendering) berbasis **Node.js, Express, dan EJS** yang terhubung ke **MySQL** menggunakan **connection pool** (`mysql2/promise`). Studi kasusnya adalah master data **produk** dengan operasi CRUD penuh.

## Fitur

- Konfigurasi kredensial database lewat variabel lingkungan (`.env` dengan `dotenv`).
- Connection pool (`mysql2.createPool`) dengan interface Promise (`pool.promise()`).
- Layer **Model** terpisah untuk seluruh query SQL.
- **READ**: daftar produk tampil dinamis di tabel EJS.
- **CREATE**: formulir tambah produk dengan pola **Post-Redirect-Get (PRG)**.
- **UPDATE**: rute dinamis `/produk/edit/:id` dengan formulir ter-isi (pre-filled).
- **DELETE**: hapus produk dengan dialog konfirmasi.
- Query berparameter (prepared statement, placeholder `?`) dan eksperimen pembuktian SQL Injection.

## Teknologi

| Komponen | Keterangan |
|---|---|
| Runtime | Node.js |
| Framework | Express |
| View engine | EJS |
| Driver database | mysql2 |
| Konfigurasi | dotenv |
| Dev server | nodemon |
| Database | MySQL |

## Prasyarat

- Node.js dan npm
- MySQL berjalan di `localhost:3306` (misalnya lewat Laragon atau XAMPP)
- Klien MySQL (phpMyAdmin, MySQL Workbench, atau DBeaver)

## Cara Menjalankan

1. **Pasang dependensi**

   ```bash
   npm install
   ```

2. **Siapkan database.** Jalankan skrip berikut di klien MySQL:

   ```sql
   CREATE DATABASE IF NOT EXISTS db_lab_web;
   USE db_lab_web;

   CREATE TABLE IF NOT EXISTS produk (
     id INT AUTO_INCREMENT PRIMARY KEY,
     nama_produk VARCHAR(100) NOT NULL,
     kategori VARCHAR(50) NOT NULL,
     harga DECIMAL(10, 2) NOT NULL,
     stok INT NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   INSERT INTO produk (nama_produk, kategori, harga, stok) VALUES
   ('Keyboard Mekanikal TKL', 'Periferal', 650000.00, 15),
   ('Mouse Gaming Wireless', 'Periferal', 350000.00, 20),
   ('Monitor LED 24 Inci 144Hz', 'Display', 1850000.00, 8);
   ```

3. **Siapkan variabel lingkungan.** Salin `.env.example` menjadi `.env`, lalu sesuaikan nilainya.

   ```bash
   cp .env.example .env
   ```

   Isi `.env.example`:

   ```
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=db_lab_web
   DB_PORT=3306
   ```

4. **Jalankan server**

   ```bash
   npm run dev
   ```

   Terminal menampilkan `[DATABASE] Terhubung ke MySQL Pool secara aman.` lalu `[SERVER] Aktif di http://localhost:3000`.

5. Buka `http://localhost:3000/produk`.

## Struktur Proyek

```
express-mysql-lab/
├── app.js                      # Entry point: middleware, router, uji koneksi pool
├── config/database.js          # Connection pool (mysql2) + interface Promise
├── models/produk.model.js      # Seluruh query SQL (prepared statement)
├── controllers/produk.controller.js  # Alur request dan response
├── routes/produk.routes.js     # Definisi endpoint (express.Router)
├── views/
│   ├── pages/                  # produk-list, produk-form-tambah, produk-form-edit
│   └── partials/               # header.ejs, footer.ejs
├── public/css/style.css        # Aset statis
├── docs/screenshots/           # Bukti praktikum
├── .env.example                # Contoh variabel lingkungan (tanpa kredensial asli)
└── package.json
```

## Endpoint

| Operasi | Endpoint | HTTP Method | Parameter / Payload | Respons |
|---|---|---|---|---|
| Read (All) | `/produk` | GET | - | 200 OK (tabel produk) |
| Form tambah | `/produk/tambah` | GET | - | 200 OK |
| Create | `/produk/tambah` | POST | `req.body` | 302 Found, redirect ke `/produk` |
| Read (One) | `/produk/edit/:id` | GET | `req.params.id` | 200 OK (formulir terisi) |
| Update | `/produk/edit/:id` | POST | `req.params.id` dan `req.body` | 302 Found, redirect ke `/produk` |
| Delete | `/produk/hapus/:id` | POST | `req.params.id` | 302 Found, redirect ke `/produk` |
| Uji keamanan | `/uji-keamanan` | GET | `?kategori=` | JSON hasil pencarian |

## Keamanan Query

Seluruh query pada operasi CRUD memakai **placeholder `?`** (parameterized query), sehingga nilai input dipisahkan dari struktur SQL:

```js
const [rows] = await db.query('SELECT * FROM produk WHERE id = ?', [id]);
```

Kredensial database disimpan di `.env` (tidak diunggah ke repositori). Repositori hanya memuat `.env.example`.

> Rute `/uji-keamanan` dan metode `getByKategoriInsecure` pada model dibuat **khusus untuk eksperimen laboratorium** (Pengalaman 6) dan tidak boleh dipakai di aplikasi sungguhan. Metode rentan tersebut dinonaktifkan (dikomentari) pada rute, dan versi yang aktif adalah versi prepared statement.

## Matriks Penelusuran Pengujian

| ID Uji | Fitur / Operasi | Endpoint | HTTP Method | Skenario Pengujian | Hasil yang Diharapkan | Status | Bukti Tangkapan Layar |
|---|---|---|---|---|---|---|---|
| TC-01 | Koneksi Pool | App Startup | - | Server dijalankan pertama kali | Terhubung ke MySQL Pool tanpa error | Pass | [01-db-pool-connection.png](docs/screenshots/01-db-pool-connection.png) |
| TC-02 | Read (All) | `/produk` | GET | Akses halaman daftar produk | Seluruh record tabel MySQL tampil di antarmuka EJS | Pass | [02-read-select-render.png](docs/screenshots/02-read-select-render.png) |
| TC-03 | Create | `/produk/tambah` | POST | Submit formulir produk baru | Data tersimpan di DB, DevTools mencatat 302 Redirect ke `/produk` | Pass | [03-create-insert-prg.png](docs/screenshots/03-create-insert-prg.png) |
| TC-04 | Update | `/produk/edit/:id` | POST | Mengubah data produk | Nilai kolom pada baris MySQL berubah, formulir ter-isi data lama | Pass | [04-update-param-redirect.png](docs/screenshots/04-update-param-redirect.png) |
| TC-05 | Delete | `/produk/hapus/:id` | POST | Eksekusi tombol hapus produk | Baris terhapus dari MySQL dan UI ter-refresh | Pass | [05-delete-feedback.png](docs/screenshots/05-delete-feedback.png) |
| TC-06 | Keamanan | `/uji-keamanan` | GET | Input `' OR '1'='1` via URL | Prepared statement memperlakukan input sebagai literal string (tanpa injeksi) | Pass | [06-sql-injection-mitigation.png](docs/screenshots/06-sql-injection-mitigation.png) |

## Laboratorium Investigasi Masalah

| Kasus | Pemicu | Galat yang teramati | Bukti |
|---|---|---|---|
| 1. `ER_ACCESS_DENIED_ERROR` | Sandi di `.env` diubah menjadi nilai salah | `Access denied for user 'root'@'localhost' (using password: YES)`. Server tidak menyala karena koneksi pool ditolak sebelum query dijalankan. | [07-error-access-denied.png](docs/screenshots/07-error-access-denied.png) |
| 2. `Bind parameters must not contain undefined` | Atribut `name` input harga pada formulir diubah menjadi `harga_produk`, validasi controller dikomentari, `create` memakai `db.execute` | `TypeError: Bind parameters must not contain undefined` karena `req.body.harga` bernilai `undefined` | [08-error-undefined-bind.png](docs/screenshots/08-error-undefined-bind.png) |
| 3. Pool exhaustion / timeout | `connectionLimit: 1` dan `getConnection()` tanpa `release()` | Request kedua menggantung (status Pending) karena pool kehabisan koneksi | [09-error-pool-exhaustion.png](docs/screenshots/09-error-pool-exhaustion.png) |

Seluruh kondisi di atas sudah dikembalikan ke konfigurasi normal setelah pengujian.

