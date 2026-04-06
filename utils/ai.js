exports.generateInsight = (data, domain) => {
  if (!data || data.length === 0) {
    return { message: "ไม่มีข้อมูล" };
  }

  const peak = data.reduce((max, curr) =>
    curr.kwh > max.kwh ? curr : max
  );

  // 🏠 Household
  if (domain === "household") {
    return {
      peakHour: peak.hour,
      device: peak.hour >= 18 ? "แอร์" : "เครื่องซักผ้า",
      insight: `คุณใช้ไฟสูงสุดเวลา ${peak.hour}:00 น. 
      อุปกรณ์ที่น่าจะใช้มากคือ ${
        peak.hour >= 18 ? "เครื่องปรับอากาศ" : "เครื่องซักผ้า"
      }`,
      suggestion:
        "ลองลดการใช้ไฟช่วงเย็น หรือปรับอุณหภูมิแอร์เป็น 26°C",
    };
  }

  // 🏢 SME
  if (domain === "sme") {
    return {
      peakHour: peak.hour,
      device: "เตาอบ",
      insight: `ธุรกิจคุณใช้ไฟสูงสุดเวลา ${peak.hour}:00 น. 
      อาจเกิดจากการใช้งานเตาอบจำนวนมาก`,
      suggestion:
        "ควรกระจายการอบขนมเพื่อลด peak load",
    };
  }

  // 🏭 Factory
  if (domain === "factory") {
    return {
      peakHour: peak.hour,
      device: "เครื่องจักร",
      insight: `โหลดสูงสุดเวลา ${peak.hour}:00 น.`,
      suggestion: "ควรใช้ load shifting",
    };
  }

  return { message: "no insight" };
};