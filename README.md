# 🍽️ EATOO – Food Court Management System

## 📌 Overview

EATOO is a full-stack Food Court Management System developed as part of a DBMS project.
It allows students to browse food items, place orders, and submit reviews, while maintaining all data using a relational database.

---

## 🚀 Features

* 🧑‍🎓 Student Registration & Login
* 🍔 Browse Food Menu from Database
* 🛒 Add to Cart & Place Orders
* ⭐ Submit Ratings & Reviews
* 📊 View Top-Rated Food Items
* 🔄 Real-time Database Updates
* 🔐 Session Handling (Login/Logout)

---

## 🏗️ Tech Stack

**Frontend:**

* HTML
* CSS
* JavaScript

**Backend:**

* Node.js
* Express.js

**Database:**

* MySQL

---

## 🧩 Database Design

The system consists of the following tables:

* Students
* Vendors
* Food_Items
* Orders
* Order_Details
* Reviews
* Payments

Key Concepts Implemented:

* DDL & DML
* Primary & Foreign Keys
* Constraints (NOT NULL, CHECK, UNIQUE)
* Joins
* Aggregate Functions
* Subqueries
* Views
* Triggers

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-link>
cd EATOO_PROJECT
```

---

### 2. Setup Database

* Open MySQL Workbench
* Run the provided SQL file to create tables and insert data

---

### 3. Setup Backend

```bash
cd backend
npm install
node server.js
```

Server will run on:
👉 http://localhost:5000

---

### 4. Run Frontend

* Open `frontend/index.html` in browser

---

## 📡 API Endpoints

| Method | Endpoint    | Description          |
| ------ | ----------- | -------------------- |
| GET    | /foods      | Fetch all food items |
| POST   | /order      | Place an order       |
| GET    | /top-rated  | Get top-rated food   |
| POST   | /add-review | Submit review        |
| POST   | /register   | Register student     |
| POST   | /login      | Login student        |

---

## 🧪 How It Works

1. User registers or logs in
2. Menu is fetched from database
3. User adds items to cart
4. Order is placed via backend API
5. Data is stored in Orders & Order_Details
6. User can submit ratings
7. Top-rated items are calculated using aggregate queries

---

## 📸 Screenshots

(Add screenshots of your UI here)

---

## 🎯 Learning Outcomes

* Practical understanding of DBMS concepts
* Experience with relational schema design
* Implementation of real-world queries
* Full-stack development integration
* Debugging and handling real-time systems

---

## 📌 Conclusion

EATOO demonstrates how database concepts are applied in real-world applications.
It integrates frontend, backend, and database to create a complete working system.

---

## 👨‍💻 Author

**Ram Gopal**
B.Tech – Full Stack Development
Chandigarh University

---
