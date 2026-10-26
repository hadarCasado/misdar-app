# Misdar App — Inspection & Report Management System

A mobile-first web application for managing housing and duty inspections. It replaces paper-based inspection forms with a fast digital workflow: filling in a structured report for each entrance on the spot, browsing past reports and generating a formatted PDF report instantly.

> **Built for mobile.** The app is fully responsive and works on desktop as well, but it was designed primarily for smartphones, so inspectors can fill in reports while walking through the buildings.

---

## 🚀 Live Demo

**[misdar-app.vercel.app](https://misdar-app.vercel.app)**

For the best experience, open the link on your phone, or use your browser's mobile view (DevTools → Toggle device toolbar).

---

## 💡 About the Project

Inspection rounds were traditionally documented on paper, which made it hard to keep a history, share findings and produce summary reports. Misdar App solves this real-world operational problem by moving the entire process to the inspector's phone:

- Fill in an inspection report for each entrance, floor by floor and room by room.
- Browse, view, edit and delete past reports.
- Manage entrance managers and room details from a dedicated settings page.
- Export all reports from a selected date into a single, formatted Hebrew PDF.

---

## Key Features

- **Mobile-first, responsive UI** — Designed primarily for smartphones, with a layout that also adapts to desktop screens.
- **Structured inspection reports** — Each report includes the inspector, the duty officer and general comments, plus a collapsible accordion of floors where issues and notes are recorded for every room. Additional locations (restrooms, lobbies) can be added on the fly.
- **Entrance navigation** — Tabs for switching quickly between building entrances, each with its own list of reports.
- **View, edit and delete** — Reports open in a read-only view, with an options menu for editing or deleting them.
- **Real-time cloud sync** — Reports and settings are stored in **Cloud Firestore** and synced across devices in real time.
- **Automated PDF export** — Select a date and export all reports from that day into a single A4 PDF, generated with **jsPDF** and **jspdf-autotable**. The PDF includes an embedded Hebrew font with right-to-left text handling, the entrance managers and a table of issues, notes and contacts per room.
- **Settings page** — Manage entrance managers and room details (population, contact name and phone number), which are shown in the reports and the PDF.
- **Global state management** — Settings are shared across the app with React's **Context API**, with built-in default values as a fallback.

---

## Tech Stack

| Category | Technologies |
| --- | --- |
| Frontend | React, JavaScript (ES6+), HTML5, CSS3 |
| State management | React Context API |
| Backend / BaaS | Firebase — Cloud Firestore |
| PDF generation | jsPDF, jspdf-autotable, embedded Hebrew font (Assistant) |
| UI icons | Lucide React |
| Build tool | Create React App |
| Deployment & tooling | Vercel, Git & GitHub |

---

## 📂 Project Structure

```text
src/
├── components/
│   ├── BuildingTabs.jsx            # Tabs for switching between entrances
│   ├── ReportCard.jsx              # Report summary card (date and inspector)
│   ├── ReportForm.jsx              # Create / view a report (floors, rooms, issues, notes)
│   ├── ReportMenu.jsx              # Report options menu (edit, delete)
│   ├── PDFGenerator.jsx            # PDF report generation (jsPDF)
│   ├── SettingsPage.jsx            # Entrance managers and room details settings
│   ├── Assistant-Regular-normal.js # Embedded Hebrew font for the PDF
│   └── *.css                       # Component styles
├── context/
│   ├── AppContext.jsx              # Global settings state, synced with Firestore
│   └── roomData.js                 # Default room data (fallback)
├── fonts/                          # Hebrew fonts (Assistant, Heebo)
├── firebase.js                     # Firebase initialization
├── App.js                          # Root component, reports state and real-time listener
└── App.css                         # Global styles
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended) and npm
- A [Firebase](https://firebase.google.com/) project with **Cloud Firestore** enabled

### Installation

1. **Clone the repository**

```bash
   git clone https://github.com/hadarCasado/misdar-app.git
   cd misdar-app
```

2. **Install dependencies**

```bash
   npm install
```

3. **Configure Firebase**

   Replace the Firebase configuration in `src/firebase.js` with the credentials of your own Firebase project.

4. **Start the development server**

```bash
   npm start
```

5. **Open the app**

   Go to [http://localhost:3000](http://localhost:3000). To preview the mobile layout, open your browser's DevTools and switch to a phone view.

### Production Build

```bash
npm run build
```

The optimized build is created in the `build/` folder.

---

## Author

**Hadar Casado** — [GitHub](https://github.com/hadarCasado)