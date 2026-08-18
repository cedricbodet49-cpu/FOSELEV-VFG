const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '..')));
const db = new Database(path.join(__dirname, 'foselev-vfg.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS visits (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`);

app.get('/', (req, res) => {
  res.send('FOSELEV VFG - Serveur local connecté');
});

app.get('/api/status', (req, res) => {
  res.json({
    ok: true,
    application: 'FOSELEV VFG',
    version: '1.0'
  });
});

app.get('/api/visits', (req, res) => {
  try {
    const rows = db
      .prepare('SELECT id, data, updated_at FROM visits ORDER BY updated_at DESC')
      .all();

    const visits = rows.map(row => JSON.parse(row.data));

    res.json({
      ok: true,
      visits
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

app.put('/api/visits/:id', (req, res) => {
  try {
    const visit = req.body;
    const id = req.params.id;
    const updatedAt = visit.updatedAt || new Date().toISOString();

    db.prepare(`
      INSERT INTO visits (id, data, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        data = excluded.data,
        updated_at = excluded.updated_at
    `).run(id, JSON.stringify(visit), updatedAt);

    res.json({
      ok: true,
      id,
      updatedAt
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

app.delete('/api/visits/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM visits WHERE id = ?').run(req.params.id);

    res.json({
      ok: true,
      id: req.params.id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('--------------------------------');
  console.log('FOSELEV VFG - Serveur local');
  console.log(`Serveur actif sur le port ${PORT}`);
  console.log('--------------------------------');
});