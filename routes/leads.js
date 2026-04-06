const express = require("express");
const router = express.Router();
const pool = require("../config/db"); // ตรวจสอบว่า path ถูกต้องตามโครงสร้างโปรเจกต์

// POST: /api/leads/collect
router.post("/collect", async (req, res) => {
  // ✅ รับ username เพิ่มมาจาก req.body
  const { email, domain, username } = req.body;

  // Validation: ตรวจสอบข้อมูลให้ครบถ้วน
  if (!email || !domain || !username) {
    return res.status(400).json({ 
      success: false, 
      message: "กรุณาระบุ Email, Domain และ Username ให้ครบถ้วน" 
    });
  }

  try {
    // ✅ อัปเดต Query ให้บันทึก username ลงในคอลัมน์ด้วย
    const query = 'INSERT INTO leads (email, domain, username) VALUES ($1, $2, $3) RETURNING *';
    const values = [email, domain, username];
    
    const result = await pool.query(query, values);
    
    console.log("✨ Lead Captured Successfully:", result.rows[0]);

    res.status(200).json({ 
      success: true, 
      message: "บันทึกข้อมูลและชื่อผู้ใช้งานเรียบร้อยแล้ว",
      data: result.rows[0] 
    });
  } catch (err) {
    console.error("❌ LEAD COLLECTION ERROR:", err.message);
    res.status(500).json({ 
      success: false, 
      message: "เกิดข้อผิดพลาดในการบันทึกข้อมูลลงฐานข้อมูล" 
    });
  }
});

module.exports = router;