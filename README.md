<<<<<<< HEAD
# Pasar Hanacaraka

Pasar Hanacaraka adalah aplikasi permainan edukasi interaktif yang dirancang untuk membantu siswa, guru, dan pengguna umum dalam mempelajari aksara Jawa (Hanacaraka) secara menyenangkan melalui simulasi jual-beli di pasar tradisional.

## Arsitektur & Teknologi

Aplikasi ini dikembangkan menggunakan tumpukan teknologi modern untuk performa yang optimal dan pengalaman pengguna yang lancar:

*   **Frontend**: React 18+ dengan Vite sebagai alat pembangunan (build tool).
*   **Styling**: Tailwind CSS untuk antarmuka yang responsif, bersih, dan modern.
*   **Backend & Database**: Firebase (Firestore) untuk persistensi data pengguna dan Firebase Authentication untuk sistem login yang aman.
*   **Bahasa Pemrograman**: TypeScript untuk memastikan keamanan tipe (type safety) di seluruh basis kode.

## Alur Aplikasi (User Journey)

1.  **Peluncuran (Splash Screen)**: Pengguna disambut dengan animasi splash screen yang dilengkapi indikator loading visual.
2.  **Onboarding**: Pengguna baru akan dipandu melalui carousel interaktif untuk memahami konsep dasar game dan cara bermain.
3.  **Autentikasi**: Pengguna dapat memilih untuk:
    - **Mendaftar/Masuk**: Menggunakan email atau akun sosial untuk menyimpan progres secara permanen.
    - **Mode Tamu**: Bermain langsung dengan batasan progres tidak tersimpan (tersedia informasi transparan mengenai batasan ini).
    - **Pemulihan Akun**: Tersedia fitur 'Lupa Password' pada halaman login.
4.  **Pemilihan Peran**: Pengguna memilih peran sebagai **Pembeli** (berbelanja barang di pasar) atau **Penjual** (melayani pembeli). Tersedia penjelasan (tooltip/modal) untuk setiap peran.
5.  **Pemilihan Level**: Pengguna memilih level belanja (dasar, menengah, mahir). Level yang belum terbuka (locked) memiliki indikator visual gembok yang jelas.
6.  **Pemilihan Warung**: Pengguna memilih jenis warung (misal: Jamu, Buah). Warung yang terkunci tidak dapat diakses dan memberikan umpan balik (toast) kepada pengguna.
7.  **Gameplay**:
    - **Mode Penjual**: Melayani pembeli dengan mencocokkan aksara.
    - **Mode Pembeli**: Berbelanja barang di pasar dengan mengenali aksara.
    - **Mode Belajar**: Latihan menulis aksara dengan panduan *stroke order*.
    - **Kontrol**: Pengguna dapat melakukan pause permainan kapan saja.
8.  **Progres & Pencapaian**: Pengguna dapat memantau progres pribadi, peringkat di leaderboard, serta berbelanja item di toko menggunakan koin yang didapat.

## Fitur Utama

- **Sistem Autentikasi Firebase**: Mendukung pendaftaran, login, lupa password, dan mode tamu yang aman.
- **Simulasi Pasar Interaktif**: Berbagai jenis warung dengan mekanisme gameplay jual-beli yang berbeda untuk penjual dan pembeli.
- **Sistem Pembelajaran Aksara**: Visualisasi aksara Jawa yang ramah edukasi, termasuk panduan *stroke order* untuk penulisan yang benar.
- **Sistem Ekonomi & Progresi**: Mekanisme perolehan Koin dan XP (Experience Points) untuk naik level dan membuka fitur baru.
- **Sistem Toko & Upgrade**: Toko dalam game untuk membeli item peningkatan atau membuka konten eksklusif, dengan tampilan saldo koin yang persisten.
- **Manajemen Pengalaman (UX)**:
    - **Onboarding Carousel**: Panduan interaktif untuk pengguna baru.
    - **Kontrol Gameplay**: Tombol pause, dialog konfirmasi aksi (undo/confirm), dan fitur zoom aksara.
    - **Visual Feedback**: Indikator loading, toast/snackbar untuk aksi terkunci, dan UI yang responsif.
- **Leaderboard & Rapor**: Peringkat global dan statistik kemajuan pribadi pengguna.
- **Navigasi Intuitif**: Bottom navigation bar untuk berpindah antar modul (Pasar, Belajar, Toko, Rapor).

## Laporan Revisi Heuristik (15 Poin)

Aplikasi ini telah diperbarui secara menyeluruh berdasarkan evaluasi heuristik untuk meningkatkan pengalaman pengguna:

1.  **Splash Screen**: Telah ditambahkan indikator loading visual.
2.  **Login/Register (Lupa Password)**: Telah ditambahkan jalur pemulihan kata sandi.
3.  **Register (Konfirmasi Password)**: Field konfirmasi kata sandi ('Ulangi Kata Sandi') telah ditambahkan.
4.  **Pilih Peran**: Penjelasan singkat (tooltip/modal) telah ditambahkan pada peran 'Pembeli' dan 'Penjual'.
5.  **Pilih Level Belanja**: Visual gembok dan label keterangannya telah diterapkan.
6.  **Pilih Warung**: Interaksi pada warung yang terkunci telah dinonaktifkan, disertai pesan umpan balik (toast).
7.  **Gameplay Penjual (Aksara)**: Fitur tap-to-enlarge pada balon kata aksara telah ditambahkan.
8.  **Gameplay Pembeli (Undo/Konfirmasi)**: Dialog konfirmasi telah diimplementasikan sebelum aksi krusial.
9.  **Mode Belajar (Stroke Order)**: Panduan urutan penulisan aksara telah ditambahkan.
10. **Rapor / Leaderboard**: Halaman rapor telah disesuaikan agar menampilkan progres pribadi sebagai tampilan default.
11. **Toko / Reward**: Saldo koin pengguna kini ditampilkan secara persisten pada halaman Toko.
12. **Bottom Navigation**: Ikon navigasi untuk Rapor telah diperbarui menjadi ikon badge/piala.
13. **Gameplay (Pause)**: Tombol pause yang jelas kini tersedia selama gameplay.
14. **Seluruh Aplikasi (Onboarding)**: Onboarding carousel telah ditambahkan saat first-time launch.
15. **Login / Register (Mode Tamu)**: Informasi batasan fitur 'Mode Tamu' telah dijelaskan secara transparan.

## Cara Menjalankan Aplikasi

Aplikasi ini berjalan dalam lingkungan Node.js. Berikut adalah cara untuk menjalankannya di lingkungan pengembangan:

1.  **Instalasi Dependensi**: Pastikan Anda berada di direktori akar proyek, kemudian jalankan:
    ```bash
    npm install
    ```
2.  **Menjalankan Server Pengembangan**:
    ```bash
    npm run dev
    ```
    Aplikasi akan tersedia secara lokal (biasanya di `http://localhost:3000`).

3.  **Membangun untuk Produksi**:
    ```bash
    npm run build
    ```
=======
# IMK9APASARHANACARAKA
>>>>>>> 600eec0cbc3f2c3b986a07053114c3691e33fc3b
