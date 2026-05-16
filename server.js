const express = require("express");
const path = require("path");
const connectDB = require("./config/db"); // Your database connection
const { User } = require("./models/User"); 
const { RegisterUser } = require('./models/RegisterUser');

const app = express();
const PORT = 9000;

// 1. Connect to Database
connectDB();

// 2. Middleware
app.use(express.json()); 
app.use(express.urlencoded({ extended: false }));

// IMPORTANT: This tells Express where to find your CSS, JS, and Images
app.use(express.static(path.join(__dirname, "static")));

// 3. HTML Page Routes
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "static", "index.html"));
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "static", "login.html"));
});

app.get("/emi", (req, res) => {
    res.sendFile(path.join(__dirname, "static", "emi.html"));
});

// 4. API Routes (Database Logic)
app.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;
        const existingUser = await RegisterUser.findOne({ Customer: username });
        if (existingUser) return res.status(400).json({ message: "Exists!" });

        const newUser = new RegisterUser({ Customer: username, Password: password });
        await newUser.save();
        res.status(201).json({ message: "Registration successful!" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

app.post("/check-user", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await RegisterUser.findOne({ Customer: username });
        if (user && user.Password === password) {
            res.json({ valid: true });
        } else {
            res.json({ valid: false });
        }
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
});



app.get("/check-username/:username", async (req, res) => {
    try {
        const { username } = req.params;
        const user = await RegisterUser.findOne({ Customer: username });
        res.json({ exists: !!user });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

app.get("/public/emi.html", (req, res) => {
    res.redirect("/emi")
});

//Start the Server
app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
});

// Locate this block at the bottom of server.js and update it:
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 9000;
    app.listen(PORT, () => {
        console.log(`Local development server humming on port ${PORT}`);
    });
}

// CRITICAL LINE FOR VERCEL: Export your Express configuration
module.exports = app;