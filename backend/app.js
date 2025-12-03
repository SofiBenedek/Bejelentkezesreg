// backend/app.js
import express from "express";
import cors from "cors";//frontend külön helyről fusson
import {
  getUserByEmail,
  createUser,
  getRestaurants,
  getRestaurantWithReviews,
  createReview,
  createRestaurant,
  deleteRestaurant
} from "./data/db.js";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// REGISZTRÁCIÓ
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json("Hiányzó adat");
  if (getUserByEmail(email)) return res.status(400).json("Már van ilyen email");
  createUser(email, password, "user");
  res.status(201).json({ message: "Regisztráció ok" });
});

// BEJELENTKEZÉS
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email);
  if (!user || user.password !== password)
    return res.status(401).json("Hibás email vagy jelszó");
  res.json({
    message: "Bejelentkezés ok",
    user: { id: user.id, email: user.email, role: user.role } // így visszaküljük jsonba úgy hogy a frontend nem kapja meg a jelszót
  });
});

// ÉTTERMEK LISTA
app.get("/api/restaurants", (req, res) => {
  res.json(getRestaurants());
});

// EGY ÉTTEREM + ÉRTÉKELÉSEK
app.get("/api/restaurants/:id", (req, res) => {
  const rest = getRestaurantWithReviews(req.params.id);
  if (!rest) return res.status(404).json("Nincs ilyen étterem"); //késöbbi dolgokhoz ez egyenlőre még sose fogja kiaddni mert nincs benne keresés
  res.json(rest);
});

// ÚJ ÉRTÉKELÉS
app.post("/api/reviews", (req, res) => {
  const { restaurantId, userId, rating, comment } = req.body;
  if (!restaurantId || !userId || !rating)
    return res.status(400).json("Hiányzó adat");
  createReview(restaurantId, userId, rating, comment || "");// ez akár üres értékelést is tud csinálni és "" el nem lesz az adatbázisba benne null 
  res.status(201).json({ message: "Értékelés mentve" });
});

// ÚJ ÉTTEREM (admin)
app.post("/api/restaurants", (req, res) => {
  const { email, password, name, location } = req.body;
  const user = getUserByEmail(email);
  if (!user || user.password !== password || user.role !== "admin") //egy kezdetleges védelem
    return res.status(403).json("Nem admin"); // 403 = access elutasítva
  if (!name || !location) return res.status(400).json("Hiányzó adat");
  createRestaurant(name, location);
  res.status(201).json({ message: "Étterem mentve" });
});
// ÉTTEREM TÖRLÉSE (admin)
// DELETE /api/restaurants/:id
app.delete("/api/restaurants/:id", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email);

  if (!user || user.password !== password || user.role !== "admin") {
    return res.status(403).json("Nem admin");
  }

  deleteRestaurant(req.params.id);
  res.json({ message: "Étterm törölve" });
});


// SZERVER INDÍTÁS
app.listen(PORT, () => {
  console.log("Server: http://localhost:" + PORT);
});
