# SimpleCompress

[繁體中文](./README.zh-TW.md)

🚀 A lightweight, privacy-first tool to compress images and videos **directly in your browser** — no uploads, no servers, no hassle.

🌐 **Live Demo**: [https://simplecompress.reeurl.com](https://simplecompress.reeurl.com)

## 🧠 About

**SimpleCompress** is a single-page app that lets you compress images and videos using the simplest methods possible — **all locally**. It's built for speed, privacy, and ease of use.

- 📷 Supports image compression (JPEG, PNG, etc.)
- 🎥 Supports video compression (MP4)
- ⚡ Runs entirely in the browser using WebAssembly + Canvas
- 🔒 Keeps your files local — nothing ever leaves your device
- 🖱️ Minimal, intuitive interface — just pick a file, pick a quality, done!

## ✨ Tech Stack

- [`@ffmpeg/ffmpeg`](https://github.com/ffmpegwasm/ffmpeg.wasm) for video compression
- Native `<canvas>` for image compression (if applicable)
- Vue 3 + Vite for blazing fast frontend
- No backend, no cloud dependencies

## 🖼️ How to Use

1. Open the website
2. Select an image or video
3. Choose compression quality (20% ~ 100%)
4. Preview result and download

## 🛠 Development

```bash
npm install
npm run dev
