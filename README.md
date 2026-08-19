# Forcecraver Resume Studio & AI Generator 🚀

An enterprise-grade, AI-powered Resume Studio with instant PDF extraction, ATS optimization, WYSIWYG live editing, Word (DOCX) & PDF export, and dual AI engine support (**Groq Cloud** & **Local Ollama**).

---

## ✨ Features

- ⚡ **Dual AI Engine**:
  - **Groq Cloud API (Free)**: Ultra-fast 500 tok/s processing (~1.5s per resume) with `llama-3.3-70b-versatile`.
  - **Local Ollama**: Offline private inference on your GPU (NVIDIA RTX) or CPU.
- 📄 **Universal Format Parsing**: Direct upload of PDF, DOCX, and text resumes.
- 🎯 **Forcecraver Standardizer**: Auto-normalizes experience duration, career summaries, company hierarchy, and technical competency categories.
- 🖋️ **Interactive WYSIWYG Editor**: Live dynamic editing with A4 pagination preview, watermark toggling, and instant layout adjustments.
- 📥 **Export to DOCX & PDF**: Download ready-to-send documents formatted with executive styling.

---

## 🚀 Quick Start (Local)

### 1. Clone & Install
```bash
git clone https://github.com/<your-username>/forcecraver-resume-editor.git
cd forcecraver-resume-editor
npm install
```

### 2. Configure AI Engine

#### Option A: Groq Cloud (Recommended - Free & Instant)
1. Get a free API key at [console.groq.com/keys](https://console.groq.com/keys).
2. Create a `.env` file in the root directory:
```env
GROQ_API_KEY=gsk_your_groq_api_key_here
```

#### Option B: Local Ollama
1. Ensure Ollama is running locally:
```bash
ollama run qwen2.5:latest
```
2. Leave `GROQ_API_KEY` blank in `.env`.

### 3. Run the Server
```bash
npm start
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🌐 Deploy to Production (Render.com - 100% Free)

1. Push your repository to **GitHub**.
2. Go to **[Render.com](https://render.com)** and sign in with GitHub.
3. Click **New +** -> **Web Service** and select this repository.
4. Configure service settings:
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: `Free`
5. In **Environment Variables**, add:
   - `GROQ_API_KEY` = `gsk_your_groq_api_key_here`
6. Click **Deploy Web Service**! Your live app will be accessible worldwide in ~1 minute.

---

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3 Modern Flex/Grid, Lucide Icons
- **Backend**: Node.js HTTP/HTTPS Server (Zero heavy frameworks, ultra-lightweight)
- **Document Engines**: PDF.js, Mammoth.js, HTML-to-DOCX, HTML2PDF.js
- **AI Backend**: Groq Cloud API / Ollama REST API

---

## 📄 License
MIT License - Forcecraver Technologies.
