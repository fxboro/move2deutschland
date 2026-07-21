<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# move2deutschland

> A comprehensive guide and toolkit to simplify your relocation and integration journey to Germany.

**move2deutschland** is an all-in-one companion app designed to help expats, international students, and skilled workers navigate the process of moving to and settling in Germany. From visa application checklists to bureaucratic guides, this toolkit streamlines your transition so you can focus on building your new life.

## 🚀 Features

- **Visa Application Checklists:** Step-by-step guides for various visa types (Job Seeker, Blue Card, Student, etc.).
- **Bureaucracy Navigator:** Simplified instructions for registration (Anmeldung), opening a bank account, and securing health insurance.
- **Relocation Guides:** Essential tips for finding accommodation and understanding German rental contracts.
- **Interactive Dashboard:** Track your progress and save important resources securely.

## 📋 Prerequisites

- **Node.js** (v18 or higher recommended)
- **Firebase Project** (for backend services, authentication, and database)
- **Gemini API Key** (for AI-driven features and recommendations)

## 🛠️ Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Environment Variables

Set your `GEMINI_API_KEY` and Firebase configuration in your `.env.local` or `.env` file (you can use `.env.example` as a template):

```bash
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Run the app locally

```bash
npm run dev
```

The application will be accessible at your local dev server URL (typically `http://localhost:5173`).

## 🏗️ Architecture & Tech Stack

- **Frontend:** Vanilla JS/TS, HTML, CSS, Vite
- **Backend:** Firebase (Firestore, Cloud Functions)
- **AI Integration:** Google Gemini API

For a detailed overview of the system architecture, see [ARCHITECTURE.md](ARCHITECTURE.md).
For backend/cloud functions details, refer to [functions/README.md](functions/README.md).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues to help improve the project.
