import { ref, computed } from 'vue'
import { dbHelpers } from '../db/database'

export function useData() {
  const cities = ref([])
  const neighborhoods = ref([])
  const rgs = ref([])
  const properties = ref([])
  const agents = ref([])
  const visits = ref([])
  const currentAgent = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Carregar cidades
  async function loadCities() {
    loading.value = true
    try {
      cities.value = dbHelpers.getAllCities()
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Carregar bairros por cidade
  async function loadNeighborhoods(cityId) {
    loading.value = true
    try {
      neighborhoods.value = dbHelpers.getNeighborhoodsByCity(cityId)
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Carregar RGs por bairro
  async function loadRGs(neighborhoodId) {
    loading.value = true
    try {
      rgs.value = dbHelpers.getRGsByNeighborhood(neighborhoodId)
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Carregar imóveis por RG
  async function loadProperties(rgId) {
    loading.value = true
    try {
      properties.value = dbHelpers.getPropertiesByRG(rgId)
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Carregar agentes
  async function loadAgents() {
    loading.value = true
    try {
      agents.value = dbHelpers.getAllAgents()
      if (agents.value.length > 0 && !currentAgent.value) {
        currentAgent.value = agents.value[0]
      }
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Definir agente atual
  function setCurrentAgent(agent) {
    currentAgent.value = agent
  }

  // Criar visita
  async function createVisit(propertyId, visitData) {
    loading.value = true
    try {
      if (!currentAgent.value) {
        throw new Error('Nenhum agente selecionado')
      }
      
      const today = new Date().toISOString().split('T')[0]
      const visit = dbHelpers.createVisit(
        propertyId,
        currentAgent.value.id,
        visitData.visitDate || today,
        visitData.visitStatus,
        visitData.eliminatedFoci || 0,
        visitData.treatedFoci || 0,
        visitData.larvicideGrams || 0,
        visitData.guidanceProvided || false,
        visitData.notes
      )
      
      // Atualizar resumo diário
      const summary = dbHelpers.getDailySummary(currentAgent.value.id, today)
      if (!summary) {
        dbHelpers.createDailySummary(currentAgent.value.id, today)
      }
      dbHelpers.updateDailySummaryStats(currentAgent.value.id, today)
      
      return visit
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Atualizar visita
  async function updateVisit(visitId, updates) {
    loading.value = true
    try {
      dbHelpers.updateVisit(visitId, updates)
      
      // Atualizar resumo diário
      const today = new Date().toISOString().split('T')[0]
      dbHelpers.updateDailySummaryStats(currentAgent.value.id, today)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Obter visitas do dia
  function getTodayVisits() {
    if (!currentAgent.value) return []
    const today = new Date().toISOString().split('T')[0]
    return dbHelpers.getVisitsByAgentAndDate(currentAgent.value.id, today)
  }

  // Obter resumo do dia
  function getTodaySummary() {
    if (!currentAgent.value) return null
    const today = new Date().toISOString().split('T')[0]
    return dbHelpers.getDailySummary(currentAgent.value.id, today)
  }

  // Estatísticas calculadas
  const stats = computed(() => {
    const todayVisits = getTodayVisits()
    return {
      total: todayVisits.length,
      visited: todayVisits.filter(v => v.visit_status === 'visited').length,
      closed: todayVisits.filter(v => v.visit_status === 'closed').length,
      absent: todayVisits.filter(v => v.visit_status === 'absent').length,
      refused: todayVisits.filter(v => v.visit_status === 'refused').length,
      eliminatedFoci: todayVisits.reduce((sum, v) => sum + (v.eliminated_foci || 0), 0),
      treatedFoci: todayVisits.reduce((sum, v) => sum + (v.treated_foci || 0), 0),
      larvicideGrams: todayVisits.reduce((sum, v) => sum + (v.larvicide_grams || 0), 0).toFixed(1)
    }
  })

  return {
    cities,
    neighborhoods,
    rgs,
    properties,
    agents,
    currentAgent,
    loading,
    error,
    loadCities,
    loadNeighborhoods,
    loadRGs,
    loadProperties,
    loadAgents,
    setCurrentAgent,
    createVisit,
    updateVisit,
    getTodayVisits,
    getTodaySummary,
    stats
  }
}
