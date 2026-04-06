// utils/energy.js

/**
 * 💰 คำนวณค่าไฟตามเรทที่ดึงมาจากฐานข้อมูล (เช่น 3.99 + FT)
 */
exports.calculateEnergyCost = (kwh, rate = 3.99) => {
  return Number(kwh || 0) * rate; //
};

/**
 * 🌿 คำนวณคาร์บอนฟุตพริ้นท์ตาม Carbon Factor ล่าสุด
 */
exports.calculateCarbon = (kwh, factor = 0.5) => {
  return Number(kwh || 0) * factor; //
};

/**
 * ⚡ ค้นหาช่วงเวลาที่มีการใช้ไฟสูงสุด (Peak Hour)
 */
exports.findPeakHour = (data) => {
  if (!data || data.length === 0) return null; //
  return data.reduce((max, curr) =>
    Number(curr.kwh || 0) > Number(max.kwh || 0) ? curr : max,
  ); //
};

/**
 * 🔧 จำลองการลดการใช้ไฟฟ้า (What-if Simulation)
 * เพิ่มพารามิเตอร์ rate และ factor เพื่อให้ตัวเลขแม่นยำตามการตั้งค่าระบบ
 */
exports.simulatePeakReduction = (data, percent, rate = 3.99, factor = 0.5) => {
  const total = data.reduce((sum, d) => sum + Number(d.kwh || 0), 0); //
  const reductionAmount = total * (percent / 100);
  const reducedTotal = total - reductionAmount; //

  return {
    originalKwh: total,
    newKwh: reducedTotal, //
    moneySaved: reductionAmount * rate, //
    carbonSaved: reductionAmount * factor, //
    // เพิ่ม ESG Metric: เทียบเท่าการปลูกต้นไม้ (สมมติ 1 ต้นดูดซับ 9 kgCO2/ปี)
    treesPlantingEquivalent: (reductionAmount * factor * 12) / 9,
  };
};
