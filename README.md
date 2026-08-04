# ScriptFlow Pro - Smart CRM

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=flat&logo=Firebase&logoColor=white)](https://firebase.google.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-4285F4?style=flat&logo=google&logoColor=white)](https://ai.google.dev/)
[![Render](https://img.shields.io/badge/Render-46E3B7?style=flat&logo=render&logoColor=white)](https://render.com/)

ScriptFlow Pro is a powerful, AI-powered CRM application designed for sales teams to manage leads, appointments, and call scripts efficiently.

## 🚀 Live Demo

[View Live Demo](https://scriptflow-pro.onrender.com)

## ✨ Features

### 🤖 AI-Powered Smart Import
- Parse conversation transcripts automatically
- Extract Business Name, Contact Name, Phone, Email, Date/Time, Status
- Confidence scoring (High/Medium/Low)
- Editable preview before import
- Duplicate detection (Business + Phone match)

### 📝 Call Script Management
- Create, edit, and delete scripts
- Drag to reorder scripts
- Favorite scripts for quick access
- Keyboard shortcuts (1-9)
- Auto-save functionality

### 📅 Appointment Tracking
- Calendar view with Month/Week/Day/List modes
- Filter by Meeting/Callback/Follow-up
- Quick add appointments
- Appointment details with edit/complete/cancel actions

### 👥 Prospect Management
- Full CRUD operations
- Lead scoring (0-100)
- Sentiment analysis
- Search and filter
- Statistics dashboard

### 📊 Analytics Dashboard
- Meeting performance metrics
- Status distribution charts
- Weekly trends
- Show rate tracking
- Quality score distribution
- Drill-down data exploration

### 🛡️ Objection Handler
- 4 categories: Reflex, We Don't Need It, Skeptical, Gatekeepers
- Quick search
- Copy responses
- Favorite responses
- Keyboard shortcut (Ctrl+Shift+O)

### 🔒 Security & Error Handling
- Global error handler with user-friendly error page
- Secure API key management
- Environment variable support
- CORS headers for security

## 🛠️ Technology Stack

| Technology | Purpose |
|------------|---------|
| **HTML5, CSS3, JavaScript** | Frontend |
| **Google Gemini API** | AI transcript parsing |
| **Firebase** | Database & Authentication |
| **Chart.js** | Data visualization |
| **SortableJS** | Drag-and-drop |
| **Font Awesome** | Icons |
| **Render.com** | Hosting |

## 📦 Installation

### Prerequisites

- Node.js (v18 or higher)
- Firebase account
- Google Gemini API key

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/scriptflow-pro.git
cd scriptflow-pro