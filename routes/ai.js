const express = require("express");
const router = express.Router();
const pool = require("../config/db");

const { generateInsight } = require("../utils/ai");

router.get("/insight", async (req, res) => {
  const { domain } = req.query;

  const result = await pool.query("SELECT * FROM energy_usage");

  const insight = generateInsight(result.rows, domain);

  res.json(insight);
});

module.exports = router;