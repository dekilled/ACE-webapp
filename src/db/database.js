import Database from 'better-sqlite3'
import { v4 as uuidv4 } from 'uuid'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const DB_PATH = join(__dirname, '../../data/ace.db')

// Ensure data directory exists
const dataDir = join(__dirname, '../../data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

let db = null

export function getDB() {
  if (!db) {
    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
    initializeTables(db)
  }
  return db
}

function initializeTables(database) {
  // Tabela de cidades
  database.exec(`
    CREATE TABLE IF NOT EXISTS cities (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Tabela de bairros
  database.exec(`
    CREATE TABLE IF NOT EXISTS neighborhoods (
      id TEXT PRIMARY KEY,
      city_id TEXT NOT NULL,
      name TEXT NOT NULL,
      code TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (city_id) REFERENCES cities(id)
    )
  `)

  // Tabela de RGs (Registro Geográfico - quarteirões)
  database.exec(`
    CREATE TABLE IF NOT EXISTS rgs (
      id TEXT PRIMARY KEY,
      neighborhood_id TEXT NOT NULL,
      code TEXT NOT NULL,
      description TEXT,
      cycle_start_date DATE,
      cycle_end_date DATE,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (neighborhood_id) REFERENCES neighborhoods(id)
    )
  `)

  // Tabela de imóveis
  database.exec(`
    CREATE TABLE IF NOT EXISTS properties (
      id TEXT PRIMARY KEY,
      rg_id TEXT NOT NULL,
      street_name TEXT NOT NULL,
      number TEXT,
      property_type TEXT NOT NULL CHECK(property_type IN ('R', 'C', 'TB', 'OUT', 'PE')),
      residents_count INTEGER DEFAULT 0,
      dogs_count INTEGER DEFAULT 0,
      cats_count INTEGER DEFAULT 0,
      latitude REAL,
      longitude REAL,
      notes TEXT,
      order_index INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (rg_id) REFERENCES rgs(id)
    )
  `)

  // Tabela de agentes
  database.exec(`
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      registration_number TEXT UNIQUE,
      phone TEXT,
      email TEXT,
      active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Tabela de visitas
  database.exec(`
    CREATE TABLE IF NOT EXISTS visits (
      id TEXT PRIMARY KEY,
      property_id TEXT NOT NULL,
      agent_id TEXT NOT NULL,
      visit_date DATE NOT NULL,
      visit_status TEXT NOT NULL CHECK(visit_status IN ('visited', 'closed', 'refused', 'absent')),
      eliminated_foci INTEGER DEFAULT 0,
      treated_foci INTEGER DEFAULT 0,
      larvicide_grams REAL DEFAULT 0,
      guidance_provided BOOLEAN DEFAULT 0,
      notes TEXT,
      latitude REAL,
      longitude REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (property_id) REFERENCES properties(id),
      FOREIGN KEY (agent_id) REFERENCES agents(id)
    )
  `)

  // Tabela de depósitos (focos)
  database.exec(`
    CREATE TABLE IF NOT EXISTS deposits (
      id TEXT PRIMARY KEY,
      visit_id TEXT NOT NULL,
      deposit_type TEXT NOT NULL,
      deposit_classification TEXT,
      found_larvae BOOLEAN DEFAULT 0,
      eliminated BOOLEAN DEFAULT 0,
      treated BOOLEAN DEFAULT 0,
      larvicide_grams REAL DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (visit_id) REFERENCES visits(id)
    )
  `)

  // Tabela de ciclos de trabalho
  database.exec(`
    CREATE TABLE IF NOT EXISTS work_cycles (
      id TEXT PRIMARY KEY,
      year INTEGER NOT NULL,
      cycle_number INTEGER NOT NULL CHECK(cycle_number BETWEEN 1 AND 6),
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      status TEXT DEFAULT 'planned',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Tabela de resumos diários
  database.exec(`
    CREATE TABLE IF NOT EXISTS daily_summaries (
      id TEXT PRIMARY KEY,
      agent_id TEXT NOT NULL,
      summary_date DATE NOT NULL,
      total_visited INTEGER DEFAULT 0,
      total_closed INTEGER DEFAULT 0,
      total_refused INTEGER DEFAULT 0,
      total_absent INTEGER DEFAULT 0,
      total_eliminated INTEGER DEFAULT 0,
      total_treated INTEGER DEFAULT 0,
      total_larvicide_grams REAL DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (agent_id) REFERENCES agents(id)
    )
  `)

  // Índices para melhor performance
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_properties_rg ON properties(rg_id);
    CREATE INDEX IF NOT EXISTS idx_visits_property ON visits(property_id);
    CREATE INDEX IF NOT EXISTS idx_visits_agent ON visits(agent_id);
    CREATE INDEX IF NOT EXISTS idx_visits_date ON visits(visit_date);
    CREATE INDEX IF NOT EXISTS idx_deposits_visit ON deposits(visit_id);
  `)
}

export function closeDB() {
  if (db) {
    db.close()
    db = null
  }
}

// Funções utilitárias para CRUD
export const dbHelpers = {
  // Cities
  createCity(name) {
    const db = getDB()
    const id = uuidv4()
    const stmt = db.prepare('INSERT INTO cities (id, name) VALUES (?, ?)')
    stmt.run(id, name)
    return { id, name }
  },

  getAllCities() {
    const db = getDB()
    return db.prepare('SELECT * FROM cities ORDER BY name').all()
  },

  // Neighborhoods
  createNeighborhood(cityId, name, code) {
    const db = getDB()
    const id = uuidv4()
    const stmt = db.prepare('INSERT INTO neighborhoods (id, city_id, name, code) VALUES (?, ?, ?, ?)')
    stmt.run(id, cityId, name, code)
    return { id, city_id: cityId, name, code }
  },

  getNeighborhoodsByCity(cityId) {
    const db = getDB()
    return db.prepare('SELECT * FROM neighborhoods WHERE city_id = ? ORDER BY name').all(cityId)
  },

  // RGs
  createRG(neighborhoodId, code, description) {
    const db = getDB()
    const id = uuidv4()
    const stmt = db.prepare('INSERT INTO rgs (id, neighborhood_id, code, description) VALUES (?, ?, ?, ?)')
    stmt.run(id, neighborhoodId, code, description)
    return { id, neighborhood_id: neighborhoodId, code, description }
  },

  getRGsByNeighborhood(neighborhoodId) {
    const db = getDB()
    return db.prepare('SELECT * FROM rgs WHERE neighborhood_id = ? ORDER BY code').all(neighborhoodId)
  },

  updateRG(id, updates) {
    const db = getDB()
    const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ')
    const values = [...Object.values(updates), id]
    const stmt = db.prepare(`UPDATE rgs SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    stmt.run(...values)
  },

  deleteRG(id) {
    const db = getDB()
    const stmt = db.prepare('DELETE FROM rgs WHERE id = ?')
    stmt.run(id)
  },

  // Properties
  createProperty(rgId, streetName, number, propertyType, residentsCount = 0, dogsCount = 0, catsCount = 0, orderIndex = 0) {
    const db = getDB()
    const id = uuidv4()
    const stmt = db.prepare(`
      INSERT INTO properties (id, rg_id, street_name, number, property_type, residents_count, dogs_count, cats_count, order_index) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(id, rgId, streetName, number, propertyType, residentsCount, dogsCount, catsCount, orderIndex)
    return { id, rg_id: rgId, street_name: streetName, number, property_type: propertyType, residents_count: residentsCount, dogs_count: dogsCount, cats_count: catsCount, order_index: orderIndex }
  },

  getPropertiesByRG(rgId) {
    const db = getDB()
    return db.prepare('SELECT * FROM properties WHERE rg_id = ? ORDER BY order_index, street_name, number').all(rgId)
  },

  updateProperty(id, updates) {
    const db = getDB()
    const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ')
    const values = [...Object.values(updates), id]
    const stmt = db.prepare(`UPDATE properties SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    stmt.run(...values)
  },

  deleteProperty(id) {
    const db = getDB()
    const stmt = db.prepare('DELETE FROM properties WHERE id = ?')
    stmt.run(id)
  },

  movePropertyOrder(id, newOrderIndex) {
    const db = getDB()
    const stmt = db.prepare('UPDATE properties SET order_index = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    stmt.run(newOrderIndex, id)
  },

  // Agents
  createAgent(name, registrationNumber, phone, email) {
    const db = getDB()
    const id = uuidv4()
    const stmt = db.prepare('INSERT INTO agents (id, name, registration_number, phone, email) VALUES (?, ?, ?, ?, ?)')
    stmt.run(id, name, registrationNumber, phone, email)
    return { id, name, registration_number: registrationNumber, phone, email }
  },

  getAllAgents() {
    const db = getDB()
    return db.prepare('SELECT * FROM agents WHERE active = 1 ORDER BY name').all()
  },

  // Visits
  createVisit(propertyId, agentId, visitDate, visitStatus, eliminatedFoci = 0, treatedFoci = 0, larvicideGrams = 0, guidanceProvided = false, notes) {
    const db = getDB()
    const id = uuidv4()
    const stmt = db.prepare(`
      INSERT INTO visits (id, property_id, agent_id, visit_date, visit_status, eliminated_foci, treated_foci, larvicide_grams, guidance_provided, notes) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(id, propertyId, agentId, visitDate, visitStatus, eliminatedFoci, treatedFoci, larvicideGrams, guidanceProvided ? 1 : 0, notes)
    return { id, property_id: propertyId, agent_id: agentId, visit_date: visitDate, visit_status: visitStatus, eliminated_foci: eliminatedFoci, treated_foci: treatedFoci, larvicide_grams: larvicideGrams, guidance_provided: guidanceProvided, notes }
  },

  getVisitsByProperty(propertyId) {
    const db = getDB()
    return db.prepare('SELECT * FROM visits WHERE property_id = ? ORDER BY visit_date DESC').all(propertyId)
  },

  getVisitsByAgentAndDate(agentId, date) {
    const db = getDB()
    return db.prepare('SELECT v.*, p.street_name, p.number, p.property_type FROM visits v JOIN properties p ON v.property_id = p.id WHERE v.agent_id = ? AND v.visit_date = ?').all(agentId, date)
  },

  updateVisit(id, updates) {
    const db = getDB()
    const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ')
    const values = [...Object.values(updates), id]
    const stmt = db.prepare(`UPDATE visits SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    stmt.run(...values)
  },

  // Daily Summaries
  createDailySummary(agentId, summaryDate) {
    const db = getDB()
    const id = uuidv4()
    const stmt = db.prepare('INSERT INTO daily_summaries (id, agent_id, summary_date) VALUES (?, ?, ?)')
    stmt.run(id, agentId, summaryDate)
    return { id, agent_id: agentId, summary_date: summaryDate }
  },

  getDailySummary(agentId, date) {
    const db = getDB()
    return db.prepare('SELECT * FROM daily_summaries WHERE agent_id = ? AND summary_date = ?').get(agentId, date)
  },

  updateDailySummaryStats(agentId, date) {
    const db = getDB()
    const stmt = db.prepare(`
      UPDATE daily_summaries SET
        total_visited = (SELECT COUNT(*) FROM visits WHERE agent_id = ? AND visit_date = ? AND visit_status = 'visited'),
        total_closed = (SELECT COUNT(*) FROM visits WHERE agent_id = ? AND visit_date = ? AND visit_status = 'closed'),
        total_refused = (SELECT COUNT(*) FROM visits WHERE agent_id = ? AND visit_date = ? AND visit_status = 'refused'),
        total_absent = (SELECT COUNT(*) FROM visits WHERE agent_id = ? AND visit_date = ? AND visit_status = 'absent'),
        total_eliminated = (SELECT COALESCE(SUM(eliminated_foci), 0) FROM visits WHERE agent_id = ? AND visit_date = ?),
        total_treated = (SELECT COALESCE(SUM(treated_foci), 0) FROM visits WHERE agent_id = ? AND visit_date = ?),
        total_larvicide_grams = (SELECT COALESCE(SUM(larvicide_grams), 0) FROM visits WHERE agent_id = ? AND visit_date = ?),
        updated_at = CURRENT_TIMESTAMP
      WHERE agent_id = ? AND summary_date = ?
    `)
    stmt.run(
      agentId, date, agentId, date, agentId, date, agentId, date,
      agentId, date, agentId, date, agentId, date,
      agentId, date
    )
  }
}
