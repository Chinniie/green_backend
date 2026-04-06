const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  // 1. แนะนำให้ใช้ connectionString ตัวเดียวจบครับ เพราะใน Render เราจะก๊อปค่าจาก Neon มาวางได้เลย
  connectionString: process.env.DATABASE_URL,

  // 2. สำคัญมาก: ต้องเปิด SSL สำหรับ Neon
  ssl: {
    rejectUnauthorized: false, // บังคับให้ยอมรับใบเซอร์ของ Neon
  },
});

pool.on("connect", () => {
  console.log("🐘 [PostgreSQL] Connected successfully!");
});

pool.on("error", (err) => {
  console.error("❌ [PostgreSQL] Connection error:", err.message);
});

module.exports = pool;
