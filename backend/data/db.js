// backend/data/db.js
import Database from "better-sqlite3";

const db = new Database("./data/database.sqlite");

// táblák
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  password TEXT,
  role TEXT
);
CREATE TABLE IF NOT EXISTS restaurants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  location TEXT
);
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  restaurant_id INTEGER,
  user_id INTEGER,
  rating INTEGER,
  comment TEXT
);
`);

// users
export const getUserByEmail = (email) =>
  db.prepare("SELECT * FROM users WHERE email = ?").get(email);

export const createUser = (email, password, role = "user") =>
  db
    .prepare("INSERT INTO users (email, password, role) VALUES (?, ?, ?)")
    .run(email, password, role);

//egyszerű lista ki iratás
export const getRestaurants = () =>
  db.prepare(`
    SELECT r.*,
           COALESCE(AVG(rv.rating), 0) AS average_rating,
           COUNT(rv.id) AS review_count
    FROM restaurants r
    LEFT JOIN reviews rv ON rv.restaurant_id = r.id
    GROUP BY r.id
  `).all(); 

// restaurants*
//r = restaurant tábla az az id | restaurant_id | user_id | rating | comment
// Lekéri az adott éttermet, kiszámolja az értékelések átlagát és darabszámát.
// Ha nincs értékelés, az átlag 0 lesz (COALESCE).
// A LEFT JOIN miatt akkor is visszatér, ha még nincs egyetlen review sem.

export const getRestaurantWithReviews = (id) => {
  const rest = db.prepare(`
    SELECT r.*,
           COALESCE(AVG(rv.rating), 0) AS average_rating,
           COUNT(rv.id) AS review_count
    FROM restaurants r
    LEFT JOIN reviews rv ON rv.restaurant_id = r.id
    WHERE r.id = ?
    GROUP BY r.id
  `).get(id);

  if (!rest) return null;
    // u.email = jelenlegi user emaile(hogy lássouk ki írta)
  const reviews = db
    .prepare(
      `SELECT r.*, u.email AS user_email
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE restaurant_id = ?`
    )
    .all(id);
    //Hozzáadjuk a „rest” (étterem) objektumhoz a review-k listáját(a reviewbe)
  rest.reviews = reviews;
  return rest;
};


export const createRestaurant = (name, location) =>
  db
    .prepare("INSERT INTO restaurants (name, location) VALUES (?, ?)")
    .run(name, location);

// reviews
export const createReview = (restaurantId, userId, rating, comment) =>
  db
    .prepare(
      "INSERT INTO reviews (restaurant_id, user_id, rating, comment) VALUES (?, ?, ?, ?)"
    )
    .run(restaurantId, userId, rating, comment);

// egyszerű user adatok
// megszámolni az adatokat csak az indítás miatt kell
const userCount = db.prepare("SELECT COUNT(*) AS c FROM users").get().c;
if (!userCount) {
  createUser("admin@demo.hu", "admin123", "admin");
  createUser("user@demo.hu", "user123", "user");
}

const restCount = db.prepare("SELECT COUNT(*) AS c FROM restaurants").get().c;
if (!restCount) {
  createRestaurant("Pizza Ház", "Budapest");
  createRestaurant("Sushi Bár", "Debrecen");
}

export const deleteRestaurant = (id) =>
  db.prepare("DELETE FROM restaurants WHERE id = ?").run(id);
