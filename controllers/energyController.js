exports.getEnergyData = async (req, res) => {
  const data = [];

  for (let i = 0; i < 24; i++) {
    data.push({
      hour: i,
      kwh: Math.floor(Math.random() * 10) + 1,
    });
  }

  res.json(data);
};