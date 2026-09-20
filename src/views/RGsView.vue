<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <!-- Header -->
    <header class="bg-white shadow-sm sticky top-0 z-10">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-bold text-gray-800">RGs - Quarteirões</h1>
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
      <!-- Filters -->
      <div class="bg-white rounded-xl shadow-md p-4 mb-6">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Bairro</label>
            <select 
              v-model="selectedNeighborhood"
              @change="loadRGsForNeighborhood"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Selecione um bairro</option>
              <option v-for="n in neighborhoods" :key="n.id" :value="n.id">{{ n.name }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- RG List -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Carregando...</p>
      </div>

      <div v-else-if="rgs.length === 0" class="bg-white rounded-xl shadow-md p-8 text-center">
        <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
        </svg>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Nenhum RG encontrado</h3>
        <p class="text-gray-600">Selecione um bairro para visualizar os quarteirões</p>
      </div>

      <div v-else class="space-y-4">
        <div v-for="rg in rgs" :key="rg.id" class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-800">{{ rg.code }}</h3>
              <p class="text-gray-600 text-sm">{{ rg.description || 'Sem descrição' }}</p>
            </div>
            <span :class="getStatusBadge(rg.status)" class="px-3 py-1 rounded-full text-xs font-medium">
              {{ getStatusLabel(rg.status) }}
            </span>
          </div>
          
          <div class="flex items-center justify-between pt-4 border-t border-gray-100">
            <div class="text-sm text-gray-600">
              <span>{{ getPropertyCount(rg.id) }} imóveis</span>
            </div>
            <div class="flex space-x-2">
              <button 
                @click="viewRG(rg.id)"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                Ver Imóveis
              </button>
              <button 
                @click="editRG(rg)"
                class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Editar
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { dbHelpers } from '../db/database'

const neighborhoods = ref([])
const rgs = ref([])
const selectedNeighborhood = ref('')
const loading = ref(false)

const getPropertyCount = (rgId) => {
  const properties = dbHelpers.getPropertiesByRG(rgId)
  return properties.length
}

const getStatusLabel = (status) => {
  const labels = {
    'active': 'Ativo',
    'inactive': 'Inativo',
    'completed': 'Completo'
  }
  return labels[status] || status
}

const getStatusBadge = (status) => {
  const badges = {
    'active': 'bg-success-100 text-success-700',
    'inactive': 'bg-gray-100 text-gray-700',
    'completed': 'bg-blue-100 text-blue-700'
  }
  return badges[status] || 'bg-gray-100 text-gray-700'
}

async function loadNeighborhoods() {
  loading.value = true
  try {
    const cities = dbHelpers.getAllCities()
    if (cities.length > 0) {
      neighborhoods.value = dbHelpers.getNeighborhoodsByCity(cities[0].id)
    }
  } catch (error) {
    console.error('Erro ao carregar bairros:', error)
  } finally {
    loading.value = false
  }
}

async function loadRGsForNeighborhood() {
  if (!selectedNeighborhood.value) {
    rgs.value = []
    return
  }
  
  loading.value = true
  try {
    rgs.value = dbHelpers.getRGsByNeighborhood(selectedNeighborhood.value)
  } catch (error) {
    console.error('Erro ao carregar RGs:', error)
  } finally {
    loading.value = false
  }
}

function viewRG(rgId) {
  window.location.href = `/rg/${rgId}`
}

function editRG(rg) {
  // Implementar edição de RG
  console.log('Editar RG:', rg)
}

onMounted(() => {
  loadNeighborhoods()
})
</script>
