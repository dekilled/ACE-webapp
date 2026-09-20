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
              <h1 class="text-xl font-bold text-gray-800">Registrar Visita</h1>
              <p class="text-sm text-gray-600">{{ property?.street_name }}, {{ property?.number }}</p>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="container mx-auto px-4 py-6">
      <!-- Property Info -->
      <div class="bg-white rounded-xl shadow-md p-6 mb-6">
        <div class="flex items-center space-x-4 mb-4">
          <div :class="getPropertyTypeColor(property?.property_type)" class="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            {{ property?.property_type }}
          </div>
          <div>
            <h2 class="text-lg font-semibold text-gray-800">{{ property?.street_name }}</h2>
            <p class="text-gray-600">nº {{ property?.number || 'S/N' }}</p>
          </div>
        </div>
        
        <div class="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          <div class="text-center">
            <p class="text-2xl font-bold text-gray-800">{{ property?.residents_count || 0 }}</p>
            <p class="text-xs text-gray-600">Moradores</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-bold text-gray-800">{{ property?.dogs_count || 0 }}</p>
            <p class="text-xs text-gray-600">Cães</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-bold text-gray-800">{{ property?.cats_count || 0 }}</p>
            <p class="text-xs text-gray-600">Gatos</p>
          </div>
        </div>
      </div>

      <!-- Visit Form -->
      <form @submit.prevent="submitVisit" class="space-y-6">
        <!-- Status da Visita -->
        <div class="bg-white rounded-xl shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Status da Visita</h3>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              @click="visitData.visitStatus = 'visited'"
              :class="visitData.visitStatus === 'visited' ? 'bg-success-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
              class="p-4 rounded-lg font-medium transition-colors"
            >
              <div class="flex flex-col items-center">
                <svg class="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span>Visitado</span>
              </div>
            </button>
            
            <button
              type="button"
              @click="visitData.visitStatus = 'closed'"
              :class="visitData.visitStatus === 'closed' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
              class="p-4 rounded-lg font-medium transition-colors"
            >
              <div class="flex flex-col items-center">
                <svg class="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                <span>Fechado</span>
              </div>
            </button>
            
            <button
              type="button"
              @click="visitData.visitStatus = 'absent'"
              :class="visitData.visitStatus === 'absent' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
              class="p-4 rounded-lg font-medium transition-colors"
            >
              <div class="flex flex-col items-center">
                <svg class="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                <span>Ausente</span>
              </div>
            </button>
            
            <button
              type="button"
              @click="visitData.visitStatus = 'refused'"
              :class="visitData.visitStatus === 'refused' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
              class="p-4 rounded-lg font-medium transition-colors"
            >
              <div class="flex flex-col items-center">
                <svg class="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
                <span>Recusado</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Focos e Tratamento (apenas se visitado) -->
        <div v-if="visitData.visitStatus === 'visited'" class="bg-white rounded-xl shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Focos e Tratamento</h3>
          
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Focos Eliminados</label>
              <input
                type="number"
                v-model.number="visitData.eliminatedFoci"
                min="0"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Focos Tratados</label>
              <input
                type="number"
                v-model.number="visitData.treatedFoci"
                min="0"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div v-if="visitData.treatedFoci > 0" class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Gramas de Larvicida</label>
            <input
              type="number"
              v-model.number="visitData.larvicideGrams"
              step="0.1"
              min="0"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div class="flex items-center">
            <input
              type="checkbox"
              id="guidance"
              v-model="visitData.guidanceProvided"
              class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label for="guidance" class="ml-2 text-sm text-gray-700">Orientações fornecidas ao morador</label>
          </div>
        </div>

        <!-- Observações -->
        <div class="bg-white rounded-xl shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Observações</h3>
          <textarea
            v-model="visitData.notes"
            rows="3"
            placeholder="Adicione observações sobre o imóvel..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          ></textarea>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="loading || !visitData.visitStatus"
          class="w-full bg-primary-600 text-white py-4 rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Salvando...' : 'Salvar Visita' }}
        </button>
      </form>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { dbHelpers } from '../db/database'

const route = useRoute()
const router = useRouter()

const property = ref(null)
const loading = ref(false)
const visitData = ref({
  visitStatus: '',
  eliminatedFoci: 0,
  treatedFoci: 0,
  larvicideGrams: 0,
  guidanceProvided: false,
  notes: ''
})

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

async function loadProperty() {
  try {
    // Buscar propriedade em todos os RGs
    const cities = dbHelpers.getAllCities()
    for (const city of cities) {
      const neighborhoods = dbHelpers.getNeighborhoodsByCity(city.id)
      for (const neighborhood of neighborhoods) {
        const rgs = dbHelpers.getRGsByNeighborhood(neighborhood.id)
        for (const rg of rgs) {
          const properties = dbHelpers.getPropertiesByRG(rg.id)
          const found = properties.find(p => p.id === route.params.propertyId)
          if (found) {
            property.value = found
            return
          }
        }
      }
    }
  } catch (error) {
    console.error('Erro ao carregar propriedade:', error)
  }
}

async function submitVisit() {
  loading.value = true
  try {
    await dbHelpers.createVisit(
      property.value.id,
      'agent-id-placeholder', // Será substituído pelo agente atual
      new Date().toISOString().split('T')[0],
      visitData.value.visitStatus,
      visitData.value.eliminatedFoci,
      visitData.value.treatedFoci,
      visitData.value.larvicideGrams,
      visitData.value.guidanceProvided,
      visitData.value.notes
    )
    
    // Voltar para a tela anterior
    router.back()
  } catch (error) {
    console.error('Erro ao salvar visita:', error)
    alert('Erro ao salvar visita. Tente novamente.')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProperty()
})
</script>
