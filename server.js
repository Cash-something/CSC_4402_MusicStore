const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

const sql = require('mssql/msnodesqlv8');
const config = {
  server: "DESKTOP-32J9JL0\SQLEXPRESS",
  database: "MusicStore",
  driver: "msnodesqlv8",
  port: 1433,
  options: { trustedConnection: true,
    trustServerCertificate: true },
   };


app.get("/inventory", async (req, res) => {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request()
      .query(`SELECT p.Title, p.Artist, f.FormatName, i.Quantity, p.Price
              FROM Inventory i
              JOIN Products p ON i.ProductID = p.ProductID
              JOIN Formats f ON i.FormatID = f.FormatID`);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
