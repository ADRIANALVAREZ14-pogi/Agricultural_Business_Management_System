import React, { useState, useEffect } from 'react';
import api from '../services/api';

const BabuyanGrowthHealth = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');

  const [weights, setWeights] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [mortalities, setMortalities] = useState([]);
  const [linkedUsage, setLinkedUsage] = useState([]);
  const [waterLogs, setWaterLogs] = useState([]);

  // Weight Form State
  const [weightEditId, setWeightEditId] = useState(null);
  const [avgWeight, setAvgWeight] = useState('');
  const [weightDate, setWeightDate] = useState(new Date().toISOString().split('T')[0]);
  const [weightNotes, setWeightNotes] = useState('');

  // Vaccination Form State
  const [vacEditId, setVacEditId] = useState(null);
  const [vaccineName, setVaccineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [vacDate, setVacDate] = useState(new Date().toISOString().split('T')[0]);
  const [administeredBy, setAdministeredBy] = useState('');

  // Mortality Form State
  const [mortEditId, setMortEditId] = useState(null);
  const [headsLost, setHeadsLost] = useState('');
  const [causeOfDeath, setCauseOfDeath] = useState('');
  const [mortDate, setMortDate] = useState(new Date().toISOString().split('T')[0]);

  // Water Consumption Form State
  const [litersConsumed, setLitersConsumed] = useState('');
  const [waterDate, setWaterDate] = useState(new Date().toISOString().split('T')[0]);

  const loadBatchData = async (batchIdToLoad) => {
    const targetBatch = batchIdToLoad || selectedBatch;
    if (!targetBatch) return;

    const res = await api.get(/babuyan/growth-health/${targetBatch});
    setBatches(res.data.batches);
    setWeights(res.data.weights);
    setVaccinations(res.data.vaccinations);
    setMortalities(res.data.mortalities);
    setLinkedUsage(res.data.linkedUsage);
    setWaterLogs(res.data.waterLogs);
  };

  useEffect(() => {
    const initLoad = async () => {
      const res = await api.get('/babuyan/batches');
      const batchList = res.data || [];
      setBatches(batchList);
      if (batchList.length > 0) {
        setSelectedBatch(batchList[0].batch_id);
        loadBatchData(batchList[0].batch_id);
      }
    };
    initLoad();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      loadBatchData(selectedBatch);
    }
  }, [selectedBatch]);

  const handleWeightSubmit = async (e) => {
    e.preventDefault();
    if (weightEditId) {
      await api.put(/babuyan/growth-health/weight/${weightEditId}, {
        average_weight_kg: avgWeight,
        record_date: weightDate,
        notes: weightNotes,
      });
    } else {
      await api.post('/babuyan/growth-health/weight', {
        batch_id: selectedBatch,
        average_weight_kg: avgWeight,
        record_date: weightDate,
        notes: weightNotes,
      });
    }
    setWeightEditId(null);
    setAvgWeight('');
    setWeightNotes('');
    loadBatchData(selectedBatch);
  };

  const handleVaccinationSubmit = async (e) => {
    e.preventDefault();
    if (vacEditId) {
      await api.put(/babuyan/growth-health/vaccination/${vacEditId}, {
        vaccine_name: vaccineName,
        dosage,
        vaccination_date: vacDate,
        administered_by: administeredBy,
      });
    } else {
      await api.post('/babuyan/growth-health/vaccination', {
        batch_id: selectedBatch,
        vaccine_name: vaccineName,
        dosage,
        vaccination_date: vacDate,
        administered_by: administeredBy,
      });
    }
    setVacEditId(null);
    setVaccineName('');
    setDosage('');
    setAdministeredBy('');
    loadBatchData(selectedBatch);
  };

  const handleMortalitySubmit = async (e) => {
    e.preventDefault();
    if (mortEditId) {
      await api.put(/babuyan/growth-health/mortality/${mortEditId}, {
        heads_lost: headsLost,
        cause_of_death: causeOfDeath,
        mortality_date: mortDate,
      });
    } else {
      await api.post('/babuyan/growth-health/mortality', {
        batch_id: selectedBatch,
        heads_lost: headsLost,
        cause_of_death: causeOfDeath,
        mortality_date: mortDate,
      });
    }
    setMortEditId(null);
    setHeadsLost('');
    setCauseOfDeath('');
    loadBatchData(selectedBatch);
  };

  const handleWaterSubmit = async (e) => {
    e.preventDefault();
    await api.post('/babuyan/growth-health/water', {
      batch_id: selectedBatch,
      liters_consumed: litersConsumed,
      log_date: waterDate,
    });
    setLitersConsumed('');
    loadBatchData(selectedBatch);
  };

  return (
    <div>
      <h2>Livestock Growth & Health Monitoring</h2>

      <div>
        <label>Select Pig Batch: </label>
        <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)}>
          <option value="">-- Select Batch --</option>
          {batches.map((b) => (
            <option key={b.batch_id} value={b.batch_id}>
              {b.batch_name ? ${b.batch_id} - ${b.batch_name} : b.batch_id} ({b.number_of_heads} active heads)
            </option>
          ))}
        </select>
      </div>

      {selectedBatch && (
        <div>
          <hr />

          <h3>Batch Weight Monitoring</h3>
          <form onSubmit={handleWeightSubmit}>
            <input
              type="number"
              step="0.01"
              placeholder="Average Weight (kg)"
              value={avgWeight}
              onChange={(e) => setAvgWeight(e.target.value)}
              required
            />
            <input
              type="date"
              value={weightDate}
              onChange={(e) => setWeightDate(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Notes"
              value={weightNotes}
              onChange={(e) => setWeightNotes(e.target.value)}
            />
            <button type="submit">{weightEditId ? 'Update Weight' : 'Add Weight Record'}</button>
          </form>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Average Weight (kg)</th>
                <th>Notes</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {weights.map((w) => (
                <tr key={w.id}>
                  <td>{w.record_date}</td>
                  <td>{w.average_weight_kg} kg</td>
                  <td>{w.notes || '-'}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => {
                        setWeightEditId(w.id);
                        setAvgWeight(w.average_weight_kg);
                        setWeightDate(w.record_date);
                        setWeightNotes(w.notes || '');
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <hr />

          <h3>Batch Vaccination Records</h3>
          <form onSubmit={handleVaccinationSubmit}>
            <input
              type="text"
              placeholder="Vaccine Name"
              value={vaccineName}
              onChange={(e) => setVaccineName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Dosage"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              required
            />
            <input
              type="date"
              value={vacDate}
              onChange={(e) => setVacDate(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Administered By"
              value={administeredBy}
              onChange={(e) => setAdministeredBy(e.target.value)}
            />
            <button type="submit">{vacEditId ? 'Update Vaccination' : 'Add Vaccination'}</button>
          </form>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Vaccine</th>
                <th>Dosage</th>
                <th>Administered By</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {vaccinations.map((v) => (
                <tr key={v.id}>
                  <td>{v.vaccination_date}</td>
                  <td>{v.vaccine_name}</td>
                  <td>{v.dosage}</td>
                  <td>{v.administered_by || '-'}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => {
                        setVacEditId(v.id);
                        setVaccineName(v.vaccine_name);
                        setDosage(v.dosage);
                        setVacDate(v.vaccination_date);
                        setAdministeredBy(v.administered_by || '');
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <hr />

          <h3>Batch Mortality Records</h3>
          <form onSubmit={handleMortalitySubmit}>
            <input
              type="number"
              min="1"
              placeholder="Heads Lost"
              value={headsLost}
              onChange={(e) => setHeadsLost(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Cause of Death"
              value={causeOfDeath}
              onChange={(e) => setCauseOfDeath(e.target.value)}
              required
            />
            <input
              type="date"
              value={mortDate}
              onChange={(e) => setMortDate(e.target.value)}
              required
            />
            <button type="submit">{mortEditId ? 'Update Mortality' : 'Record Mortality'}</button>
          </form>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Heads Lost</th>
                <th>Cause of Death</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {mortalities.map((m) => (
                <tr key={m.id}>
                  <td>{m.mortality_date}</td>
                  <td>{m.heads_lost}</td>
                  <td>{m.cause_of_death}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => {
                        setMortEditId(m.id);
                        setHeadsLost(m.heads_lost);
                        setCauseOfDeath(m.cause_of_death);
                        setMortDate(m.mortality_date);
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <hr />

          <h3>Daily Consumption Logs ({selectedBatch})</h3>

          <h4>Feed, Medicine & Vitamin Usage (Linked from Staff Records)</h4>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Item</th>
                <th>Quantity Consumed</th>
              </tr>
            </thead>
            <tbody>
              {linkedUsage.map((u) => (
                <tr key={u.id}>
                  <td>{u.log_date}</td>
                  <td>{u.category}</td>
                  <td>{u.item_name}</td>
                  <td>{u.quantity} {u.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h4>Daily Water Consumption Log</h4>
          <form onSubmit={handleWaterSubmit}>
            <input
              type="number"
              step="0.01"
              placeholder="Water Consumed (Liters)"
              value={litersConsumed}
              onChange={(e) => setLitersConsumed(e.target.value)}
              required
            />
            <input
              type="date"
              value={waterDate}
              onChange={(e) => setWaterDate(e.target.value)}
              required
            />
            <button type="submit">Log Water Consumption</button>
          </form>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Liters Consumed</th>
              </tr>
            </thead>
            <tbody>
              {waterLogs.map((w) => (
                <tr key={w.id}>
                  <td>{w.log_date}</td>
                  <td>{w.liters_consumed} L</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BabuyanGrowthHealth;