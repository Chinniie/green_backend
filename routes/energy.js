// routes/energy.js
const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// ✅ แก้ไข: ตัด /energy ออก ให้เหลือแค่ /usage/:userId
// เพราะใน index.js เราตั้ง Prefix เป็น /api/energy ไว้แล้ว
router.get("/usage/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // 1. ดึงค่าเรทไฟปัจจุบัน
    const configRes = await pool.query(
      "SELECT key, value FROM system_settings",
    );
    const config = configRes.rows.reduce(
      (acc, row) => ({ ...acc, [row.key]: row.value }),
      {},
    );

    // 2. ดึงข้อมูลรายชั่วโมง (0-23) ของวันนี้
    // 💡 ทิป: ถ้าข้อมูลไม่ขึ้น ให้ลองเช็คว่าใน DB มีข้อมูลของวันที่ "วันนี้" จริงไหม
    // const usageRes = await pool.query(
    //   `
    //   SELECT device, kwh, hour, device_id
    //   FROM energy_usage
    //   WHERE user_id = $1 AND recorded_at >= CURRENT_DATE
    //   ORDER BY hour ASC
    // `,
    //   [userId],
    // );

    // // ส่ง success: true กลับไปด้วยเพื่อให้ Frontend เช็คเงื่อนไขง่ายขึ้น
    // res.json({ success: true, config, data: usageRes.rows });

    // routes/energy.js
      const usageRes = await pool.query(
          `
      SELECT device, kwh, hour, device_id 
      FROM energy_usage 
      WHERE user_id = $1 
      ORDER BY recorded_at DESC -- ดึงอันล่าสุดขึ้นก่อน
      LIMIT 24 -- เอามาแค่ 24 แถวพอทำกราฟ
    `,
          [userId],
    );

    // ก่อนส่งออก ให้สลับด้านข้อมูลเพื่อให้กราฟเรียงจาก 00:00 -> 23:00
    res.json({ success: true, config, data: usageRes.rows.reverse() });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
