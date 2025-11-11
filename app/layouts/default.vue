<template>
  <div style="min-height:100vh">
    <header class="app-header">
      <div class="container">
        <div class="app-title">Personal Learning Dashboard</div>
      </div>
    </header>

    <main class="container">
      <slot />
    </main>

    <footer class="footer">
      Nuxt 3 + TS Demo Dashboard • Ready for Backend
    </footer>
  </div>
</template>

<script setup lang="ts">
// Layout now uses simple CSS rules in app/assets/main.css
</script>