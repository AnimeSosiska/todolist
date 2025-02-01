<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue'
import Textarea from 'primevue/textarea'

const props = defineProps<{
  activeGroupId: number | null
}>()

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
const taskList = ref<Task[]>([])
let id: number | null = null

const activeGroupTitle = computed(() => {
  groupList.value = JSON.parse(localStorage.getItem('groupList') ?? '{}')

  let group: Group | undefined
  if (props.activeGroupId === null) {
    if (Object.keys(groupList.value).length !== 0) {
      group = groupList.value[0]
      id = 0
    }
  } else {
    group = groupList.value[props.activeGroupId]
    id = props.activeGroupId
  }
  if (group && id) {
    if (Object.keys(group.taskList).length !== 0) {
      groupList.value[id].taskList = group.taskList
    }
  }
  return group ? group.title : null
})
//Работа кнопки, создающая задачи
const addTask = () => {
  const newTask: Task = {
    id: groupList.value[id!].taskList.length,
    title: 'Новая задача',
    completionStatus: false,
    isEditing: false,
    isSelecting: false,
    dragging: false,
  }
  groupList.value[id!].taskList.unshift(newTask)
  localStorage.setItem('groupList', JSON.stringify(groupList.value))
}

//Кнопка, удаляющая задачу
const deleteTask = (itemId: number) => {
  groupList.value[id!].taskList = groupList.value[id!].taskList.filter((task) => task.id !== itemId)
}

//Кнопка редактирования

const editTask = (taskId: number) => {
  let item = groupList.value[id!].taskList.find((task) => task.id === taskId)

  if (item) {
    if (!item.isEditing) {
      item.isEditing = true
    } else if (item.isEditing) {
      item.isEditing = false
      localStorage.setItem('groupList', JSON.stringify(groupList.value))
    }
  }
}

//Перетаскивание задач
const draggingTaskIndex = ref<number | null>(null)
const offsetY = ref(0)
const cloneElement = ref<HTMLElement | null>(null)
const cloneContainer = ref<HTMLDivElement | null>(null)

const onMouseDown = (index: number, event: MouseEvent) => {
  if (
    groupList.value[id!].taskList[index].isEditing &&
    !groupList.value[id!].taskList[index].isSelecting
  ) {
    draggingTaskIndex.value = index
    const currentTarget = event.currentTarget as HTMLElement
    offsetY.value = event.clientY - currentTarget.getBoundingClientRect().top

    groupList.value[id!].taskList[index].dragging = true
    document.body.style.cursor = 'grabbing'

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }
}

const onMouseMove = (event: MouseEvent) => {
  if (draggingTaskIndex.value !== null) {
    const taskElements = document.querySelectorAll('.task')
    const currentElement = taskElements[draggingTaskIndex.value] as HTMLElement

    if (!cloneElement.value) {
      cloneElement.value = currentElement.cloneNode(true) as HTMLElement
      cloneContainer.value = document.createElement('div')
      document.body.appendChild(cloneContainer.value)
      cloneContainer.value.style.position = 'absolute'
      cloneContainer.value.style.top = '0'
      cloneContainer.value.style.left = '0'
      cloneContainer.value.style.width = '100vw'
      cloneContainer.value.style.height = '100vh'
      cloneElement.value.classList.remove('task')
      cloneElement.value.classList.add('task-copy')
      cloneContainer.value.appendChild(cloneElement.value)
    }
    currentElement.style.visibility = 'hidden'

    const rect = currentElement.getBoundingClientRect()
    const originalX = rect.left

    cloneElement.value.style.top = `${event.clientY - offsetY.value / 2}px`
    cloneElement.value.style.left = `${originalX}px`

    let newIndex = draggingTaskIndex.value

    taskElements.forEach((taskElement, i) => {
      if (i !== draggingTaskIndex.value) {
        const rect = taskElement.getBoundingClientRect()
        const isAbove = event.clientY < rect.top + rect.height / 2 && event.clientY > rect.top
        const isBelow = event.clientY > rect.top + rect.height / 2 && event.clientY < rect.bottom
        if (isAbove && i < draggingTaskIndex.value!) {
          newIndex = i
        } else if (isBelow && i > draggingTaskIndex.value!) {
          newIndex = i
        }
      }
    })

    if (newIndex !== draggingTaskIndex.value) {
      const movedTask = groupList.value[id!].taskList.splice(draggingTaskIndex.value!, 1)[0]
      groupList.value[id!].taskList.splice(newIndex, 0, movedTask)
      draggingTaskIndex.value = newIndex
    }
  }
}

const onMouseUp = (event: MouseEvent) => {
  if (draggingTaskIndex.value !== null) {
    const taskElements = document.querySelectorAll('.task')
    const currentElement = taskElements[draggingTaskIndex.value] as HTMLElement

    currentElement.style.visibility = ''

    if (cloneContainer.value && cloneElement.value) {
      cloneContainer.value.removeChild(cloneElement.value)
      document.body.removeChild(cloneContainer.value)
      cloneElement.value = null
      cloneContainer.value = null
    }

    groupList.value[id!].taskList.forEach((task) => {
      task.dragging = false
    })
    document.body.style.cursor = ''
    draggingTaskIndex.value = null
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }
}

//Перенос текста
const formattedText = (item: Task) => {
  return item.title.replace(/\n/g, '<br>')
}

