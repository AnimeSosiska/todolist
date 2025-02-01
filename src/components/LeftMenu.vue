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
  groupList.value = JSON.parse(localStorage.getItem('groupList') ?? '[]')

  const generateUniqueTitle = (baseTitle: string): string => {
    let count = 1
    let newTitle = baseTitle

    while (groupList.value.some((group) => group.title === newTitle)) {
      count++
      newTitle = `${baseTitle} #${count}`
    }
    return newTitle
  }

  const newGroupTitle = generateUniqueTitle('Новый список')

  const newGroup: Group = {
    id: groupList.value.length,
    title: newGroupTitle,
    taskList: [],
  }
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

//Двигаем группы
// const draggingTaskIndex = ref<number | null>(null)
// const offsetY = ref(0)
// const cloneElement = ref<HTMLElement | null>(null)
// const cloneContainer = ref<HTMLDivElement | null>(null)

// const onMouseDown = (index: number, event: MouseEvent) => {
//   if (
//     groupList.value[id!].taskList[index].isEditing &&
//     !groupList.value[id!].taskList[index].isSelecting
//   ) {
//     draggingTaskIndex.value = index
//     const currentTarget = event.currentTarget as HTMLElement
//     offsetY.value = event.clientY - currentTarget.getBoundingClientRect().top

//     groupList.value[id!].taskList[index].dragging = true
//     document.body.style.cursor = 'grabbing'

//     document.addEventListener('mousemove', onMouseMove)
//     document.addEventListener('mouseup', onMouseUp)
//   }
// }

// const onMouseMove = (event: MouseEvent) => {
//   if (draggingTaskIndex.value !== null) {
//     const taskElements = document.querySelectorAll('.task')
//     const currentElement = taskElements[draggingTaskIndex.value] as HTMLElement

//     if (!cloneElement.value) {
//       cloneElement.value = currentElement.cloneNode(true) as HTMLElement
//       cloneContainer.value = document.createElement('div')
//       document.body.appendChild(cloneContainer.value)
//       cloneContainer.value.style.position = 'absolute'
//       cloneContainer.value.style.top = '0'
//       cloneContainer.value.style.left = '0'
//       cloneContainer.value.style.width = '100vw'
//       cloneContainer.value.style.height = '100vh'
//       cloneElement.value.classList.remove('task')
//       cloneElement.value.classList.add('task-copy')
//       cloneContainer.value.appendChild(cloneElement.value)
//     }
//     currentElement.style.visibility = 'hidden'

//     const rect = currentElement.getBoundingClientRect()
//     const originalX = rect.left

//     cloneElement.value.style.top = `${event.clientY - offsetY.value / 2}px`
//     cloneElement.value.style.left = `${originalX}px`

//     let newIndex = draggingTaskIndex.value

//     taskElements.forEach((taskElement, i) => {
//       if (i !== draggingTaskIndex.value) {
//         const rect = taskElement.getBoundingClientRect()
//         const isAbove = event.clientY < rect.top + rect.height / 2 && event.clientY > rect.top
//         const isBelow = event.clientY > rect.top + rect.height / 2 && event.clientY < rect.bottom
//         if (isAbove && i < draggingTaskIndex.value!) {
//           newIndex = i
//         } else if (isBelow && i > draggingTaskIndex.value!) {
//           newIndex = i
//         }
//       }
//     })

//     if (newIndex !== draggingTaskIndex.value) {
//       const movedTask = groupList.value[id!].taskList.splice(draggingTaskIndex.value!, 1)[0]
//       groupList.value[id!].taskList.splice(newIndex, 0, movedTask)
//       draggingTaskIndex.value = newIndex
//     }
//   }
// }

// const onMouseUp = (event: MouseEvent) => {
//   if (draggingTaskIndex.value !== null) {
//     const taskElements = document.querySelectorAll('.task')
//     const currentElement = taskElements[draggingTaskIndex.value] as HTMLElement

//     currentElement.style.visibility = ''

//     if (cloneContainer.value && cloneElement.value) {
//       cloneContainer.value.removeChild(cloneElement.value)
//       document.body.removeChild(cloneContainer.value)
//       cloneElement.value = null
//       cloneContainer.value = null
//     }

//     groupList.value[id!].taskList.forEach((task) => {
//       task.dragging = false
//     })
//     document.body.style.cursor = ''
//     draggingTaskIndex.value = null
//     document.removeEventListener('mousemove', onMouseMove)
//     document.removeEventListener('mouseup', onMouseUp)
//   }
// }
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
        v-for="(item, index) in groupList"
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
