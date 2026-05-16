require("dotenv").config();
const express = require("express");
const multer = require("multer");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

const SYSTEM_PROMPT = `Kamu adalah TravelBuddy, asisten perjalanan AI yang ramah, santai, dan helpful banget. Kamu punya kepribadian yang fun dan ngobrol kayak teman yang sudah berpengalaman traveling.

Kamu ahli dalam:
- Rekomendasi destinasi wisata (lokal & internasional)
- Membuat itinerary perjalanan yang detail
- Tips hemat budget traveling
- Informasi visa dan dokumen perjalanan
- Rekomendasi penginapan, kuliner, dan transportasi
- Tips packing dan persiapan perjalanan
- Informasi cuaca dan musim terbaik untuk berwisata
- Menganalisis foto destinasi atau peta yang dikirim pengguna

Gaya bahasa: Santai, friendly, pakai bahasa Indonesia sehari-hari. Jawab informatif tapi enak dibaca. Pakai bullet points kalau perlu, dan emoji secukupnya (maks 3 per jawaban).`;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: SYSTEM_PROMPT,
});

// Multer — upload gambar ke folder uploads/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e5)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Hanya file gambar yang diizinkan!"));
  },
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// ─── ROUTES ───────────────────────────────────────────────

// GET / — serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// POST /api/chat — kirim pesan teks
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages tidak boleh kosong." });
    }

    // Pisahkan history dan pesan terakhir
    const lastMsg = messages[messages.length - 1];
    const historyMsgs = messages.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({ history: historyMsgs });
    const result = await chat.sendMessage(lastMsg.content);
    const reply =
      result.response.text() || "Maaf, ada gangguan nih. Coba lagi ya!";
    res.json({ reply });
  } catch (err) {
    console.error("Chat error:", err.message);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

// POST /api/chat/image — kirim pesan + gambar
app.post("/api/chat/image", upload.single("image"), async (req, res) => {
  try {
    const { message, history } = req.body;
    const file = req.file;

    if (!file)
      return res.status(400).json({ error: "Tidak ada gambar yang diunggah." });

    const imageData = fs.readFileSync(file.path);
    const base64Image = imageData.toString("base64");
    fs.unlinkSync(file.path);

    // Susun history untuk Gemini
    let historyMsgs = [];
    if (history) {
      try {
        const parsed = JSON.parse(history);
        historyMsgs = parsed.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        }));
      } catch (_) {}
    }

    const chat = model.startChat({ history: historyMsgs });
    const result = await chat.sendMessage([
      {
        text:
          message ||
          "Tolong analisis gambar ini dan berikan rekomendasi travel yang relevan!",
      },
      { inlineData: { mimeType: file.mimetype, data: base64Image } },
    ]);

    const reply =
      result.response.text() || "Maaf, ada gangguan nih. Coba lagi ya!";
    res.json({ reply });
  } catch (err) {
    console.error("Image chat error:", err.message);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

// GET /api/health — health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "TravelBuddy server is running!" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route tidak ditemukan." });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`✈️  TravelBuddy running at http://localhost:${PORT}`);
});
