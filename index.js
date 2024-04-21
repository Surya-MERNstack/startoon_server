const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const router = require("./controller/router");
const cors = require("cors");
 
dotenv.config();
const db_url = process.env.MongoDB
const port = process.env.PORT || 5000;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ["http://localhost:5173", "https://startoonclient.netlify.app"],
    credentials: true,
  })
);

mongoose.connect(db_url);
const Db = mongoose.connection;
 
try {
  Db.on("open", (req, res) => {
    console.log("mongoose is connected!!");
  });
} catch (err) { 
  console.log(err);
}

app.use("/dashboard", router);
app.listen(port, () => {
  console.log(`server is running http://localhost:${port}`);
});
