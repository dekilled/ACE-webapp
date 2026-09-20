<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-primary-600 text-white shadow-lg">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="bg-white/20 p-2 rounded-lg">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-bold">ACE - Agente de Combate a Endemias</h1>
              <p class="text-primary-100 text-sm">{{ currentDate }}</p>
            </div>
          </div>
          
          <div v-if="currentAgent" class="flex items-center space-x-3">
            <div class="text-right hidden sm:block">
              <p class="font-semibold">{{ currentAgent.name }}</p>
              <p class="text-primary-200 text-sm">{{ currentAgent.registration_number }}</p>
            </div>
            <div class="bg-white/20 p-2 rounded-full">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-6">
      <!-- Stats Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
        <StatCard 
          title="Total" 
          :value="stats.total" 
          icon="building"
          color="gray"
        />
        <StatCard 
          title="Visitados" 
          :value="stats.visited" 
          icon="check"
          color="success"
        />
        <StatCard 
          title="Fechados" 
          :value="stats.closed" 
          icon="lock"
          color="blue"
        />
        <StatCard 
          title="Ausentes" 
          :value="stats.absent" 
          icon="user"
          color="yellow"
        />
        <StatCard 
          title="Recusados" 
          :value="stats.refused" 
          icon="x"
          color="red"
        />
        <StatCard 
          title="Focos Elim." 
          :value="stats.eliminatedFoci" 
          icon="trash"
          color="green"
        />
        <StatCard 
          title="Focos Trat." 
          :value="stats.treatedFoci" 
          icon="droplet"
          color="cyan"
        />
        <StatCard 
          title="Gramas" 
          :value="stats.larvicideGrams" 
          icon="scale"
          color="purple"
        />
      </div>

      <!-- Progress Bar -->
      <div class="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Progresso do Dia</h2>
        <div class="relative pt-1">
          <div class="flex mb-2 items-center justify-between">
            <div>
              <span class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary-600 bg-primary-200">
                {{ stats.total > 0 ? Math.round((stats.visited / stats.total) * 100) : 0 }}% Completado
              </span>
            </div>
            <div class="text-right">
              <span class="text-xs font-semibold inline-block text-primary-600">
                {{ stats.visited }} / {{ stats.total }}
              </span>
            </div>
          </div>
          <div class="overflow-hidden h-3 mb-4 text-xs flex rounded bg-primary-100">
            <div 
              :style="{ width: `${stats.total > 0 ? (stats.visited / stats.total) * 100 : 0}%` }"
              class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500 transition-all duration-500"
            ></div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <router-link to="/rgs" class="bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
          <div class="flex items-center justify-between mb-4">
            <div class="bg-white/20 p-3 rounded-lg">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
              </svg>
            </div>
            <svg class="w-6 h-6 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold mb-1">Gerenciar RGs</h3>
          <p class="text-primary-100 text-sm">Visualizar e editar quarteirões</p>
        </router-link>

        <router-link to="/summary" class="bg-gradient-to-br from-success-500 to-success-600 text-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
          <div class="flex items-center justify-between mb-4">
            <div class="bg-white/20 p-3 rounded-lg">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <svg class="w-6 h-6 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold mb-1">Resumo Diário</h3>
          <p class="text-success-100 text-sm">Relatório completo do dia</p>
        </router-link>

        <router-link to="/settings" class="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
          <div class="flex items-center justify-between mb-4">
            <div class="bg-white/20 p-3 rounded-lg">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <svg class="w-6 h-6 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold mb-1">Configurações</h3>
          <p class="text-purple-100 text-sm">Agente e preferências</p>
        </router-link>
      </div>

      <!-- Recent Visits -->
      <div class="bg-white rounded-xl shadow-md p-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Últimas Visitas</h2>
        <div v-if="recentVisits.length === 0" class="text-center py-8 text-gray-500">
          <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
          </svg>
          <p>Nenhuma visita registrada hoje</p>
          <p class="text-sm mt-2">Comece registrando visitas nos imóveis</p>
        </div>
        <div v-else class="space-y-3">
          <div v-for="visit in recentVisits" :key="visit.id" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div class="flex items-center space-x-4">
              <div :class="getStatusColor(visit.visit_status)" class="w-3 h-3 rounded-full"></div>
              <div>
                <p class="font-medium text-gray-800">{{ visit.street_name }}, {{ visit.number }}</p>
                <p class="text-sm text-gray-500">{{ getPropertyTypeLabel(visit.property_type) }}</p>
              </div>
            </div>
            <div class="text-right">
              <span :class="getStatusBadge(visit.visit_status)" class="px-3 py-1 rounded-full text-xs font-medium">
                {{ getStatusLabel(visit.visit_status) }}
              </span>
              <p v-if="visit.eliminated_foci > 0 || visit.treated_foci > 0" class="text-xs text-gray-500 mt-1">
                <span v-if="visit.eliminated_foci > 0">{{ visit.eliminated_foci }} elim.</span>
                <span v-if="visit.treated_foci > 0" class="ml-2">{{ visit.treated_foci }} trat.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Bottom Navigation (Mobile) -->
    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden safe-area-pb">
      <div class="grid grid-cols-4">
        <router-link to="/" class="flex flex-col items-center py-3 text-primary-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          <span class="text-xs mt-1">Início</span>
        </router-link>
        <router-link to="/rgs" class="flex flex-col items-center py-3 text-gray-500 hover:text-primary-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
          </svg>
          <span class="text-xs mt-1">RGs</span>
        </router-link>
        <router-link to="/summary" class="flex flex-col items-center py-3 text-gray-500 hover:text-primary-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <span class="text-xs mt-1">Resumo</span>
        </router-link>
        <router-link to="/settings" class="flex flex-col items-center py-3 text-gray-500 hover:text-primary-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <span class="text-xs mt-1">Ajustes</span>
        </router-link>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useData } from '../composables/useData'

const { 
  currentAgent, 
  loadAgents, 
  getTodayVisits, 
  stats 
} = useData()

const currentDate = computed(() => {
  const date = new Date()
  return date.toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
})

const recentVisits = computed(() => {
  const visits = getTodayVisits()
  return visits.slice(0, 10)
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

onMounted(async () => {
  await loadAgents()
})
</script>

<style scoped>
.safe-area-pb {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
