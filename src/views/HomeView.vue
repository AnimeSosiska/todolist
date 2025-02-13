<script setup lang="ts">
import LeftMenu from '../components/LeftMenu.vue'
import MainContent from '../components/MainContent.vue'
</script>

<template>
  <main>
    <LeftMenu />
    <MainContent />
  </main>
</template>

<style scoped>
main {
  display: flex;
  width: 100%;
  height: 100%;
}
</style>
