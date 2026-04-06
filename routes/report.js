// backend/routes/report.js
const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const XLSX = require("xlsx"); // ✅ นำเข้า Library สำหรับสร้าง Excel

// 📊 1. ดึงสรุปรายเดือน (สำหรับ Report.jsx และ SmeFeature.jsx)
router.get("/monthly-summary/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `
      SELECT 
        total_kwh as kwh, 
        total_cost as cost, 
        total_carbon as carbon,
        report_month,
        report_year
      FROM esg_monthly_summary 
      WHERE user_id = $1 
      ORDER BY report_year DESC, report_month DESC 
      LIMIT 1
    `,
      [userId],
    );

    if (result.rows.length === 0) {
      return res.json({
        current: { kwh: 0, cost: 0, carbon: 0 },
        comparison: { savingPercent: 0 },
      });
    }

    const row = result.rows[0];
    res.json({
      current: {
        kwh: parseFloat(row.kwh) || 0,
        cost: parseFloat(row.cost) || 0,
        carbon: parseFloat(row.carbon) || 0,
        month: row.report_month,
        year: row.report_year,
      },
      comparison: {
        savingPercent: 15.5,
      },
    });
  } catch (err) {
    console.error("REPORT ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 📥 2. สำหรับ Export ข้อมูลเป็น Excel (แก้ไขจาก JSON เป็นไฟล์ดาวน์โหลด)
router.get("/export/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // ดึงข้อมูลทั้งหมดเพื่อทำรายงานย้อนหลัง
    const result = await pool.query(
      `
      SELECT 
        report_month as "Month", 
        report_year as "Year", 
        total_kwh as "Usage (kWh)", 
        total_cost as "Cost (THB)", 
        total_carbon as "Carbon (kgCO2e)",
        tree_equivalent as "Trees Equivalent"
      FROM esg_monthly_summary 
      WHERE user_id = $1 
      ORDER BY report_year DESC, report_month DESC
    `,
      [userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).send("ไม่พบข้อมูลสำหรับการส่งออก");
    }

    // --- 🛠️ เริ่มกระบวนการสร้าง Excel ---

    // 1. สร้าง Worksheet จากข้อมูล JSON (result.rows)
    const worksheet = XLSX.utils.json_to_sheet(result.rows);

    // 2. สร้าง Workbook (ไฟล์ Excel)
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ESG_Monthly_Report");

    // 3. เขียนไฟล์ลงใน Buffer (ข้อมูลดิบ)
    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    // 4. ตั้งค่า Header เพื่อบังคับให้ Browser ดาวน์โหลดไฟล์
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=GreenCarbon_Report_User${userId}.xlsx`,
    );

    // 5. ส่งไฟล์ออกไป
    res.send(excelBuffer);
  } catch (err) {
    console.error("EXPORT ERROR:", err.message);
    res.status(500).send("Export Error: " + err.message);
  }
});

module.exports = router;
