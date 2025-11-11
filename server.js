const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port: ${PORT}`);
});
