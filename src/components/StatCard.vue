<template>
  <div class="text-gray-800">
    <div :class="`bg-${color}-100 rounded-xl p-4 shadow-md`">
      <div class="flex items-center justify-between mb-2">
        <span :class="`text-${color}-600 text-sm font-medium`">{{ title }}</span>
        <svg class="w-5 h-5 opacity-50" :class="`text-${color}-600`" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path v-if="icon === 'building'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          <path v-if="icon === 'check'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          <path v-if="icon === 'lock'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          <path v-if="icon === 'user'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          <path v-if="icon === 'x'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          <path v-if="icon === 'trash'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          <path v-if="icon === 'droplet'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/>
          <path v-if="icon === 'scale'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/>
        </svg>
      </div>
      <p :class="`text-2xl font-bold text-${color}-700`">{{ value }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [Number, String],
    required: true
  },
  icon: {
    type: String,
    default: 'building'
  },
  color: {
    type: String,
    default: 'gray'
  }
})
</script>
