const db = require('../config/db');

// ==========================================
// 3.5 LIVESTOCK GROWTH AND HEALTH MONITORING
// ==========================================

// Retrieve per-batch weight, vaccination, mortality, and linked feed/medicine/vitamin/water logs
exports.getBatchGrowthAndHealth = async (req, res) => {
  const { batch_id } = req.params;

  try {
    const [batches] = await db.query(
      SELECT batch_id, batch_name, number_of_heads FROM pig_batches ORDER BY id DESC
    );

    const [weights] = await db.query(
      `SELECT id, batch_id, average_weight_kg, record_date, notes
       FROM babuyan_weight_records
       WHERE batch_id = ?
       ORDER BY record_date DESC, id DESC`,
      [batch_id]
    );

    const [vaccinations] = await db.query(
      `SELECT id, batch_id, vaccine_name, dosage, vaccination_date, administered_by
       FROM babuyan_vaccination_records
       WHERE batch_id = ?
       ORDER BY vaccination_date DESC, id DESC`,
      [batch_id]
    );

    const [mortalities] = await db.query(
      `SELECT id, batch_id, heads_lost, cause_of_death, mortality_date
       FROM babuyan_mortality_records
       WHERE batch_id = ?
       ORDER BY mortality_date DESC, id DESC`,
      [batch_id]
    );

    // Linked feed, medicine, and vitamin usage recorded by Babuyan staff for this batch
    const [linkedUsage] = await db.query(
      `SELECT u.id, u.release_date AS log_date, i.category, i.item_name, u.quantity_released AS quantity, i.unit
       FROM babuyan_usage_records u
       JOIN babuyan_inventory i ON u.inventory_id = i.id
       WHERE u.batch_id = ?
       ORDER BY u.release_date DESC, u.id DESC`,
      [batch_id]
    );

    // Daily water consumption per batch (where client wants it tracked)
    const [waterLogs] = await db.query(
      `SELECT id, batch_id, liters_consumed, log_date
       FROM babuyan_water_consumption
       WHERE batch_id = ?
       ORDER BY log_date DESC, id DESC`,
      [batch_id]
    );

    res.status(200).json({
      batches,
      weights,
      vaccinations,
      mortalities,
      linkedUsage,
      waterLogs,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve growth and health records.', error: error.message });
  }
};

// Store & update per-batch weight records
exports.addBatchWeightRecord = async (req, res) => {
  const { batch_id, average_weight_kg, record_date, notes } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO babuyan_weight_records (batch_id, average_weight_kg, record_date, notes)
       VALUES (?, ?, ?, ?)`,
      [batch_id, average_weight_kg, record_date, notes || null]
    );
    res.status(201).json({ id: result.insertId, batch_id, average_weight_kg, record_date, notes });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add weight record.', error: error.message });
  }
};

exports.updateBatchWeightRecord = async (req, res) => {
  const { id } = req.params;
  const { average_weight_kg, record_date, notes } = req.body;

  try {
    await db.query(
      `UPDATE babuyan_weight_records
       SET average_weight_kg = ?, record_date = ?, notes = ?
       WHERE id = ?`,
      [average_weight_kg, record_date, notes || null, id]
    );
    res.status(200).json({ message: 'Weight record updated.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update weight record.', error: error.message });
  }
};

// Store & update per-batch vaccination records
exports.addBatchVaccinationRecord = async (req, res) => {
  const { batch_id, vaccine_name, dosage, vaccination_date, administered_by } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO babuyan_vaccination_records (batch_id, vaccine_name, dosage, vaccination_date, administered_by)
       VALUES (?, ?, ?, ?, ?)`,
      [batch_id, vaccine_name, dosage, vaccination_date, administered_by || null]
    );
    res.status(201).json({ id: result.insertId, batch_id, vaccine_name, dosage, vaccination_date, administered_by });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add vaccination record.', error: error.message });
  }
};

exports.updateBatchVaccinationRecord = async (req, res) => {
  const { id } = req.params;
  const { vaccine_name, dosage, vaccination_date, administered_by } = req.body;

  try {
    await db.query(
      `UPDATE babuyan_vaccination_records
       SET vaccine_name = ?, dosage = ?, vaccination_date = ?, administered_by = ?
       WHERE id = ?`,
      [vaccine_name, dosage, vaccination_date, administered_by || null, id]
    );
    res.status(200).json({ message: 'Vaccination record updated.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update vaccination record.', error: error.message });
  }
};

// Store & update per-batch mortality records (adjusts active heads in pig_batches)
exports.addBatchMortalityRecord = async (req, res) => {
  const { batch_id, heads_lost, cause_of_death, mortality_date } = req.body;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO babuyan_mortality_records (batch_id, heads_lost, cause_of_death, mortality_date)
       VALUES (?, ?, ?, ?)`,
      [batch_id, heads_lost, cause_of_death, mortality_date]
    );

    await connection.query(
      UPDATE pig_batches SET number_of_heads = number_of_heads - ? WHERE batch_id = ?,
      [heads_lost, batch_id]
    );

    await connection.commit();
    res.status(201).json({ id: result.insertId, batch_id, heads_lost, cause_of_death, mortality_date });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Failed to add mortality record.', error: error.message });
  } finally {
    connection.release();
  }
};

exports.updateBatchMortalityRecord = async (req, res) => {
  const { id } = req.params;
  const { heads_lost, cause_of_death, mortality_date } = req.body;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [existing] = await connection.query(
      SELECT batch_id, heads_lost FROM babuyan_mortality_records WHERE id = ?,
      [id]
    );

    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Mortality record not found.' });
    }

    const diff = Number(heads_lost) - Number(existing[0].heads_lost);

    await connection.query(
      `UPDATE babuyan_mortality_records
       SET heads_lost = ?, cause_of_death = ?, mortality_date = ?
       WHERE id = ?`,
      [heads_lost, cause_of_death, mortality_date, id]
    );

    await connection.query(
      UPDATE pig_batches SET number_of_heads = number_of_heads - ? WHERE batch_id = ?,
      [diff, existing[0].batch_id]
    );

    await connection.commit();
    res.status(200).json({ message: 'Mortality record updated.' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Failed to update mortality record.', error: error.message });
  } finally {
    connection.release();
  }
};

// Store daily water consumption per batch
exports.addBatchWaterConsumption = async (req, res) => {
  const { batch_id, liters_consumed, log_date } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO babuyan_water_consumption (batch_id, liters_consumed, log_date)
       VALUES (?, ?, ?)`,
      [batch_id, liters_consumed, log_date]
    );
    res.status(201).json({ id: result.insertId, batch_id, liters_consumed, log_date });
  } catch (error) {
    res.status(500).json({ message: 'Failed to record water consumption.', error: error.message });
  }
};