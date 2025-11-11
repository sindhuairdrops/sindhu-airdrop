const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = new sqlite3.Database("sindhu.db");

// ✅ User Login via Telegram WebApp Data
app.post("/auth", (req, res) => {
  const { id } = req.body;
  if (!id) return res.json({ error: "Missing user id" });

  db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
    if (!row) {
      db.run("INSERT INTO users (id, coins, energy) VALUES (?, 0, 50)", [id]);
      return res.json({ id, coins: 0, energy: 50 });
    }
    res.json(row);
  });
});

// ✅ Add Coins on Tap
app.post("/tap", (req, res) => {
  const { id } = req.body;
  if (!id) return res.json({ error: "Missing user id" });

  db.run("UPDATE users SET coins = coins + 1 WHERE id = ?", [id], () => {
    db.get("SELECT coins FROM users WHERE id = ?", [id], (err, row) => {
      res.json(row);
    });
  });
});

app.listen(3000, () => {
  console.log("✅ WebApp API Live on port 3000");
});
