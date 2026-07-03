# Gemini AI Laboratory 🧪✨

Welcome to the **Gemini AI Laboratory**, a high-end development workspace and creative AI staging environment powered by the Google Gemini SDK (`@google/genai`). 

This workspace is designed to unlock advanced AI capabilities—including dynamic text generation, structured data mining, high-fidelity asset rendering, and interactive sandbox compilers—directly from a unified, full-stack environment.

---

## 🚀 Key Architectural Highlights

- **Server-Side Security**: All Gemini API interactions are secured server-side in `server.ts` to keep your API keys private. No client-side exposure.
- **Realistic Streams**: Leverages Server-Sent Events (SSE) to deliver high-performance real-time chat completions directly to the frontend.
- **Dynamic CSS Sandbox**: Generates fully-styled interactive mini-applications on-the-fly and loads them in an isolated `iframe` sandbox stage.
- **Structured Outputs**: Native support for strict JSON schema verification to convert raw, unstructured logs, business cards, or receipts into strict data structures.

---

## 🛠️ The Workspace Lab Suites

### 1. Speech & Chat Lab
- **About**: An advanced playground for conversational synthesis, system instruction overriding, and parameter tuning (Temperature, Top-P, and nucleus sampling controls).
- **How to Use It**:
  1. Set your preferred model from the dropdown (defaults to `gemini-3.5-flash`).
  2. Toggle **Configure** to adjust creative parameters or insert a custom **System Instruction** (e.g., *“You are an expert financial consultant…”*).
  3. Optional: Enable **Auto-Copy Responses** inside settings to instantly copy finalized model code blocks/replies to your clipboard.
  4. Type your prompt into the bottom bar and click **Send**.

### 2. AI Image Design Studio
- **About**: A creative graphic stage utilizing Google's advanced image generation models to render custom assets, vectors, background layers, and logos.
- **How to Use It**:
  1. Provide a detailed, highly descriptive prompt (e.g., *“Cute isometric 3D render of a golden retriever astronaut, pastel color palette”*).
  2. Choose your target **Aspect Ratio** (`1:1`, `16:9`, `9:16`, `4:3`, or `3:4`) and the preferred rendering engine.
  3. Click **Synthesize Image Asset**. The image will be generated server-side and appear on the execution stage, where you can instantly click **Save Asset** to download it.

### 3. Structured Data Extractor
- **About**: A powerful pipeline built on Gemini’s strict JSON output capability. It converts noisy, unstructured text into valid, production-ready JSON schemas.
- **How to Use It**:
  1. Select an extraction preset (e.g., **Receipt/Bill**, **Contact Card**, **Action Checklist**) or choose **Custom Schema** to input your own custom JSON structure.
  2. Paste your raw, messy text into the **Raw Text Content Source** field (e.g., a messy email signature, OCR scan, or meeting notes).
  3. Click **Synthesize JSON Payload**. The system will output a perfectly formatted JSON object that is fully copyable with a single click.

### 4. Prompt-to-App Sandbox Compiler
- **About**: An advanced, pro-tier design compiler that generates self-contained interactive web widgets on-the-fly, parses them, and loads them inside an execution stage.
- **How to Use It**:
  1. Input a feature request or layout you want compiled (e.g., *“A glowing neon circular pomodoro timer with sound effects and customizable intervals”*).
  2. Click **Compile**. The backend will generate a standalone HTML document utilizing Tailwind CSS via CDN and functional vanilla JS.
  3. Inspect the code on the left editor tab, and interact with the live execution stage on the right! You can click **Reload Widget** at any time to reboot the live sandboxed page.

### 5. Curated Prompt Blueprints
- **About**: A collection of pre-designed prompt blueprints optimized for visual styling, software architecture planning, high-end illustration, and raw data extraction.
- **How to Use It**:
  - Click **Inject Prompt** on any card. The system will automatically select the matching lab environment, fill the prompt field, and navigate you directly to that laboratory.

---

## ⚙️ Development & Quickstart

### Prerequisites
Before running, ensure you have your Gemini API Key set in your workspace secrets.

### Environment Setup (`.env`)
Create a `.env` file (or set via settings dashboard):
```env
GEMINI_API_KEY="your-google-gemini-api-key"
```

### Script Directory

- `npm run dev`: Boots up the server-side compiler and frontend livereload in TypeScript environment mode.
- `npm run build`: Bundles the React application and compiles `server.ts` into a fast-loading production-ready file.
- `npm run start`: Runs the pre-compiled server in production container mode.
