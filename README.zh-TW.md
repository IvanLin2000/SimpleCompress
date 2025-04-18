# SimpleCompress

[English](./README.md)

🚀 一個輕量級、注重隱私的工具，可在瀏覽器中直接壓縮圖片和影片 — 無需上傳、無需伺服器、無需麻煩。

🌐 **範例**: [https://simplecompress.reeurl.com](https://simplecompress.reeurl.com)

## 🧠 關於

**SimpleCompress** 是一個單頁應用程式，讓您使用最簡單的方法壓縮圖片和影片 — **全部在本地完成**。它專為速度、隱私和易用性而設計。

- 📷 支援圖片壓縮（JPEG、PNG 等）
- 🎥 支援影片壓縮（MP4）
- ⚡ 完全在瀏覽器中運行，使用 WebAssembly + Canvas
- 🔒 保持您的檔案本地化 — 資料永遠不會離開您的裝置
- 🖱️ 簡潔直觀的介面 — 只需選擇檔案、選擇品質，完成！

## ✨ 技術堆疊

- [`@ffmpeg/ffmpeg`](https://github.com/ffmpegwasm/ffmpeg.wasm) 用於影片壓縮
- 原生 `<canvas>` 用於圖片壓縮（如適用）
- Vue 3 + Vite 實現極速前端
- 無後端，無雲端依賴

## 🖼️ 使用方法

1. 開啟網站
2. 選擇圖片或影片
3. 選擇壓縮品質（20% ~ 100%）
4. 預覽結果並下載

## 🛠 開發

```bash
npm install
npm run dev
``` 