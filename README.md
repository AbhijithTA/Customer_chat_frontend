

---

# 💬 Customer Support Chat System – Frontend

This is the **frontend** for the real-time customer support chat system built with **React**, **TypeScript**, **Tailwind CSS**, and **Socket.IO**. It connects seamlessly with the backend to enable multi-role functionality (Customer, Agent, Admin) for real-time ticket management and support communication.

---
🌐 Live Demo
👉 https://customer-chat-frontend.vercel.app/

⚠️ Note: The backend server is hosted on Render's free tier, so it may take 20–30 seconds to respond when idle. Please be patient on first load.
---


## 🚀 Features

### 🧑‍💼 User Roles

* **Customer**

  * Register and login.
  * Create support tickets with subject, message, and priority.
  * Engage in real-time chat with assigned agents.
  * Track ticket status (Open / Assigned / Resolved / Closed).

* **Agent**

  * Login and view assigned tickets.
  * Real-time chat with customers.
  * Mark tickets as resolved or closed.
 

* **Admin**

  * View all tickets.
  * Assign tickets to agents.
  * Monitor conversation and manage ticket status.

---

## 🛠️ Tech Stack

* **Frontend:** React + TypeScript
* **Styling:** Tailwind CSS
* **Real-time Communication:** Socket.IO Client
* **State & Context:** React Context API (Authentication)
* **Routing:** React Router

---

## 📦 Folder Structure

```
├── src/
│   ├── api/               # Axios instance with credentials
│   ├── components/        # Reusable components (Navbar, ChatBox)
│   ├── context/           # AuthContext for user authentication
│   ├── pages/             # Role-specific dashboards
│   ├── routes/            # React Router routes
│   └── socket.ts          # Socket.IO client instance
├── tailwind.config.js     # Tailwind setup
├── tsconfig.json          # TypeScript config
└── README.md              # Project overview
```

---



## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/AbhijithTA/Customer_chat_frontend
cd customer-support-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root:

```env
REACT_APP_API_URL=http://localhost:5000
```

Ensure that your backend allows CORS and supports `credentials: true` for cookies.

### 4. Run the App

```bash
npm run dev
```

The app will start at: [http://localhost:5173](http://localhost:5173)

---

## ✅ Core Pages Implemented

| Role     | Page                         | Status |
| -------- | ---------------------------- | ------ |
| Customer | Login / Signup               | ✅      |
|          | Create Ticket                | ✅      |
|          | Real-time Chat Interface     | ✅      |
| Agent    | Dashboard + Assigned Tickets | ✅      |
|          | Chat Interface               | ✅      |
| Admin    | View All Tickets             | ✅      |
|          | Manual Ticket Assignment     | ✅      |
|          | Ticket Status Management     | ✅      |

---

## 🔐 Authentication Flow

* JWT Token is stored in `HttpOnly` cookies.
* All requests use `withCredentials: true` via a centralized Axios instance.
* User details are fetched from `/api/auth/me` and stored in context.

---

## 💡 Highlights

* **Optimistic UI**: Messages appear instantly with `tempId` support.
* **Alignment Fix**: Sent and received messages are correctly aligned based on sender.
* **Duplicate Prevention**: Handled via ID checks on real-time socket messages.
* **Typing Indicator**: (Extendable) base socket logic is ready to support typing events.
* **Responsive Design**: Tailwind used to ensure cross-device compatibility.

---

## 🧪 Testing Instructions

* Run frontend (`npm run dev`) and backend (`npm run dev`).
* Create users for all 3 roles: Customer, Agent, Admin.
* Test:

  * Ticket creation
  * Assignment by Admin
  * Chat in real time
  * Ticket status changes

---

