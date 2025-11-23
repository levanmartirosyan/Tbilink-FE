# 🌐 Tbilink - Angular Social Media Platform

![Tbilink Logo](https://github.com/levanmartirosyan/Tbilink-FE/blob/main/public/favicon1.ico)

**Tbilink** is a modern social media web application built with **Angular 20** for the frontend, **ASP.NET Web API** for the backend, and **Supabase (PostgreSQL)** as the database. It offers rich features like:

- Real-time messaging
- Video & voice calls
- Group chats
- User profiles with mutual friends
- Dark mode / light mode theme switching
- Responsive design for mobile and desktop

This project uses only APIs from the frontend. The backend and database are handled separately with ASP.NET Web API and Supabase.

---

## 📑 Table of Contents

| Section | Link |
|---------|------|
| Live Preview | [🖤 Live Preview](#-live-preview) |
| Features | [💻 Features](#-features) |
| Technologies | [⚡ Technologies Used](#-technologies-used) |
| Getting Started | [🚀 Getting Started](#-getting-started) |
| Project Structure | [🛠 Project Structure](#-project-structure) |
| Commands Cheat Sheet | [💻 Commands Cheat Sheet](#-commands-cheat-sheet) |
| Notes | [📌 Notes](#-notes) |

---

## 🖤 Live Preview

> You can clone this repository and run it locally to see it in action.

---

## 💻 Features

- **User Authentication:** Sign up, login, password recovery and email verification flows.
- **Messaging & Calls:** Real-time messaging, voice and video calls, group chat support.
- **Friend System:** Add, remove, and manage friends.
- **Profile & Privacy:** Edit profile, follow people, manage privacy settings.
- **Dark/Light Theme:** Switch themes dynamically using the theme switcher.
- **Responsive UI:** Fully mobile-friendly layout.

---

## ⚡ Technologies Used

| Frontend | Backend | Database |
|----------|---------|----------|
| Angular 20 | ASP.NET Web API | Supabase (PostgreSQL) |
| RxJS | C# | PostgreSQL |
|  SCSS | REST APIs |  |
| Lucide Icons | JWT Authentication |  |

---

## 🚀 Getting Started

Follow these steps to run **Tbilink** locally.

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/levanmartirosyan/Tbilink-FE.git

cd Tbilink-FE
```

2️⃣ Install Dependencies
```bash
npm install
```

This will install all required Angular packages.

3️⃣ Start the Development Server
```bash
ng serve
```

The app will run at: http://localhost:4200/

Any changes in code will automatically reload the app.

4️⃣ Connect Backend API

Make sure your ASP.NET Web API is running.

Update the API URL in your Angular environment file:

```TypeScript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'https://your-backend-api.com/api'
};
```

5️⃣ Supabase Database

Ensure your Supabase PostgreSQL database is set up.

Frontend only interacts with backend APIs, so no direct DB setup in frontend is required.

## 🛠 Project Structure
```bash
Tbilink-FE/
│
├─ src/
│  ├─ app/
│  │  ├─ components/       # Reusable components like buttons, inputs
│  │  ├─ pages/            # Pages like Feed, Messenger, Profile
│  │  ├─ services/         # Angular services for API calls
│  │  ├─ guards/           # Route guards for authentication
│  │  ├─ pipes/            # Custom pipes like masked email
│  │  └─ app-routing.module.ts
│  ├─ assets/              # Images, icons, logos
│  └─ environments/        # Environment variables
│
├─ angular.json
├─ package.json
└─ README.md
```

## 💻 Commands Cheat Sheet
# Install dependencies
```bash
npm install
```

# Run the app locally
```bash
ng serve
```

# Build for production
```bash
ng build --prod
```

# Lint the code
```bash
ng lint
```
# Run tests
```bash
ng test
```

## 📌 Notes

This project is frontend-only; backend APIs are required to fully test messaging, calls, and group chat features.

Supabase is used as the database for backend only; the frontend consumes APIs.
