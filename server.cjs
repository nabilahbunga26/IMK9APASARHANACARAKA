var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_crypto = __toESM(require("crypto"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var geminiApiKey = process.env.GEMINI_API_KEY || "";
var aiClient = null;
if (geminiApiKey) {
  aiClient = new import_genai.GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
var DB_DIR = import_path.default.join(process.cwd(), "data");
var DB_FILE = import_path.default.join(DB_DIR, "db.json");
function initDb() {
  if (!import_fs.default.existsSync(DB_DIR)) {
    import_fs.default.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!import_fs.default.existsSync(DB_FILE)) {
    const defaultData = {
      users: {},
      progress: {},
      sessions: {}
    };
    import_fs.default.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), "utf-8");
  } else {
    try {
      const content = import_fs.default.readFileSync(DB_FILE, "utf-8");
      JSON.parse(content);
    } catch (e) {
      const defaultData = {
        users: {},
        progress: {},
        sessions: {}
      };
      import_fs.default.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), "utf-8");
    }
  }
}
initDb();
function readDb() {
  try {
    initDb();
    const data = import_fs.default.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    return { users: {}, progress: {}, sessions: {} };
  }
}
function writeDb(data) {
  initDb();
  import_fs.default.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}
function hashPassword(password) {
  return import_crypto.default.createHash("sha256").update(password).digest("hex");
}
function generateUUID() {
  if (typeof import_crypto.default.randomUUID === "function") {
    try {
      return import_crypto.default.randomUUID();
    } catch (e) {
    }
  }
  return import_crypto.default.randomBytes(16).toString("hex");
}
function generateDefaultProgress(uid) {
  return {
    uid,
    coins: 350,
    // Starting vendor capital
    level: 1,
    xp: 0,
    title: "Caliye (Pemula)",
    // Beginner title
    unlockedStalls: ["kelontong"],
    // starts with Grocery Sembako stall
    completedCount: 0,
    lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
  };
}
var NPC_COMPETITORS = [
  { name: "Mbah Sunar (Jamu)", title: "Juragan Jamu", level: 12, coins: 2500, completedCount: 88 },
  { name: "Mas Joko (Buah)", title: "Pengiras", level: 8, coins: 1200, completedCount: 45 },
  { name: "Nyi Sri", title: "Bakul Sepuh", level: 15, coins: 4300, completedCount: 120 },
  { name: "Siti Rahma", title: "Sedulur", level: 5, coins: 850, completedCount: 22 },
  { name: "Kang Tejo", title: "Prakanca", level: 3, coins: 450, completedCount: 12 }
];
function getAuthUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.substring(7);
  const db = readDb();
  const session = db.sessions[token];
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    delete db.sessions[token];
    writeDb(db);
    return null;
  }
  return session.uid;
}
app.post("/api/auth/register", (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    console.log(`[AUTH REGISTER] Request received for email: ${email}, name: ${name}`);
    if (!name || !email || !password) {
      console.warn("[AUTH REGISTER] Missing fields in payload");
      res.status(400).json({ error: "Nama, Email, dan Sandi harus diisi" });
      return;
    }
    const cleanEmail = email.toLowerCase().trim();
    const db = readDb();
    if (db.users[cleanEmail]) {
      console.warn(`[AUTH REGISTER] Email already registered: ${cleanEmail}`);
      res.status(400).json({ error: "Akun email sudah terdaftar" });
      return;
    }
    const uid = generateUUID();
    const passwordHash = hashPassword(password);
    const newUser = {
      uid,
      name,
      email: cleanEmail,
      passwordHash,
      role: "player",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.users[cleanEmail] = newUser;
    db.progress[uid] = generateDefaultProgress(uid);
    const token = import_crypto.default.randomBytes(32).toString("hex");
    db.sessions[token] = {
      uid,
      expiresAt: Date.now() + 1e3 * 60 * 60 * 24 * 7
      // 7 days expiration
    };
    writeDb(db);
    console.log(`[AUTH REGISTER] Successfully registered user: ${cleanEmail}`);
    res.status(201).json({
      token,
      user: { name: newUser.name, email: newUser.email, role: newUser.role, uid },
      progress: db.progress[uid]
    });
  } catch (err) {
    console.error("[AUTH REGISTER] Registration error:", err);
    res.status(500).json({ error: "Gagal memproses pendaftaran akun baru", details: err.message });
  }
});
app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password } = req.body || {};
    console.log(`[AUTH LOGIN] Attempt for email: ${email}`);
    if (!email || !password) {
      console.warn("[AUTH LOGIN] Missing email or password");
      res.status(400).json({ error: "Email dan Sandi harus diisikan" });
      return;
    }
    const cleanEmail = email.toLowerCase().trim();
    const db = readDb();
    const user = db.users[cleanEmail];
    if (!user) {
      console.warn(`[AUTH LOGIN] User not found: ${cleanEmail}`);
      res.status(401).json({ error: "Email atau kata sandi Anda salah" });
      return;
    }
    if (user.passwordHash !== hashPassword(password)) {
      console.warn(`[AUTH LOGIN] Password mismatch for: ${cleanEmail}`);
      res.status(401).json({ error: "Email atau kata sandi Anda salah" });
      return;
    }
    const token = import_crypto.default.randomBytes(32).toString("hex");
    db.sessions[token] = {
      uid: user.uid,
      expiresAt: Date.now() + 1e3 * 60 * 60 * 24 * 7
      // 7 days
    };
    writeDb(db);
    const progress = db.progress[user.uid] || generateDefaultProgress(user.uid);
    console.log(`[AUTH LOGIN] Successfully logged in: ${cleanEmail}`);
    res.json({
      token,
      user: { name: user.name, email: user.email, role: user.role, uid: user.uid },
      progress
    });
  } catch (err) {
    console.error("[AUTH LOGIN] Login error:", err);
    res.status(500).json({ error: "Gagal memproses masuk ke akun", details: err.message });
  }
});
app.post("/api/auth/social", (req, res) => {
  try {
    const { email, name, provider } = req.body || {};
    console.log(`[AUTH SOCIAL] ${provider?.toUpperCase()} login/register attempt for email: ${email}, name: ${name}`);
    if (!email || !name || !provider) {
      console.warn("[AUTH SOCIAL] Missing email, name, or provider");
      res.status(400).json({ error: "Email, Nama, dan Provider harus dilampirkan" });
      return;
    }
    const cleanEmail = email.toLowerCase().trim();
    const db = readDb();
    let user = db.users[cleanEmail];
    let isNewRegistration = false;
    if (!user) {
      isNewRegistration = true;
      console.log(`[AUTH SOCIAL] Creating new user for: ${cleanEmail} via ${provider}`);
      const uid = generateUUID();
      const passwordHash = hashPassword(import_crypto.default.randomBytes(16).toString("hex"));
      const newUser = {
        uid,
        name,
        email: cleanEmail,
        passwordHash,
        role: "player",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      db.users[cleanEmail] = newUser;
      db.progress[uid] = generateDefaultProgress(uid);
      user = newUser;
    }
    const token = import_crypto.default.randomBytes(32).toString("hex");
    db.sessions[token] = {
      uid: user.uid,
      expiresAt: Date.now() + 1e3 * 60 * 60 * 24 * 7
      // 7 days
    };
    writeDb(db);
    const progress = db.progress[user.uid] || generateDefaultProgress(user.uid);
    console.log(`[AUTH SOCIAL] Successfully authenticated via ${provider}: ${cleanEmail}. Registration: ${isNewRegistration}`);
    res.json({
      token,
      user: { name: user.name, email: user.email, role: user.role, uid: user.uid },
      progress,
      isNewRegistration
    });
  } catch (err) {
    console.error("[AUTH SOCIAL] error:", err);
    res.status(500).json({ error: "Gagal memproses otentikasi sosial", details: err.message });
  }
});
app.get("/api/auth/me", (req, res) => {
  const uid = getAuthUser(req);
  if (!uid) {
    res.status(401).json({ error: "Sesi habis, silakan masuk kembali." });
    return;
  }
  const db = readDb();
  let foundUser = null;
  for (const email of Object.keys(db.users)) {
    if (db.users[email].uid === uid) {
      foundUser = db.users[email];
      break;
    }
  }
  if (!foundUser) {
    res.status(404).json({ error: "User tidak ditemukan" });
    return;
  }
  const progress = db.progress[uid] || generateDefaultProgress(uid);
  res.json({
    user: { name: foundUser.name, email: foundUser.email, role: foundUser.role, uid: foundUser.uid },
    progress
  });
});
app.post("/api/auth/logout", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const db = readDb();
    if (db.sessions[token]) {
      delete db.sessions[token];
      writeDb(db);
    }
  }
  res.json({ success: true, message: "Logged out successfully" });
});
app.post("/api/game/save", (req, res) => {
  const uid = getAuthUser(req);
  if (!uid) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { coins, level, xp, title, unlockedStalls, completedCount } = req.body;
  if (coins === void 0 || level === void 0) {
    res.status(400).json({ error: "Invalid progress fields" });
    return;
  }
  const db = readDb();
  const currentProgress = db.progress[uid] || generateDefaultProgress(uid);
  const updatedProgress = {
    uid,
    coins: Number(coins),
    level: Number(level),
    xp: Number(xp),
    title: String(title),
    unlockedStalls: Array.isArray(unlockedStalls) ? unlockedStalls : currentProgress.unlockedStalls,
    completedCount: completedCount !== void 0 ? Number(completedCount) : currentProgress.completedCount,
    lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.progress[uid] = updatedProgress;
  writeDb(db);
  res.json({ success: true, progress: updatedProgress });
});
app.get("/api/game/leaderboard", (req, res) => {
  const db = readDb();
  const list = [];
  for (const email of Object.keys(db.users)) {
    const user = db.users[email];
    const progress = db.progress[user.uid] || generateDefaultProgress(user.uid);
    list.push({
      name: user.name,
      title: progress.title,
      level: progress.level,
      coins: progress.coins,
      completedCount: progress.completedCount
    });
  }
  const allEntries = [...list, ...NPC_COMPETITORS];
  allEntries.sort((a, b) => {
    if (b.level !== a.level) {
      return b.level - a.level;
    }
    return b.coins - a.coins;
  });
  res.json(allEntries.slice(0, 10));
});
app.post("/api/game/ai-chat", async (req, res) => {
  if (!aiClient) {
    res.json({
      reply: "Suasana pasar riuh rendah! Penjual ramah menyapa Anda. (Untuk mengaktifkan asisten AI interaktif dengan aksara Jawa, silakan hubungkan kunci API Gemini Anda di panel Settings > Secrets!)"
    });
    return;
  }
  const { message, characterName, rolePlayPrompt } = req.body;
  if (!message) {
    res.status(400).json({ error: "Pesan tidak boleh kosong" });
    return;
  }
  try {
    const systemPrompt = rolePlayPrompt || `Anda adalah ${characterName || "Penjual senior bernama Mbah Sunar"} di Pasar Hanacaraka, sebuah pasar tradisional Javanese kuno. Anda harus berbincang dalam bahasa Indonesia bercampur aksen bahasa Jawa halus (Krama/Ngoko) yang hangat, ramah, dan mendidik pemain tentang tulisan Aksara Jawa. Sesekali berikan pujian dalam logat Jawa seperti "Sugeng, Cah Ayu!" atau "Cah Bagus!" dan jelaskan satu huruf Aksara Jawa (contoh: huruf HA (\uA9B2) atau NA (\uA9A4)) dengan gembira jika relevan. Jawablah maksimal dalam 3 kalimat agar santun dan nyaman dibaca.`;
    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: message,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.8
      }
    });
    const reply = response.text || "Suasana pasar sangat riuh saat ini!";
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: "Gagal memproses pesan AI", details: err.message });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting in development mode with Vite Middleware...");
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting in production mode serving static assets...");
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`========================================`);
    console.log(`  PASAR HANACARAKA running on port: ${PORT}`);
    console.log(`========================================`);
  });
}
startServer();
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
//# sourceMappingURL=server.cjs.map
