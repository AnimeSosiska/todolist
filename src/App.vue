<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="container w-full mx-auto relative">
    <div class="content-wrapper bg-cyan-200 border-round-2xl border-none w-full h-full">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.container {
  top: 20px;
  max-width: 1290px;
  height: calc(100vh - 40px);
}
</style>
