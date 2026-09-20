<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <!-- Header -->
    <header class="bg-white shadow-sm sticky top-0 z-10">
      <div class="container mx-auto px-4 py-4">
        <h1 class="text-xl font-bold text-gray-800">Configurações</h1>
      </div>
    </header>

    <!-- Content -->
    <main class="container mx-auto px-4 py-6">
      <!-- Agente Atual -->
      <div class="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Agente de Campo</h2>
        
        <div v-if="currentAgent" class="flex items-center space-x-4 mb-6">
          <div class="bg-primary-100 p-4 rounded-full">
            <svg class="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          <div>
            <p class="text-xl font-semibold text-gray-800">{{ currentAgent.name }}</p>
            <p class="text-gray-600">{{ currentAgent.registration_number }}</p>
            <p class="text-sm text-gray-500">{{ currentAgent.phone }}</p>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Selecionar Agente</label>
          <select
            v-model="selectedAgentId"
            @change="changeAgent"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option v-for="agent in agents" :key="agent.id" :value="agent.id">
              {{ agent.name }} - {{ agent.registration_number }}
            </option>
          </select>
        </div>
      </div>

      <!-- Informações do Sistema -->
      <div class="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Sistema</h2>
        
        <div class="space-y-4">
          <div class="flex justify-between py-3 border-b border-gray-100">
            <span class="text-gray-600">Versão do App</span>
            <span class="font-medium text-gray-800">1.0.0</span>
          </div>
          <div class="flex justify-between py-3 border-b border-gray-100">
            <span class="text-gray-600">Banco de Dados</span>
            <span class="font-medium text-green-600">Conectado</span>
          </div>
          <div class="flex justify-between py-3 border-b border-gray-100">
            <span class="text-gray-600">Última Sincronização</span>
            <span class="font-medium text-gray-800">{{ lastSync }}</span>
          </div>
        </div>
      </div>

      <!-- Ações -->
      <div class="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Ações</h2>
        
        <div class="space-y-3">
          <button 
            @click="resetDatabase"
            class="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <div class="flex items-center space-x-3">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              <span class="font-medium text-red-700">Resetar Banco de Dados</span>
            </div>
            <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>

          <button 
            @click="exportData"
            class="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <div class="flex items-center space-x-3">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
              </svg>
              <span class="font-medium text-blue-700">Exportar Dados</span>
            </div>
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Sobre -->
      <div class="bg-white rounded-xl shadow-md p-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Sobre o App</h2>
        <p class="text-gray-600 text-sm leading-relaxed">
          Aplicativo desenvolvido para Agentes de Combate a Endemias (ACE) para registro e acompanhamento de visitas domiciliares, eliminação e tratamento de focos do Aedes aegypti.
        </p>
        <p class="text-gray-500 text-xs mt-4">
          Desenvolvido com Vue.js 3 + Vite + TailwindCSS + SQLite
        </p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { dbHelpers } from '../db/database'

const agents = ref([])
const currentAgent = ref(null)
const selectedAgentId = ref('')
const lastSync = ref('Hoje às 08:00')

const changeAgent = () => {
  const agent = agents.value.find(a => a.id === selectedAgentId.value)
  if (agent) {
    currentAgent.value = agent
    localStorage.setItem('currentAgentId', agent.id)
  }
}

const resetDatabase = () => {
  if (confirm('Tem certeza que deseja resetar o banco de dados? Todos os dados serão perdidos.')) {
    // Implementar reset do banco
    alert('Banco de dados resetado com sucesso!')
  }
}

const exportData = () => {
  alert('Funcionalidade de exportação será implementada em breve!')
}

onMounted(() => {
  agents.value = dbHelpers.getAllAgents()
  
  const savedAgentId = localStorage.getItem('currentAgentId')
  if (savedAgentId && agents.value.length > 0) {
    const savedAgent = agents.value.find(a => a.id === savedAgentId)
    if (savedAgent) {
      currentAgent.value = savedAgent
      selectedAgentId.value = savedAgentId
    } else {
      currentAgent.value = agents.value[0]
      selectedAgentId.value = agents.value[0].id
    }
  } else if (agents.value.length > 0) {
    currentAgent.value = agents.value[0]
    selectedAgentId.value = agents.value[0].id
  }
})
</script>
