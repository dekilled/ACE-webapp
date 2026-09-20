<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <!-- Header -->
    <header class="bg-white shadow-sm sticky top-0 z-10">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-bold text-gray-800">Resumo Diário</h1>
          <router-link to="/" class="text-primary-600 hover:text-primary-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </router-link>
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="container mx-auto px-4 py-6">
      <!-- Date -->
      <div class="bg-primary-600 text-white rounded-xl shadow-md p-6 mb-6 text-center">
        <h2 class="text-lg font-medium opacity-90">{{ currentDate }}</h2>
        <p class="text-3xl font-bold mt-2">{{ formattedDate }}</p>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-xl shadow-md p-4 text-center">
          <p class="text-3xl font-bold text-gray-800">{{ stats.total }}</p>
          <p class="text-sm text-gray-600 mt-1">Total de Imóveis</p>
        </div>
        <div class="bg-success-100 rounded-xl shadow-md p-4 text-center">
          <p class="text-3xl font-bold text-success-700">{{ stats.visited }}</p>
          <p class="text-sm text-success-600 mt-1">Visitados</p>
        </div>
        <div class="bg-blue-100 rounded-xl shadow-md p-4 text-center">
          <p class="text-3xl font-bold text-blue-700">{{ stats.closed }}</p>
          <p class="text-sm text-blue-600 mt-1">Fechados</p>
        </div>
        <div class="bg-yellow-100 rounded-xl shadow-md p-4 text-center">
          <p class="text-3xl font-bold text-yellow-700">{{ stats.absent + stats.refused }}</p>
          <p class="text-sm text-yellow-600 mt-1">Ausentes/Recusados</p>
        </div>
      </div>

      <!-- Focos e Tratamento -->
      <div class="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Focos e Tratamento</h3>
        <div class="grid grid-cols-3 gap-4">
          <div class="text-center p-4 bg-green-50 rounded-lg">
            <p class="text-2xl font-bold text-green-700">{{ stats.eliminatedFoci }}</p>
            <p class="text-sm text-green-600 mt-1">Focos Eliminados</p>
          </div>
          <div class="text-center p-4 bg-cyan-50 rounded-lg">
            <p class="text-2xl font-bold text-cyan-700">{{ stats.treatedFoci }}</p>
            <p class="text-sm text-cyan-600 mt-1">Focos Tratados</p>
          </div>
          <div class="text-center p-4 bg-purple-50 rounded-lg">
            <p class="text-2xl font-bold text-purple-700">{{ stats.larvicideGrams }}g</p>
            <p class="text-sm text-purple-600 mt-1">Larvicida</p>
          </div>
        </div>
      </div>

      <!-- Progress -->
      <div class="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Progresso</h3>
        <div class="relative pt-1">
          <div class="flex mb-2 items-center justify-between">
            <div>
              <span class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary-600 bg-primary-200">
                {{ progressPercentage }}% Completado
              </span>
            </div>
            <div class="text-right">
              <span class="text-xs font-semibold inline-block text-primary-600">
                {{ stats.visited }} / {{ stats.total }}
              </span>
            </div>
          </div>
          <div class="overflow-hidden h-4 mb-4 text-xs flex rounded bg-primary-100">
            <div 
              :style="{ width: `${progressPercentage}%` }"
              class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500 transition-all duration-500"
            ></div>
          </div>
        </div>
      </div>

      <!-- Detailed List -->
      <div class="bg-white rounded-xl shadow-md p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Visitas Realizadas</h3>
        
        <div v-if="visits.length === 0" class="text-center py-8 text-gray-500">
          <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2zm9 5h-2a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2z"/>
          </svg>
          <p>Nenhuma visita registrada hoje</p>
        </div>

        <div v-else class="space-y-3">
          <div 
            v-for="visit in visits" 
            :key="visit.id"
            class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <div :class="getStatusColor(visit.visit_status)" class="w-3 h-3 rounded-full"></div>
              <div>
                <p class="font-medium text-gray-800">{{ visit.street_name }}, {{ visit.number }}</p>
                <p class="text-sm text-gray-500">{{ getPropertyTypeLabel(visit.property_type) }}</p>
              </div>
            </div>
            <span :class="getStatusBadge(visit.visit_status)" class="px-3 py-1 rounded-full text-xs font-medium">
              {{ getStatusLabel(visit.visit_status) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Export Button -->
      <button 
        @click="exportReport"
        class="w-full mt-6 bg-success-600 text-white py-4 rounded-xl font-semibold hover:bg-success-700 transition-colors flex items-center justify-center space-x-2"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        <span>Exportar Relatório</span>
      </button>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { dbHelpers } from '../db/database'

const visits = ref([])
const summary = ref(null)
const loading = ref(false)

const currentDate = computed(() => {
  const date = new Date()
  return date.toLocaleDateString('pt-BR', { weekday: 'long' })
})

const formattedDate = computed(() => {
  const date = new Date()
  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
})

const stats = computed(() => {
  return {
    total: visits.value.length,
    visited: visits.value.filter(v => v.visit_status === 'visited').length,
    closed: visits.value.filter(v => v.visit_status === 'closed').length,
    absent: visits.value.filter(v => v.visit_status === 'absent').length,
    refused: visits.value.filter(v => v.visit_status === 'refused').length,
    eliminatedFoci: visits.value.reduce((sum, v) => sum + (v.eliminated_foci || 0), 0),
    treatedFoci: visits.value.reduce((sum, v) => sum + (v.treated_foci || 0), 0),
    larvicideGrams: visits.value.reduce((sum, v) => sum + (v.larvicide_grams || 0), 0).toFixed(1)
  }
})

const progressPercentage = computed(() => {
  if (stats.value.total === 0) return 0
  return Math.round((stats.value.visited / stats.value.total) * 100)
})

const getPropertyTypeLabel = (type) => {
  const labels = {
    'R': 'Residência',
    'C': 'Comércio',
    'TB': 'Terreno Baldio',
    'OUT': 'Outros',
    'PE': 'Ponto Estratégico'
  }
  return labels[type] || type
}

const getStatusLabel = (status) => {
  const labels = {
    'visited': 'Visitado',
    'closed': 'Fechado',
    'absent': 'Ausente',
    'refused': 'Recusado'
  }
  return labels[status] || status
}

const getStatusBadge = (status) => {
  const badges = {
    'visited': 'bg-success-100 text-success-700',
    'closed': 'bg-blue-100 text-blue-700',
    'absent': 'bg-yellow-100 text-yellow-700',
    'refused': 'bg-red-100 text-red-700'
  }
  return badges[status] || 'bg-gray-100 text-gray-700'
}

const getStatusColor = (status) => {
  const colors = {
    'visited': 'bg-success-500',
    'closed': 'bg-blue-500',
    'absent': 'bg-yellow-500',
    'refused': 'bg-red-500'
  }
  return colors[status] || 'bg-gray-500'
}

async function loadTodayData() {
  loading.value = true
  try {
    const today = new Date().toISOString().split('T')[0]
    const agents = dbHelpers.getAllAgents()
    
    if (agents.length > 0) {
      visits.value = dbHelpers.getVisitsByAgentAndDate(agents[0].id, today)
      summary.value = dbHelpers.getDailySummary(agents[0].id, today)
    }
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
  } finally {
    loading.value = false
  }
}

function exportReport() {
  // Implementar exportação de relatório
  alert('Funcionalidade de exportação será implementada em breve!')
}

onMounted(() => {
  loadTodayData()
})
</script>
