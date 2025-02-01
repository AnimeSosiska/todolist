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
    id: taskList.value.length,
    title: 'Новая задача',
    completionStatus: false,
    isEditing: false,
    dragging: false,
  }
  groupList.value[id!].taskList.unshift(newTask)
  localStorage.setItem('groupList', JSON.stringify(groupList.value))
}

//Кнопка, удаляющая задачу
const deleteTask = () => {
  groupList.value[id!].taskList = taskList.value.filter((task) => task.id !== id)
}

//Перетаскивание задач
const draggingTaskIndex = ref<number | null>(null)
const offsetY = ref(0)
const cloneElement = ref<HTMLElement | null>(null)
const cloneContainer = ref<HTMLDivElement | null>(null)

const onMouseDown = (index: number, event: MouseEvent) => {
  if (groupList.value[id!].taskList[index].isEditing) {
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
      // document.body.appendChild(cloneElement.value)
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
      const movedTask = taskList.value.splice(draggingTaskIndex.value!, 1)[0]
      taskList.value.splice(newIndex, 0, movedTask)
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
</script>
<template>
  <div class="main-content w-full">
    <div class="title-container flex w-full py-3">
      <h1 class="text-4xl font-medium line-height-4 ml-8">
        {{ activeGroupTitle || 'Вы ещё не создали список!' }}
      </h1>
    </div>
    <div class="group-content flex flex-column gap-4 w-full mt-4">
      <Button
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
          @mousedown="onMouseDown(index, $event)"
          :icon="item.completionStatus ? 'pi pi-check-circle' : 'pi pi-circle'"
          :pt="{
            root: {
              class: [
                'button task hover:bg-bluegray-100 mx-8 px-4 border-round border-none flex gap-2 align-items-center transition-ease-out transition-duration-100',
                {
                  'cursor-pointer': !item.isEditing,
                  'cursor-move': item.isEditing,
                  'bg-bluegray-100': item.dragging,
                },
              ],
            },
          }"
        >
          <i
            :class="item.completionStatus ? 'pi pi-check-circle' : 'pi pi-circle'"
            class="text-xl"
          ></i>
          <span
            :class="{ 'line-through': item.completionStatus }"
            class="text-base line-height-3 text-justify"
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
            class="textarea text-base line-height-3 border-none w-full bg-white-alpha-30 border-round-sm my-2"
            @keydown.enter.exact.prevent="item.isEditing = false"
          />
          <div class="edit-buttons ml-auto flex gap-2 align-content-center">
            <Button
              :icon="item.isEditing ? 'pi pi-check' : 'pi pi-pencil'"
              aria-label="Edit"
              @click.stop="item.isEditing = !item.isEditing"
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
              @click="deleteTask()"
              :pt="{
                root: {
                  class:
                    'border-round-xl border-none h-max w-max bg-white-alpha-60 hover:bg-white transition-ease-out transition-duration-100 cursor-pointer flex align-items-center p-2',
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
.button:hover {
  background: rgba(224, 224, 224, 1);
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
</style>
