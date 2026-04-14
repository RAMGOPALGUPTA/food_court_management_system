const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 🔌 DATABASE CONNECTION
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Ram@2006", // 🔴 CHANGE THIS
    database: "EATOO"
});

db.connect(err => {
    if (err) throw err;
    console.log("MySQL Connected...");
});

// ✅ GET FOOD MENU
app.get("/foods", (req, res) => {
    const query = `
        SELECT f.food_id AS id, f.name, f.price, v.vendor_name AS vendor
        FROM Food_Items f
        JOIN Vendors v ON f.vendor_id = v.vendor_id
    `;
    db.query(query, (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});

// ✅ PLACE ORDER
app.post("/order", (req, res) => {
    const { student_id, items, total } = req.body;

    if (!student_id || !items || items.length === 0) {
        return res.status(400).json({ error: "Invalid order data" });
    }

    db.query(
        "INSERT INTO Orders(student_id, total_amount) VALUES (?, ?)",
        [student_id, total],
        (err, result) => {
            if (err) throw err;

            const order_id = result.insertId;

            const values = items.map(item => [
                order_id,
                item.id,
                1
            ]);

            db.query(
                "INSERT INTO Order_Details(order_id, food_id, quantity) VALUES ?",
                [values],
                (err2) => {
                    if (err2) throw err2;
                    res.json({ order_id });
                }
            );
        }
    );
});

// ✅ TOP RATED
app.get("/top-rated", (req, res) => {
    const query = `
        SELECT f.name, AVG(r.rating) AS rating
        FROM Food_Items f
        JOIN Reviews r ON f.food_id = r.food_id
        GROUP BY f.food_id
        ORDER BY rating DESC
        LIMIT 5
    `;
    db.query(query, (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});

// 🚀 START SERVER
app.listen(5000, () => {
    console.log("Server running on port 5000");
});

// ✅ ADD REVIEW
app.post("/add-review", (req, res) => {
    const { student_id, food_id, rating, comment } = req.body;

    if (!student_id || !food_id || !rating) {
        return res.status(400).json({ error: "Missing fields" });
    }

    const query = `
        INSERT INTO Reviews(student_id, food_id, rating, comment)
        VALUES (?, ?, ?, ?)
    `;

    db.query(query, [student_id, food_id, rating, comment], (err) => {
        if (err) throw err;
        res.json({ message: "Review added successfully" });
    });
});

app.post("/register", (req, res) => {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "Missing fields" });
    }

    const query = `
        INSERT INTO Students(name, email, phone, password)
        VALUES (?, ?, ?, ?)
    `;

    db.query(query, [name, email, phone, password], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "User already exists or DB error" });
        }

        res.json({
            message: "Registered successfully",
            student_id: result.insertId
        });
    });
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;

    const query = `
        SELECT * FROM Students WHERE email = ? AND password = ?
    `;

    db.query(query, [email, password], (err, result) => {
        if (err) throw err;

        if (result.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        res.json({
            message: "Login successful",
            student: result[0]
        });
    });
});