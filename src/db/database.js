import initSqlJs from 'sql.js'
import { v4 as uuidv4 } from 'uuid'

let dbInstance = null
let SQL = null

// Initialize SQL.js
async function initDB() {
  if (!SQL) {
    SQL = await initSqlJs({
      locateFile: file => `/dist/${file}`
    })
  }
  
  if (!dbInstance) {
    dbInstance = new SQL.Database()
    initializeTables(dbInstance)
  }
  
  return dbInstance
}

export async function getDB() {
  if (!dbInstance) {
    await initDB()
  }
  return dbInstance
}

function initializeTables(database) {
  // Tabela de cidades
  database.run(`
    CREATE TABLE IF NOT EXISTS cities (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Tabela de bairros
  database.run(`
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
  database.run(`
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
  database.run(`
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
  database.run(`
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
  database.run(`
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
  database.run(`
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
  database.run(`
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
  database.run(`
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
  database.run(`CREATE INDEX IF NOT EXISTS idx_properties_rg ON properties(rg_id);`)
  database.run(`CREATE INDEX IF NOT EXISTS idx_visits_property ON visits(property_id);`)
  database.run(`CREATE INDEX IF NOT EXISTS idx_visits_agent ON visits(agent_id);`)
  database.run(`CREATE INDEX IF NOT EXISTS idx_visits_date ON visits(visit_date);`)
  database.run(`CREATE INDEX IF NOT EXISTS idx_deposits_visit ON deposits(visit_id);`)
}

export function closeDB() {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
}

// Helper functions for database operations
export const dbHelpers = {
  // Cities
  async createCity(name) {
    const db = await getDB()
    const id = uuidv4()
    db.run('INSERT INTO cities (id, name) VALUES (?, ?)', [id, name])
    return { id, name }
  },

  async getAllCities() {
    const db = await getDB()
    const stmt = db.prepare('SELECT * FROM cities ORDER BY name')
    const results = []
    while (stmt.step()) {
      const row = stmt.getAsObject()
      results.push(row)
    }
    stmt.free()
    return results
  },

  // Neighborhoods
  async createNeighborhood(cityId, name, code) {
    const db = await getDB()
    const id = uuidv4()
    db.run('INSERT INTO neighborhoods (id, city_id, name, code) VALUES (?, ?, ?, ?)', [id, cityId, name, code])
    return { id, city_id: cityId, name, code }
  },

  async getNeighborhoodsByCity(cityId) {
    const db = await getDB()
    const stmt = db.prepare('SELECT * FROM neighborhoods WHERE city_id = ? ORDER BY name')
    stmt.bind([cityId])
    const results = []
    while (stmt.step()) {
      const row = stmt.getAsObject()
      results.push(row)
    }
    stmt.free()
    return results
  },

  // RGs
  async createRG(neighborhoodId, code, description) {
    const db = await getDB()
    const id = uuidv4()
    db.run('INSERT INTO rgs (id, neighborhood_id, code, description) VALUES (?, ?, ?, ?)', [id, neighborhoodId, code, description])
    return { id, neighborhood_id: neighborhoodId, code, description }
  },

  async getRGsByNeighborhood(neighborhoodId) {
    const db = await getDB()
    const stmt = db.prepare('SELECT * FROM rgs WHERE neighborhood_id = ? ORDER BY code')
    stmt.bind([neighborhoodId])
    const results = []
    while (stmt.step()) {
      const row = stmt.getAsObject()
      results.push(row)
    }
    stmt.free()
    return results
  },

  async updateRG(id, updates) {
    const db = await getDB()
    const fields = Object.keys(updates)
    const values = Object.values(updates)
    const setClause = fields.map(k => `${k} = ?`).join(', ')
    db.run(`UPDATE rgs SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [...values, id])
  },

  async deleteRG(id) {
    const db = await getDB()
    db.run('DELETE FROM rgs WHERE id = ?', [id])
  },

  // Properties
  async createProperty(rgId, streetName, number, propertyType, residentsCount = 0, dogsCount = 0, catsCount = 0, orderIndex = 0) {
    const db = await getDB()
    const id = uuidv4()
    db.run(`
      INSERT INTO properties (id, rg_id, street_name, number, property_type, residents_count, dogs_count, cats_count, order_index) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, rgId, streetName, number, propertyType, residentsCount, dogsCount, catsCount, orderIndex])
    return { id, rg_id: rgId, street_name: streetName, number, property_type: propertyType, residents_count: residentsCount, dogs_count: dogsCount, cats_count: catsCount, order_index: orderIndex }
  },

  async getPropertiesByRG(rgId) {
    const db = await getDB()
    const stmt = db.prepare('SELECT * FROM properties WHERE rg_id = ? ORDER BY order_index, street_name, number')
    stmt.bind([rgId])
    const results = []
    while (stmt.step()) {
      const row = stmt.getAsObject()
      results.push(row)
    }
    stmt.free()
    return results
  },

  async updateProperty(id, updates) {
    const db = await getDB()
    const fields = Object.keys(updates)
    const values = Object.values(updates)
    const setClause = fields.map(k => `${k} = ?`).join(', ')
    db.run(`UPDATE properties SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [...values, id])
  },

  async deleteProperty(id) {
    const db = await getDB()
    db.run('DELETE FROM properties WHERE id = ?', [id])
  },

  async movePropertyOrder(id, newOrderIndex) {
    const db = await getDB()
    db.run('UPDATE properties SET order_index = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newOrderIndex, id])
  },

  // Agents
  async createAgent(name, registrationNumber, phone, email) {
    const db = await getDB()
    const id = uuidv4()
    db.run('INSERT INTO agents (id, name, registration_number, phone, email) VALUES (?, ?, ?, ?, ?)', [id, name, registrationNumber, phone, email])
    return { id, name, registration_number: registrationNumber, phone, email }
  },

  async getAllAgents() {
    const db = await getDB()
    const stmt = db.prepare('SELECT * FROM agents WHERE active = 1 ORDER BY name')
    const results = []
    while (stmt.step()) {
      const row = stmt.getAsObject()
      results.push(row)
    }
    stmt.free()
    return results
  },

  // Visits
  async createVisit(propertyId, agentId, visitDate, visitStatus, eliminatedFoci = 0, treatedFoci = 0, larvicideGrams = 0, guidanceProvided = false, notes = '') {
    const db = await getDB()
    const id = uuidv4()
    db.run(`
      INSERT INTO visits (id, property_id, agent_id, visit_date, visit_status, eliminated_foci, treated_foci, larvicide_grams, guidance_provided, notes) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, propertyId, agentId, visitDate, visitStatus, eliminatedFoci, treatedFoci, larvicideGrams, guidanceProvided ? 1 : 0, notes])
    return { id, property_id: propertyId, agent_id: agentId, visit_date: visitDate, visit_status: visitStatus, eliminated_foci: eliminatedFoci, treated_foci: treatedFoci, larvicide_grams: larvicideGrams, guidance_provided: guidanceProvided, notes }
  },

  async getVisitsByProperty(propertyId) {
    const db = await getDB()
    const stmt = db.prepare('SELECT * FROM visits WHERE property_id = ? ORDER BY visit_date DESC')
    stmt.bind([propertyId])
    const results = []
    while (stmt.step()) {
      const row = stmt.getAsObject()
      results.push(row)
    }
    stmt.free()
    return results
  },

  async getVisitsByAgentAndDate(agentId, date) {
    const db = await getDB()
    const stmt = db.prepare('SELECT v.*, p.street_name, p.number, p.property_type FROM visits v JOIN properties p ON v.property_id = p.id WHERE v.agent_id = ? AND v.visit_date = ?')
    stmt.bind([agentId, date])
    const results = []
    while (stmt.step()) {
      const row = stmt.getAsObject()
      results.push(row)
    }
    stmt.free()
    return results
  },

  async updateVisit(id, updates) {
    const db = await getDB()
    const fields = Object.keys(updates)
    const values = Object.values(updates)
    const setClause = fields.map(k => `${k} = ?`).join(', ')
    db.run(`UPDATE visits SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [...values, id])
  },

  // Daily Summaries
  async createDailySummary(agentId, summaryDate) {
    const db = await getDB()
    const id = uuidv4()
    db.run('INSERT INTO daily_summaries (id, agent_id, summary_date) VALUES (?, ?, ?)', [id, agentId, summaryDate])
    return { id, agent_id: agentId, summary_date: summaryDate }
  },

  async getDailySummary(agentId, date) {
    const db = await getDB()
    const stmt = db.prepare('SELECT * FROM daily_summaries WHERE agent_id = ? AND summary_date = ?')
    stmt.bind([agentId, date])
    let result = null
    if (stmt.step()) {
      result = stmt.getAsObject()
    }
    stmt.free()
    return result
  },

  async updateDailySummaryStats(agentId, date) {
    const db = await getDB()
    db.run(`
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
    `, [
      agentId, date, agentId, date, agentId, date, agentId, date,
      agentId, date, agentId, date, agentId, date,
      agentId, date
    ])
  }
}
