const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// 🔌 ดึงรายการปลั๊ก/อุปกรณ์ของ User
router.get("/iot/devices/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query("SELECT * FROM devices WHERE user_id = $1", [userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔘 สลับสถานะเปิด-ปิด (Toggle)
router.post("/iot/toggle", async (req, res) => {
  const { deviceId, status } = req.body;
  try {
    const result = await pool.query(
      "UPDATE devices SET is_active = $1 WHERE id = $2 RETURNING *",
      [status, deviceId]
    );
    res.json({ success: true, device: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;