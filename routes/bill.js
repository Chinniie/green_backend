// backend/routes/bill.js
const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// 🧾 [POST] /api/bill/decode
router.post("/decode", async (req, res) => {
  try {
    const { userId, kwh, amount } = req.body;

    // 1. คำนวณ Insight (เราทำที่ Backend เพื่อความแม่นยำ)
    const carbon = (Number(kwh) * 0.5072).toFixed(2);
    const trees = Math.ceil(carbon / 9);
    const avgCost = (amount / kwh).toFixed(2);

    // 2. บันทึกข้อมูลลง Database (ถ้าคุณมีตาราง household_bills แล้ว)
    // ถ้ายังไม่มีตาราง ให้ Comment ส่วนนี้ไว้ก่อนได้ครับ
    /*
    await pool.query(
      "INSERT INTO household_bills (user_id, total_kwh, total_amount) VALUES ($1, $2, $3)",
      [userId, kwh, amount]
    );
    */

    // 3. ส่งผลลัพธ์กลับไปให้ Frontend
    res.json({
      insights: {
        carbon,
        trees,
        avgCost,
      },
    });
  } catch (err) {
    console.error("DECODE ERROR:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
