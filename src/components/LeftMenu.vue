<script lang="ts" setup>
import Logo from './icons/Logo.vue'
import { ref } from 'vue'

interface Group {
  id: number
  title: string
  taskList: Task[]
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
let groupsLocalStorage = JSON.parse(localStorage.getItem('groupList') ?? '[]')
if (Object.keys(groupsLocalStorage).length !== 0) {
  groupList.value = groupsLocalStorage
  document.title = 'To-Do List - ' + groupList.value[0].title
}

const createGroup = () => {
  const newGroup: Group = {
    id: groupList.value.length,
    title: 'Новый список' + groupList.value.length,
    taskList: [],
  }
  groupList.value = JSON.parse(localStorage.getItem('groupList') ?? '[]')
  groupList.value.push(newGroup)
  localStorage.setItem('groupList', JSON.stringify(groupList.value))
  setActiveGroup(newGroup.id)
}

const emit = defineEmits<{
  (e: 'select-group', id: number): void
}>()

const setActiveGroup = (id: number) => {
  document.title = groupList.value[id].title + ' - To-Do List'
  emit('select-group', id)
}
</script>
<template>
  <div class="menu border-round-left-2xl border-none max-w-14rem w-full h-full">
    <div class="logo-container">
      <Logo id="logo" />
    </div>
    <div class="flex-column flex flex-column gap-4 mt-4">
      <Button
        label="Новый список"
        icon="pi pi-folder-plus"
        :pt="{
          root: {
            class:
              'shadow-2 hover:bg-bluegray-100 transition-duration-100 mx-3 px-4 border-round border-none flex gap-2 align-items-center transition-ease-out cursor-pointer',
          },
          label: { class: 'text-base line-height-3' },
          icon: { class: 'text-xl' },
        }"
        @click="createGroup()"
      />
      <Button
        v-for="item in groupList"
        :key="item.id"
        :label="item.title"
        :pt="{
          root: {
            class:
              'shadow-2 hover:bg-bluegray-100 transition-duration-100 mx-3 px-4 border-round border-none flex gap-2 align-items-center transition-ease-out cursor-pointer',
          },
          label: {
            class:
              'text-base line-height-3 mx-auto white-space-nowrap text-overflow-ellipsis overflow-hidden',
          },
          icon: { class: 'text-xl' },
        }"
        @click="setActiveGroup(item.id)"
      />
    </div>
  </div>
</template>
<style scoped>
.menu {
  background-color: rgba(244, 244, 244, 50%);
  backdrop-filter: blur(50px);
  box-shadow: 4px 0 4px 0 rgba(0, 0, 0, 10%);
}
.logo-container {
  padding: 18px 0 18px 0;
  display: flex;
  border-bottom: 1px solid rgba(0, 0, 0, 25%);
}
#logo {
  margin: auto;
}
Button {
  color: #2c3e50;
  border-color: #2c3e50;
  background: #e0e0e0;
  height: 50px;
  font-family: 'Nunito', serif;
}
</style>
