<script setup lang="ts">
import { getAutomaticTypeDirectiveNames } from 'typescript'
import LeftMenu from '../components/LeftMenu.vue'
import MainContent from '../components/MainContent.vue'
import { ref } from 'vue'

interface Group {
  id: number
  title: string
  taskList: Task[]
  isEditing: boolean
}

interface Task {
  id: number
  title: string
  completionStatus: boolean
  isEditing: boolean
  isSelecting: boolean
  dragging: boolean
}
const groupList = ref<Group[]>([])

const activeGroupId = ref<number | null>(null)

let groupsLocalStorage = JSON.parse(localStorage.getItem('groupList') ?? '[]')
if (Object.keys(groupsLocalStorage).length !== 0) {
  groupList.value = groupsLocalStorage
  activeGroupId.value = 0
}

const setActiveGroup = (index: number) => {
  activeGroupId.value = index
}

const updateGroup = (newGroupList: Group[]) => {
  groupList.value = newGroupList
  localStorage.setItem('groupList', JSON.stringify(groupList.value))
}

const deleteGroup = (deletingGroupId: Group['id']) => {
  activeGroupId.value = null
  groupList.value = groupList.value.filter((group) => group.id !== deletingGroupId)
  localStorage.setItem('groupList', JSON.stringify(groupList.value))
  if (groupList.value.length > 0) {
    activeGroupId.value = 0
  }
}
</script>

<template>
  <main>
    <LeftMenu @update-group="updateGroup" @select-group="setActiveGroup" :groupList="groupList" />
    <MainContent
      @update-group="updateGroup"
      @delete-group="deleteGroup"
      :activeGroupId="activeGroupId"
      :groupList="groupList"
    />
  </main>
</template>

<style scoped>
main {
  display: flex;
  width: 100%;
  height: 100%;
}
</style>
