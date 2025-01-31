<script setup lang="ts">
import LeftMenu from '../components/LeftMenu.vue'
import MainContent from '../components/MainContent.vue'
import { ref } from 'vue'

const activeGroupId = ref<number | null>(null)

function setActiveGroup(id: number) {
  activeGroupId.value = id
}
</script>

<template>
  <main>
    <LeftMenu @select-group="setActiveGroup" />
    <MainContent :activeGroupId="activeGroupId" />
  </main>
</template>

<style scoped>
main {
  display: flex;
  width: 100%;
  height: 100%;
}
</style>
