# ScriptFlow Pro - Smart CRM for Sales Teams

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

ScriptFlow Pro is a production-ready Smart CRM application designed for sales teams to manage leads, appointments, call scripts, objections, tasks, closers, and analytics with AI-assisted Smart Import and CRM automation.

## 🚀 Features

### Core Functionality
- **Authentication**: Google Sign-In and Email/Password authentication with persistent sessions
- **Offline Support**: Works online with Firebase and offline with localStorage fallback
- **Real-time Sync**: Firestore real-time listeners for instant data updates
- **Dark/Light Theme**: Fully themed UI with persistent preference

### Call Script Management
- Complete CRUD operations for scripts
- Drag-and-drop reordering
- Favorite/star toggle
- Auto-save with 1-second debounce
- Version tracking
- Copy to clipboard
- Keyboard shortcuts 1–9 for instant switching

### Smart Import
- Parse key-value data, natural-language transcripts, bullet points, CSV, and mixed formats
- Automatically extract: Business Name, Contact Name, Phone, Email, Date, Time, Status, Role, Assigned, Closer, Notes, Tags, CRM Link
- Confidence scoring (High/Medium/Low) with visual badges
- Inline editing before saving
- Duplicate detection with fuzzy matching
- Individual and batch saving

### Appointment Calendar
- Month, Week, Day, and List views
- Smooth view transitions
- Filter by Meetings, Callbacks, Follow-ups
- Quick Add with form validation
- Appointment detail modal with Edit, Complete, Cancel, Reschedule
- Drag-to-reschedule
- Color-coded events
- Statuses: Hot Transfer, Warm Callback, Completed, Pending, Canceled, Meeting Booked, Rescheduled, Overdue, Held

### Analytics Dashboard
- Real-time statistics: Total Pipeline, Hot Transfers, Warm Callbacks, Completed, Pending, Canceled
- Conversion Rate and Goal Progress
- Team performance metrics
- Lead score (0–100)
- Status distribution donut chart
- Weekly trend line chart
- Export analytics/report data to CSV

### Objection Handler
- Four categories: Reflex Brush-Offs, We Don't Need It, Skeptical Questions, Gatekeepers
- Search objections with result count
- Expand/collapse individual cards
- Expand all / collapse all
- One-click copy response
- Practice mode with role-play simulation
- Recommended response reveal

### Closer Management
- Complete CRUD for closers
- Activate/deactivate
- Set default closer
- Assign to appointments via dropdown

### Task & Follow-Up Management
- Description, Due date, Priority (High/Medium/Low)
- Appointment relationship
- Completion status
- Filters: All, Pending, Today
- Task counts and progress tracking

### Bulk Actions
- Select multiple appointments
- Change Status, Add Tag, Delete Selected, Export Selected
- Validation and confirmation for destructive actions

### Global Search
- Search across Appointments, Tasks, Scripts, and Closers
- Real-time filtering
- Interactive result cards
- Empty-state handling

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl + Shift + I | Smart Import |
| C | Calendar |
| S | Scripts |
| F | Search |
| A | Quick Add |
| H | Analytics |
| M | Closers |
| ? | Shortcut Help |
| E | Export |
| Ctrl + Shift + T | Toggle Theme |
| R | Refresh |
| B | Bulk Actions |
| Ctrl + Shift + O | Objection Handler |
| 1–9 | Switch Script |
| Escape | Close modal/panel |

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- Firebase account with Firestore enabled
- Modern web browser

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/scriptflow-pro.git
cd scriptflow-pro
Install dependencies

bash
npm install
Configure Firebase

Create a Firebase project at https://console.firebase.google.com

Enable Authentication (Google and Email/Password)

Create a Firestore database

Update assets/js/firebase-config.js with your Firebase configuration

javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
Set up Firestore Security Rules

javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
Start the development server

bash
npm run dev
Open your browser
Navigate to http://localhost:3000

🚀 Deployment
Deploy to Render
Click the "Deploy to Render" button above or follow these steps:

Fork this repository to your GitHub account

Create a new Web Service on Render

Connect your GitHub repository

Use the settings from render.yaml or configure manually:

Build Command: npm install

Publish Directory: .

Environment: Static Site

Deploy to Firebase Hosting
bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init hosting

# Deploy
firebase deploy
Deploy to Netlify
Drag and drop the project folder to Netlify's drop zone

Or connect your GitHub repository

Build command: npm install

Publish directory: .

📁 Project Structure
text
scriptflow-pro/
├── index.html                    # Main HTML file
├── package.json                  # Dependencies and scripts
├── render.yaml                   # Render deployment configuration
├── README.md                     # Documentation
├── assets/
│   ├── css/
│   │   └── style.css            # Complete styles with dark/light theme
│   └── js/
│       ├── app.js               # Main application logic
│       ├── firebase-config.js   # Firebase configuration
│       ├── loading.js           # Loading screen manager
│       ├── objection-handler.js # Objection handler module
│       └── import-enhancements.js # Smart import engine
🛠️ Technology Stack
Frontend: Vanilla JavaScript (SPA)

Backend: Firebase Firestore

Authentication: Firebase Auth (Google + Email/Password)

Charts: Chart.js

Icons: Font Awesome

Fonts: Google Fonts (Inter)

Hosting: Any static hosting (Render, Firebase, Netlify, Vercel)

📊 Data Models
Appointment
javascript
{
  id: string,
  business: string,
  contactName: string,
  role: string,
  phone: string,
  email: string,
  time: string,
  date: string,
  status: string,
  assigned: string,
  closer: string,
  notes: string,
  tags: string,
  crmLink: string,
  createdAt: timestamp
}
Script
javascript
{
  id: string,
  name: string,
  content: string,
  version: number,
  favorite: boolean,
  createdAt: timestamp
}
Task
javascript
{
  id: string,
  description: string,
  dueDate: string,
  priority: string,
  appointmentId: string,
  completed: boolean,
  createdAt: timestamp
}
Closer
javascript
{
  id: string,
  name: string,
  email: string,
  phone: string,
  active: boolean,
  default: boolean
}
🔒 Security
Firebase Authentication with secure sign-in methods

Firestore Security Rules restrict access to user's own data

All sensitive operations require authentication

Offline data stored only locally in user's browser

🧪 Testing
The application includes sample data for testing:

5 sample appointments

4 sample scripts

4 sample tasks

3 sample closers

3 sample team members

10 sample objections

🎨 Customization
Colors
The theme system uses CSS variables for easy customization:

css
:root {
  --accent: #6366f1;      /* Primary accent color */
  --success: #34d399;     /* Success color */
  --warning: #fbbf24;     /* Warning color */
  --danger: #f87171;      /* Danger color */
  --info: #60a5fa;        /* Info color */
}
Adding New Statuses
Add new appointment statuses in:

getStatusColor() method in app.js

Status dropdowns in forms

Status filter options

🤝 Contributing
Fork the repository

Create your feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

📝 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments
Firebase for the backend infrastructure

Chart.js for beautiful visualizations

Font Awesome for the icon library

Google Fonts for the Inter typeface

📞 Support
For support, email support@scriptflow-pro.com or create an issue in the GitHub repository.

Made with ❤️ by the ScriptFlow Pro Team