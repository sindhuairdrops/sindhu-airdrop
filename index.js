const TelegramBot = require("node-telegram-bot-api");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// 🔹 Replace with your own values:
const TOKEN = "8119485421:AAG_G0vHLw9KgPDCVPzSd2I5qzM5VPbIXm4";
const WEBAPP_URL = "https://uncommenting-marcelo-charily.ngrok-free.dev";

const bot = new TelegramBot(TOKEN, { polling: true });
const logoPath = path.join(__dirname, "logo.jpg");

// ✅ SQLite DB
const db = new sqlite3.Database("sindhu.db");
db.run(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  coins INTEGER DEFAULT 0,
  energy INTEGER DEFAULT 50,
  wallet TEXT
)
`);

function getUser(id, cb) {
  db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
    if (!row) {
      db.run(
        "INSERT INTO users (id, coins, energy) VALUES (?, 0, 50)",
        [id],
        () => cb({ id, coins: 0, energy: 50 })
      );
    } else cb(row);
  });
}

// ✅ UI Menu
function sendMainMenu(chatId) {
  bot.sendPhoto(chatId, logoPath, {
    caption: "🔥 Welcome to Sindhu Airdrop!\nEarn tokens every day 🎯",
    reply_markup: {
      inline_keyboard: [
        [{ text: "🪙 Press to Earn", web_app: { url: WEBAPP_URL } }],
        [{ text: "🏆 Leaderboard", callback_data: "leaderboard" }],
        [{ text: "🎁 Referral", callback_data: "referral" }],
        [{ text: "💰 Wallet", callback_data: "wallet" }]
      ]
    }
  });
}

// ✅ /start
bot.onText(/\/start(.*)?/, (msg, match) => {
  const userId = msg.from.id;
  const ref = match[1] ? parseInt(match[1].trim()) : null;

  getUser(userId, () => {
    if (ref && ref !== userId) {
      db.run("UPDATE users SET coins = coins + 200 WHERE id=?", [ref]);
      bot.sendMessage(ref, "🎉 You earned +200 coins from a referral!");
    }
    sendMainMenu(userId);
  });
});

// ✅ WebApp data (from index.html)
bot.on("web_app_data", (msg) => {
  const userId = msg.from.id;
  const data = JSON.parse(msg.web_app_data.data);
  const tapCount = data.taps;

  db.run(
    "UPDATE users SET coins = coins + ?, energy = energy - ? WHERE id=?",
    [tapCount, tapCount, userId]
  );

  bot.sendMessage(userId, `🔥 +${tapCount} Coins Earned!`);
});

// ✅ Leaderboard, Referral, Wallet
bot.on("callback_query", (query) => {
  const userId = query.from.id;
  const action = query.data;

  if (action === "leaderboard") {
    db.all(
      "SELECT id, coins FROM users ORDER BY coins DESC LIMIT 10",
      (err, rows) => {
        let text = "🏆 Top Players 🏆\n\n";
        rows.forEach((u, i) => {
          text += `${i + 1}. User ${u.id} — ${u.coins} 🪙\n`;
        });
        bot.sendMessage(userId, text);
      }
    );
  }

  if (action === "referral") {
    bot.sendMessage(
      userId,
      `👥 Your invite link:\nhttps://t.me/SindhuAirdrop_bot?start=${userId}`
    );
  }

  if (action === "wallet") {
    bot.sendMessage(userId, "💳 Send your wallet address (Polygon - 0x...)");
  }
});

// ✅ Save wallet
bot.on("message", (msg) => {
  if (msg.text.startsWith("0x")) {
    db.run("UPDATE users SET wallet=? WHERE id=?", [msg.text, msg.from.id]);
    bot.sendMessage(msg.from.id, "✅ Wallet Connected!");
  }
});

console.log("✅ Sindhu Airdrop Bot Running...");

