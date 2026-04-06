const express = require("express");
const cors = require("cors");
const app = express();

// 1. ✅ ย้าย CORS มาไว้บนสุด และใช้แค่อันเดียวที่ตั้งค่าถูกต้องครับ
// สิ่งนี้จะอนุญาตให้หน้าเว็บ Netlify ของบอสคุยกับ Render ได้โดยไม่โดนบล็อก
app.use(cors({
  origin: function (origin, callback) {
    // 💡 ถ้าไม่มี origin (เช่นเรียกผ่าน Postman) หรือ origin ตรงกับที่เราตั้งไว้
    // หรือเป็น URL ของ Netlify ในโปรเจกต์นี้ (ใช้ regex เช็คชื่อโปรเจกต์)
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin.includes("greencarbonplatform.netlify.app")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
app.use(express.json());

// Import Routes
const authRoutes = require("./routes/auth");
const energyRoutes = require("./routes/energy");
const reportRoutes = require("./routes/report");
const aiRoutes = require("./routes/ai");
const iotRoutes = require("./routes/iot");
const settingsRoutes = require("./routes/settings");
const billRoutes = require("./routes/bill");
const leadRoutes = require("./routes/leads");

// --- 🛠️ API Path ---
app.use("/api/auth", authRoutes);
app.use("/api/energy", energyRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/bill", billRoutes);
app.use("/api/iot", iotRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/leads", leadRoutes);

// Health check
app.get("/", (req, res) => res.send("Green Carbon API Running"));

// 404 & Error Handler
app.use((req, res) => res.status(404).json({ message: "Not Found" }));
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is flying on port ${PORT}`);
});
