<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { seedDatabase } from './db/seed'

onMounted(() => {
  // Inicializar banco de dados com dados de teste se necessário
  try {
    seedDatabase()
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error)
  }
})
</script>

<style scoped>
#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
