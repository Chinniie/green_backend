const pool = require("../config/db");
const bcrypt = require("bcrypt");

exports.register = async (req, res) => {
  try {
    console.log("REGISTER BODY:", req.body); // 🔥 debug

    // รับ email เพิ่มเข้ามาจาก req.body (ซึ่งอาจจะเป็นค่าว่าง "" หรือ null)
    const { username, password, domain, email } = req.body;

    // ✅ Validation (Email ไม่ต้องบังคับกรอกในขั้นตอนนี้)
    if (!username || !password || !domain) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // ✅ Check duplicate username
    const checkUser = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username],
    );

    if (checkUser.rows.length > 0) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    // --- ธุรกิจ Logic: กำหนดสถานะการใช้งาน ---
    let subscription_status = "free";
    let trial_start = null;
    let trial_end = null;
    const now = new Date();

    if (domain === "sme" || domain === "factory") {
      subscription_status = "trial";
      trial_start = now;
      trial_end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 วัน
    }

    if (domain === "utility") {
      subscription_status = "active";
    }

    // ✅ เพิ่มการบันทึกคอลัมน์ email
    // ถ้า email ที่ส่งมาเป็นค่าว่าง ให้บันทึกเป็น null เพื่อให้เช็คง่ายในอนาคต
    const finalEmail = email && email.trim() !== "" ? email : null;

    const result = await pool.query(
      `INSERT INTO users 
      (username, password, email, role, domain, subscription_status, trial_start, trial_end)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, username, email, domain, subscription_status`,
      [
        username,
        hashed,
        finalEmail,
        "user",
        domain,
        subscription_status,
        trial_start,
        trial_end,
      ],
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Register failed" });
  }
};

exports.login = async (req, res) => {
  try {
    console.log("LOGIN BODY:", req.body); // 🔥 debug

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password" });
    }

    // ✅ ส่ง email กลับไปด้วย เพื่อให้ Frontend ตรวจสอบได้ว่า "มีเมลหรือยัง"
    res.json({
      id: user.id,
      username: user.username,
      email: user.email, // ถ้าไม่มีจะเป็น null
      domain: user.domain,
      subscription_status: user.subscription_status,
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
