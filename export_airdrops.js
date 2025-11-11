const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");

// Connect to database
const db = new sqlite3.Database("sindhu.db", (err) => {
  if (err) return console.error("❌ DB open error:", err.message);
  console.log("✅ Connected to sindhu.db");
});

// Query and export users
db.all("SELECT id, username, wallet, tokens FROM users", [], (err, rows) => {
  if (err) {
    console.error("❌ DB error:", err.message);
    return;
  }

  if (!rows.length) {
    console.log("⚠️ No users found in database.");
    return;
  }

  const csv = [
    "ID,Username,Wallet,Tokens",
    ...rows.map(
      (r) => `${r.id},"${r.username || ""}",${r.wallet || ""},${r.tokens || 0}`
    ),
  ].join("\n");

  fs.writeFileSync("airdrops.csv", csv);
  console.log("✅ Export complete! File saved as airdrops.csv");
});

db.close();
