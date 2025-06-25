![banir](https://github.com/user-attachments/assets/8074a650-2996-471f-a375-653095052613)

# PromptQCM – AI-Powered MCQ Generator for Education 📚🤖

PromptQCM is an intelligent web platform that automatically generates educational multiple-choice questionnaires (MCQs) from imported learning materials. Designed primarily for university students but also useful for educators, it combines modern web technologies with AI to revolutionize exam preparation and assessment creation.

---

## ✨ Key Features

- **🤖 AI-Powered MCQ Generation**  
  Automatically generates pedagogically relevant MCQs from PDFs (text or scanned) using LLaMA 3.3 via OpenRouter API.

- **📂 Document Processing**  
  Supports both native PDF text extraction (pdfjs) and OCR for scanned documents (Tesseract.js).

- **🏫 Academic Organization**  
  Hierarchical organization by institutions → modules → subjects to mirror real academic structures.

- **📊 Performance Analytics**  
  Interactive charts and time tracking to visualize progress by module with Chart.js integration.

- **📄 PDF Export**  
  Export generated MCQs as printable PDFs using jsPDF.

- **🎨 Custom UI Experience**  
  100% custom interface designed in Figma with:
  - Dark/light mode toggle
  - Responsive design (mobile-first)
  - Fluid animations with Framer Motion

- **🔒 Secure Cloud Backend**  
  Full authentication and data management via Appwrite (NoSQL database, file storage, user management).

---

## 🛠️ Tech Stack

### Frontend
- ⚛️ React.js
- 🍃 TailwindCSS
- 🎬 Framer Motion (animations)
- 📊 Chart.js (data visualization)
- 📄 jsPDF (PDF generation)
- 🔍 pdfjs + Tesseract.js (document processing)

---

### Backend & AI
- 🟥 Appwrite (BaaS - Authentication, NoSQL DB, Storage)
- 🧠 OpenRouter.ai + LLaMA 3.3 (AI MCQ generation)
- 🔄 REST API for all backend communications

---

### DevOps
- ▲ Vercel (Frontend hosting)
- 🐙 GitHub (Version control)
- 🛠️ Cursor AI (Code assistance)
- 🎨 Figma (UI/UX design)

---

## 📁 Project Structure

```
src/
├── assets/ # Static assets
├── components/ # Reusable components
│ ├── DocumentCard.jsx
│ ├── ModuleCard.jsx
│ ├── ProgressModule.jsx
│ └── ReportCard.jsx
├── context/ # Context providers
├── pages/ # Main application pages
│ ├── Home.jsx # Dashboard
│ ├── Generate.jsx # AI MCQ generation
│ ├── Upload.jsx # Document upload
│ ├── Library.jsx # Document management
│ ├── Modules.jsx # Module organization
│ ├── Reports.jsx # Performance analytics
│ └── Settings.jsx # User preferences
├── lib/ # Appwrite & API utilities
└── App.js # Root component
```

---

## 🚧 Development Progress

```txt
📐 UI/UX Design .......... ✅ Complete  
💻 Frontend (React) ...... ✅ Complete  
🔌 Backend (Appwrite) .... ✅ Complete    
🧠 AI Integration ........ ✅ Complete   
🧪 Testing & QA .......... ✅ Complete  
🚀 Deployment ............ ✅ Complete
```

> **Last updated**: June 2025  
> **Current Version**: Prototype v0.1

---

## 🖼️ Screenshots & Previews

### Dashboard (Home.jsx)
![image 12](https://github.com/user-attachments/assets/d6727921-16b4-4c65-8ca2-524c37f60cb2)

### Modules (Modules.jsx)
![Group 1171275278](https://github.com/user-attachments/assets/f0eda0c6-4262-44bf-b06e-668ee969d268)

### Reports (Report.jsx)
![image-3](https://github.com/user-attachments/assets/7ea6df26-8a6e-465f-bf2b-bda38bd296d9)

### Mobile Mode
![Group 1171275278](https://github.com/user-attachments/assets/a4083ad9-199e-4f2b-b07c-71b70f6e20ab)

### Dark Mode
![Group 1171275279](https://github.com/user-attachments/assets/f1c2836b-3142-4022-b7eb-e29dccaad846)

---

## 🎬 Demo & Presentation

Coming soon!

---

## 🚀 Deployment Plan

PromptQCM has been deployed with the following setup:

- **Frontend**: Hosted on [Vercel](https://vercel.com/)  
- **Backend**: Managed by [Appwrite](https://appwrite.io/)  
- **AI Module**: OpenRouter API hosted on [OpenRouter](https://openrouter.ai/)

---

## 📄 License

This project is licensed under the **MIT License**. See the `LICENSE` file for more information.

---

## 🙌 Acknowledgments

- **Appwrite** for the powerful backend-as-a-service platform
- **OpenRouter** for LLM API access
- **Meta** for the LLaMA 3 model
- **Vercel** for seamless frontend hosting
- Insomnia ☕ for making this possible lol

---
