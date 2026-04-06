const express = require("express");
const router = express.Router();
const pool = require("../config/db");

/**
 * 📥 [GET] /api/settings
 * ✅ แก้จาก "/settings" เป็น "/" 
 * เพราะใน index.js เราตั้ง app.use("/api/settings", ...) ไว้แล้ว
 */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT key, value FROM system_settings");
    
    // แปลงจาก Row เป็น Object { base_rate: 3.99, ... }
    const config = result.rows.reduce((acc, row) => ({ 
      ...acc, 
      [row.key]: row.value 
    }), {});

    // ✅ ส่ง success: true และหุ้มด้วย config ตามที่ Frontend (Context) รอรับ
    res.json({ success: true, config });
  } catch (err) {
    console.error("GET SETTINGS ERROR:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

/**
 * 📤 [POST] /api/settings/update
 * ✅ แก้จาก "/settings/update" เป็น "/update"
 */
router.post("/update", async (req, res) => {
  const settings = req.body; 
  
  try {
    await pool.query("BEGIN");
    
    for (const [key, value] of Object.entries(settings)) {
      await pool.query(
        "UPDATE system_settings SET value = $1, updated_at = NOW() WHERE key = $2",
        [value, key]
      );
    }
    
    await pool.query("COMMIT");
    res.json({ success: true, message: "Settings updated successfully" });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("UPDATE SETTINGS ERROR:", err);
    res.status(500).json({ success: false, message: "Update Failed" });
  }
});

module.exports = router;