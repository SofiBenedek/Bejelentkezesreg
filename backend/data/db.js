// data/db.js
import Database from "better-sqlite3";

// adatbázis fájl (ha nincs, létrejön)
const db = new Database("./data/database.sqlite");

// FELHASZNÁLÓK TÁBLA
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT
  )
`).run();

// ---- ADATBÁZIS FÜGGVÉNYEK ----

// felhasználó lekérése email alapján
export const getUserByEmail = (email) =>
  db.prepare("SELECT * FROM users WHERE email = ?").get(email);

// új felhasználó mentése
export const createUser = (email, password) =>
  db.prepare("INSERT INTO users (email, password) VALUES (?, ?)").run(email, password);

// összes user (jelszó nélkül)
export const getAllUsers = () =>
  db.prepare("SELECT id, email FROM users").all();

// KEZDŐ TESZT USER, HA NINCS MÉG SENKI
const users = getAllUsers();
if (users.length === 0) {
  createUser("teszt@pelda.hu", "jelszo123");
  console.log("Létrehozva a teszt user: teszt@pelda.hu / jelszo123");
}
