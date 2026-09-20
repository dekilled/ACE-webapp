<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <!-- Header -->
    <header class="bg-white shadow-sm sticky top-0 z-10">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <button @click="$router.back()" class="text-gray-600 hover:text-gray-800">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <div>
              <h1 class="text-xl font-bold text-gray-800">{{ rg?.code }}</h1>
              <p class="text-sm text-gray-600">{{ rg?.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="container mx-auto px-4 py-6">
      <!-- Stats Summary -->
      <div class="grid grid-cols-4 gap-3 mb-6">
        <div class="bg-white rounded-lg p-3 text-center shadow-sm">
          <p class="text-2xl font-bold text-primary-600">{{ properties.length }}</p>
          <p class="text-xs text-gray-600">Total</p>
        </div>
        <div class="bg-white rounded-lg p-3 text-center shadow-sm">
          <p class="text-2xl font-bold text-success-600">{{ propertyStats.R }}</p>
          <p class="text-xs text-gray-600">Residências</p>
        </div>
        <div class="bg-white rounded-lg p-3 text-center shadow-sm">
          <p class="text-2xl font-bold text-blue-600">{{ propertyStats.C }}</p>
          <p class="text-xs text-gray-600">Comércios</p>
        </div>
        <div class="bg-white rounded-lg p-3 text-center shadow-sm">
          <p class="text-2xl font-bold text-yellow-600">{{ propertyStats.TB }}</p>
          <p class="text-xs text-gray-600">Baldios</p>
        </div>
      </div>

      <!-- Property List -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Carregando imóveis...</p>
      </div>

      <div v-else class="space-y-3">
        <div 
          v-for="property in properties" 
          :key="property.id"
          class="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
          @click="goToVisit(property.id)"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4 flex-1">
              <div :class="getPropertyTypeColor(property.property_type)" class="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                {{ property.property_type }}
              </div>
              <div class="flex-1">
                <div class="flex items-center space-x-2">
                  <h3 class="font-semibold text-gray-800">{{ property.street_name }}</h3>
                  <span v-if="property.number" class="text-gray-600">nº {{ property.number }}</span>
                </div>
                <div class="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                  <span v-if="property.residents_count > 0">{{ property.residents_count }} mor.</span>
                  <span v-if="property.dogs_count > 0">{{ property.dogs_count }} cães</span>
                  <span v-if="property.cats_count > 0">{{ property.cats_count }} gatos</span>
                </div>
              </div>
            </div>
            
            <div class="flex items-center space-x-2">
              <div v-if="hasVisit(property.id)" :class="getVisitStatusBadge(property.id)" class="px-3 py-1 rounded-full text-xs font-medium">
                {{ getVisitStatusLabel(property.id) }}
              </div>
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
          
          <div v-if="property.notes" class="mt-3 pt-3 border-t border-gray-100">
            <p class="text-sm text-gray-600 italic">{{ property.notes }}</p>
          </div>
        </div>
      </div>
    </main>

    <!-- Floating Action Button -->
    <button 
      @click="showAddPropertyModal = true"
      class="fixed bottom-20 right-4 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-colors md:hidden"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { dbHelpers } from '../db/database'

const route = useRoute()
const rg = ref(null)
const properties = ref([])
const visits = ref([])
const loading = ref(false)
const showAddPropertyModal = ref(false)

const propertyStats = computed(() => {
  const stats = { R: 0, C: 0, TB: 0, OUT: 0, PE: 0 }
  properties.value.forEach(p => {
    if (stats[p.property_type] !== undefined) {
      stats[p.property_type]++
    }
  })
  return stats
})

const hasVisit = (propertyId) => {
  const today = new Date().toISOString().split('T')[0]
  return visits.value.some(v => v.property_id === propertyId && v.visit_date === today)
}

const getVisitForProperty = (propertyId) => {
  const today = new Date().toISOString().split('T')[0]
  return visits.value.find(v => v.property_id === propertyId && v.visit_date === today)
}

const getVisitStatusBadge = (propertyId) => {
  const visit = getVisitForProperty(propertyId)
  if (!visit) return 'bg-gray-100 text-gray-700'
  
  const badges = {
    'visited': 'bg-success-100 text-success-700',
    'closed': 'bg-blue-100 text-blue-700',
    'absent': 'bg-yellow-100 text-yellow-700',
    'refused': 'bg-red-100 text-red-700'
  }
  return badges[visit.visit_status] || 'bg-gray-100 text-gray-700'
}

const getVisitStatusLabel = (propertyId) => {
  const visit = getVisitForProperty(propertyId)
  if (!visit) return ''
  
  const labels = {
    'visited': 'Visitado',
    'closed': 'Fechado',
    'absent': 'Ausente',
    'refused': 'Recusado'
  }
  return labels[visit.visit_status] || visit.visit_status
}

const getPropertyTypeColor = (type) => {
  const colors = {
    'R': 'bg-success-500',
    'C': 'bg-blue-500',
    'TB': 'bg-yellow-500',
    'OUT': 'bg-gray-500',
    'PE': 'bg-purple-500'
  }
  return colors[type] || 'bg-gray-500'
}

async function loadRG() {
  loading.value = true
  try {
    const rgs = dbHelpers.getRGsByNeighborhood(route.params.neighborhoodId || '')
    // Buscar por ID diretamente
    const allRgs = []
    const cities = dbHelpers.getAllCities()
    for (const city of cities) {
      const neighborhoods = dbHelpers.getNeighborhoodsByCity(city.id)
      for (const neighborhood of neighborhoods) {
        const neighborhoodRgs = dbHelpers.getRGsByNeighborhood(neighborhood.id)
        allRgs.push(...neighborhoodRgs)
      }
    }
    
    rg.value = allRgs.find(r => r.id === route.params.id)
    
    if (rg.value) {
      properties.value = dbHelpers.getPropertiesByRG(rg.value.id)
      
      // Carregar visitas de hoje
      const today = new Date().toISOString().split('T')[0]
      const agents = dbHelpers.getAllAgents()
      visits.value = []
      for (const agent of agents) {
        const agentVisits = dbHelpers.getVisitsByAgentAndDate(agent.id, today)
        visits.value.push(...agentVisits)
      }
    }
  } catch (error) {
    console.error('Erro ao carregar RG:', error)
  } finally {
    loading.value = false
  }
}

function goToVisit(propertyId) {
  window.location.href = `/visit/${propertyId}`
}

onMounted(() => {
  loadRG()
})
</script>
