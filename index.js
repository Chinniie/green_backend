const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// Import Routes
const authRoutes = require("./routes/auth");
const energyRoutes = require("./routes/energy");
const reportRoutes = require("./routes/report");
const aiRoutes = require("./routes/ai");
const iotRoutes = require("./routes/iot");
const settingsRoutes = require("./routes/settings");
const billRoutes = require("./routes/bill");
const leadRoutes = require("./routes/leads"); // ✅ NEW: เพิ่มบรรทัดนี้

// --- 🛠️ จัดระเบียบ API Path ---
app.use("/api/auth", authRoutes);
app.use("/api/energy", energyRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/bill", billRoutes);
app.use("/api/iot", iotRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/leads", leadRoutes); // ✅ NEW: เพิ่มบรรทัดนี้ (URL: /api/leads/collect)

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
