Agrove is a high-performance, industrial-themed web application designed for modern agricultural management. It transforms complex farm data into a digital "Command Center," allowing farmers to monitor field health, financial architecture, and operational logs with tactical precision.

![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)

---

## 🚀 Key Features

- **Industrial Bento Dashboard**: A modular, glassmorphic interface featuring real-time weather (Open-Meteo), localized market news, and government schemes.
- **Financial Architecture**: Advanced cost-vs-revenue tracking visualized through high-contrast horizontal bar charts.
- **Terminal Operations Log**: A command-line inspired activity tracker for logging sowing, irrigation, and harvesting with monospaced data precision.
- **Sharp UI Engine**: A custom CSS theme focused on brutalist design—zero rounded corners, tactical offset shadows, and neon-green accents.
- **Recycle Bin System**: Safety-first data management allowing for the restoration of deleted fields or activities.
- **Multilingual (i18n)**: Native support for English, Hindi, and Marathi.

---

## 🛠️ Tech Stack

**Frontend:**
- **Framework**: React.js (Vite)
- **Animations**: GSAP & Framer Motion
- **Data Viz**: Recharts (Custom Industrial Implementation)
- **Localization**: i18next

**Backend:**
- **Environment**: Node.js & Express
- **Database**: MongoDB (Atlas)
- **Authentication**: JWT (JSON Web Tokens)
- **Reporting**: XLSX for automated Excel report generation

---

## 🎨 Design Language

Agrove follows a **Brutalist Industrial Aesthetic**:
- **Primary Accent**: `#39ff14` (Neon Green)
- **Danger Accent**: `#ef4444` (Tactical Red)
- **Base Surface**: `#050505` (Carbon Black)
- **Geometry**: `0px border-radius` (Strict Sharp Edges)
- **Depth**: `15px 15px 0px` (Blocky Offset Shadows)

---

## 📦 Installation & Setup

1. **Clone the Terminal**
   ```bash
   git clone [https://github.com/yourusername/agrove.git](https://github.com/yourusername/agrove.git)
   cd agrove
Configure Environment Create a .env file in the root directory:

Code snippet

VITE_API_URL=http://localhost:3000/api
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
Initialize Dependencies

Bash

npm install
Launch Development Environment

Bash

npm run dev