//Выборка иконки задач
const taskIcon = (item: Task): string => {
  let icon = ''
  if (!item.isEditing) {
    if (item.completionStatus) {
      icon = 'pi pi-check-circle'
    } else {
      icon = 'pi pi-circle'
    }
  } else {
    icon = 'pi pi-ellipsis-v'
  }
  return icon
}
</script>
<template>
  <div class="main-content w-full">
    <div class="title-container flex justify-content-between w-full py-3">
      <h1 class="text-4xl font-medium line-height-4 ml-8">
        {{ activeGroupTitle || 'Вы ещё не создали список!' }}
      </h1>
      <div class="buttons flex mr-8 gap-4">
        <Button
          v-if="id !== null"
          unstyled
          label="Редактировать группу"
          icon="pi pi-pen-to-square"
          :pt="{
            root: {
              class:
                'edit-button bg-orange-100 hover:bg-orange-200 px-4 border-round border-none flex gap-2 align-items-center transition-ease-out transition-duration-100 cursor-pointer',
            },
            label: { class: 'text-lg line-height-3' },
            icon: { class: 'text-xl' },
          }"
        ></Button>
        <Button
          unstyled
          label="Посмотреть котика"
          :pt="{
            root: {
              class:
                'edit-button bg-yellow-100 hover:bg-yellow-200 px-4 border-round border-none flex gap-2 align-items-center transition-ease-out transition-duration-100 cursor-pointer',
            },
            label: { class: 'text-lg line-height-3' },
          }"
          ><template #icon
            ><svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#2c3e50"
            >
              <path
                d="M180-475q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29Zm180-160q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29Zm240 0q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29Zm180 160q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM266-75q-45 0-75.5-34.5T160-191q0-52 35.5-91t70.5-77q29-31 50-67.5t50-68.5q22-26 51-43t63-17q34 0 63 16t51 42q28 32 49.5 69t50.5 69q35 38 70.5 77t35.5 91q0 47-30.5 81.5T694-75q-54 0-107-9t-107-9q-54 0-107 9t-107 9Z"
              /></svg></template
        ></Button>
      </div>
    </div>
    <div class="group-content flex flex-column gap-4 w-full mt-4">
      <Button
        unstyled
        @click="addTask"
        v-if="activeGroupTitle"
        label="Новая задача"
        icon="pi pi-plus-circle"
        :pt="{
          root: {
            class:
              'button hover:bg-bluegray-100 ml-8 px-4 border-round border-none flex gap-2 align-items-center transition-ease-out transition-duration-100 cursor-pointer w-5',
          },
          label: { class: 'text-base line-height-3' },
          icon: { class: 'text-xl' },
        }"
      ></Button>
      <div class="task-list flex flex-column gap-4 w-full" v-if="id !== null">
        <Button
          :key="item.id"
          v-for="(item, index) in groupList[id].taskList"
          @click="item.isEditing ? '' : (item.completionStatus = !item.completionStatus)"
          :pt="{
            root: {
              class: [
                'button hover:bg-bluegray-100 active:bg-bluegray-100 task mx-8 px-4 border-round border-none flex gap-2 align-items-center transition-ease-out transition-duration-100',
                {
                  'cursor-pointer': !item.isEditing,

                  'bg-bluegray-100': item.dragging,
                },
              ],
            },
          }"
        >
          <i
            class="text-xl"
            :class="[taskIcon(item), { 'cursor-move': item.isEditing }]"
            @mousedown="onMouseDown(index, $event)"
          ></i>
          <span
            :class="{ 'line-through': item.completionStatus }"
            class="text-base line-height-3 text-justify my-2"
            v-if="!item.isEditing"
            v-html="formattedText(item)"
          >
          </span>
          <Textarea
            rows="1"
            cols="20"
            autoResize
            v-if="item.isEditing"
            v-model="item.title"
            maxlength="250"
            class="textarea text-base line-height-3 border-none w-full bg-white-alpha-30 border-round-sm my-2"
            @mousedown.stop="item.isSelecting = true"
            @mouseup.stop="item.isSelecting = false"
            @mouseleave.stop="item.isSelecting = false"
            @keydown.enter.exact.prevent="editTask(item.id)"
          />
          <div class="edit-buttons ml-auto flex gap-2 align-content-center">
            <Button
              :icon="item.isEditing ? 'pi pi-check' : 'pi pi-pencil'"
              aria-label="Edit"
              @click.stop="editTask(item.id)"
              :pt="{
                root: {
                  class:
                    'border-round-xl border-none h-max w-max bg-white-alpha-60 hover:bg-white transition-ease-out transition-duration-100 cursor-pointer flex align-items-center p-2',
                },
                icon: { class: 'text-xl' },
                label: { class: 'max-w-0' },
              }"
            />
            <Button
              icon="pi pi-trash"
              aria-label="Delete"
              @click="deleteTask(item.id)"
              :pt="{
                root: {
                  class:
                    'border-round-xl border-none h-max w-max bg-white-alpha-60 hover:bg-red-200 transition-ease-out transition-duration-100 cursor-pointer flex align-items-center p-2',
                },
                icon: { class: 'text-xl' },
                label: { class: 'max-w-0' },
              }"
            />
          </div>
        </Button>
      </div>
    </div>
  </div>
</template>
<style scoped>
.title-container {
  border-bottom: 1px solid rgba(0, 0, 0, 25%);
}
.button {
  color: #2c3e50;
  background: rgba(224, 224, 224, 0.6);
  min-height: 50px;
  font-family: 'Nunito', serif;
}
.edit-button {
  color: #2c3e50;
  min-height: 50px;
  font-family: 'Nunito', serif;
}
.textarea {
  background: none;
  font-family: 'Nunito', serif;
  color: #2c3e50;
  outline: none;
  resize: none;
}
.task,
.task-copy {
  will-change: transform;
  transition: transform 0.1s;
}
.task-copy {
  position: relative;
  pointer-events: none;
  margin: 0 !important;
}
.task-copy__container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
}
.tooltip {
  color: #2c3e50;
  font-family: 'Nunito', serif;
}
</style>
