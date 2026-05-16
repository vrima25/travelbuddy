# TravelBuddy ✈️ — AI Travel Assistant

Smart travel planning assistant powered by Google Gemini AI
Final Project — AI Productivity & AI API Integration for Developers (Hacktiv8)

## Deskripsi

TravelBuddy adalah aplikasi AI Travel Assistant yang membantu pengguna merencanakan perjalanan dengan lebih cepat, cerdas, dan interaktif.

Aplikasi ini dibangun menggunakan:

⚡ Express.js sebagai backend server
🤖 Google Gemini AI sebagai AI engine
🖼️ Multer untuk upload & analisis gambar
🎨 Frontend modern dengan Dark Mode & Chat History

TravelBuddy mampu memberikan rekomendasi wisata, membuat itinerary otomatis, membantu budgeting perjalanan, hingga menganalisis gambar destinasi yang di-upload pengguna.

## Use Case

**Travel Assistant** — membantu pengguna dengan:

- Rekomendasi destinasi wisata lokal & internasional
- Pembuatan itinerary perjalanan yang detail
- Tips hemat budget traveling
- Informasi visa dan dokumen perjalanan
- Rekomendasi penginapan, kuliner, dan transportasi
- Analisis gambar destinasi yang dikirim pengguna (via Multer)

## Fitur

| Fitur               | Keterangan                                             |
| ------------------- | ------------------------------------------------------ |
| Chat AI Real-time   | Gemini 2.5 Flash via Google Generative AI SDK          |
| Dark Mode           | Toggle tema gelap/terang, tersimpan di localStorage    |
| Riwayat Chat        | Semua sesi tersimpan di browser, bisa dibuka/dihapus   |
| Upload Gambar       | Kirim foto destinasi/peta untuk dianalisis AI (Multer) |
| Quick Chips         | Shortcut pertanyaan populer                            |
| Conversation Memory | Bot ingat konteks dalam satu sesi                      |

## Parameter Kreatif

| Parameter       | Nilai                                |
| --------------- | ------------------------------------ |
| Model           | Gemini 2.5 Flash                     |
| Gaya Bahasa     | Santai & Friendly (Bahasa Indonesia) |
| Domain          | Travel & Pariwisata                  |
| Max Tokens      | 1024                                 |
| Upload Max Size | 5MB (jpg, png, webp, gif)            |

## Struktur Project

```
travelbuddy/
├── public/
│   ├── index.html    # Frontend HTML
│   ├── style.css     # Stylesheet + dark mode
│   └── app.js        # Frontend logic (fetch, state, history)
├── .env              # API key & konfigurasi (jangan di-commit!)
├── .gitignore
├── index.js          # Express server + API routes
├── package.json
└── README.md
```

## API Routes

| Method | Endpoint          | Deskripsi                                |
| ------ | ----------------- | ---------------------------------------- |
| GET    | `/`               | Serve frontend                           |
| POST   | `/api/chat`       | Chat teks biasa                          |
| POST   | `/api/chat/image` | Chat dengan gambar (multipart/form-data) |
| GET    | `/api/health`     | Health check server                      |

## Cara Menjalankan

### 1. Clone repo & install dependencies

```bash
git clone https://github.com/vrima25/travelbuddy.git
cd travelbuddy
npm install
```

### 2. Setup environment

```bash
cp .env
# Edit .env, isi GEMINI_API_KEY dengan key kamu
```

Isi `.env`:

```
GEMINI_API_KEY=your_gemini_api_key
PORT=3000
```

### 3. Jalankan server

```bash
# Production
npm start

# Development (auto-restart)
npm run dev
```

### 4. Buka browser

```
http://localhost:3000
```

## Mendapatkan API Key

1. Buka : https://aistudio.google.com/
2. Login menggunakan akun Google
3. Pergi ke menu **API Keys**
4. Klik **Create API Key**
5. Copy API key
6. Paste ke file `.env`

## Teknologi

- **Backend:** Node.js, Express.js
- **AI:** Google Gemini AI (`@google/generative-ai`)
- **Upload:** Multer (multipart/form-data)
- **Config:** dotenv
- **Frontend:** HTML5, CSS3, Vanilla JS
- **Font:** Plus Jakarta Sans (Google Fonts)

---

Dibuat untuk Final Project Hacktiv8 — AI Productivity and AI API Integration for Developers
