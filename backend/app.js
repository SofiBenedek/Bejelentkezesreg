// app.js
import express from "express";
import cors from "cors";
import * as db from "./data/db.js";

const PORT = 3000;
const app = express();

// köztes rétegek
app.use(cors());          // frontend másik portra -> engedélyezzük
app.use(express.json());  // JSON body olvasása

// --- REGISZTRÁCIÓ ---
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json("Hiányzó adatok (email vagy jelszó)");
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(400).json("Ezzel az email címmel már van regisztráció");
  }

  try {
    db.createUser(email, password);
    const user = db.getUserByEmail(email);

    return res.status(201).json({
      message: "Sikeres regisztráció",
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json("Szerver hiba regisztráció közben");
  }
});

// --- BEJELENTKEZÉS ---
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json("Hiányzó adatok (email vagy jelszó)");
  }

  const user = db.getUserByEmail(email);

  if (!user || user.password !== password) {
    return res.status(401).json("Hibás email vagy jelszó");
  }

  return res.status(200).json({
    message: "Sikeres bejelentkezés",
    user: {
      id: user.id,
      email: user.email
    }
  });
});

// --- CSAK TESZTNEK: összes user ---
app.get("/users", (req, res) => {
  const users = db.getAllUsers();
  res.status(200).json(users);
});

// --- SZERVER INDÍTÁS ---
app.listen(PORT, () => {
  console.log("Server runs on port: " + PORT);
});
