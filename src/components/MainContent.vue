<script lang="ts" setup>
import { ref, watch } from 'vue'
import Textarea from 'primevue/textarea'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'
import Dialog from 'primevue/dialog'
import axios from 'axios'
import Image from 'primevue/image'
import { useGroupStore } from '../stores/GroupStore'
import { useTaskStore } from '../stores/TaskStore'

const confirm = useConfirm()
const groupStore = useGroupStore()
const taskStore = useTaskStore()

const visible = ref<boolean>(false)
const image = ref<Image | null>(null)
const visibleModal = ref<boolean>(false)
const editableGroupTitle = ref<string>('')
watch(
  () => groupStore.activeGroupId,
  (newId) => {
    if (newId !== null && groupStore.groupList[newId]) {
      editableGroupTitle.value = groupStore.groupList[newId].title
    } else {
      editableGroupTitle.value = 'Вы ещё не создали список!'
    }
  },
)

const confirmDeleteGroup = (groupId: number) => {
  let group = groupStore.groupList[groupId]
  if (group) {
    if (group.taskList.length > 0) {
      confirm.require({
        message: 'Все задачи будут потеряны.',
        header: 'Вы уверены, что хотите удалить список?',
        onShow: () => {
          visible.value = true
        },
        onHide: () => {
          visible.value = false
        },
        accept: () => {
          groupStore.deleteGroup(group.id)
        },
      })
    } else {
      groupStore.deleteGroup(group.id)
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
    groupStore.groupList[groupStore.activeGroupId!].taskList[index].isEditing &&
    !groupStore.groupList[groupStore.activeGroupId!].taskList[index].isSelecting
  ) {
    draggingTaskIndex.value = index
    const currentTarget = event.currentTarget as HTMLElement
    offsetY.value = event.clientY - currentTarget.getBoundingClientRect().top

    groupStore.groupList[groupStore.activeGroupId!].taskList[index].dragging = true
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
      const movedTask = groupStore.groupList[groupStore.activeGroupId!].taskList.splice(
        draggingTaskIndex.value!,
        1,
      )[0]
      groupStore.groupList[groupStore.activeGroupId!].taskList.splice(newIndex, 0, movedTask)
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

    groupStore.groupList[groupStore.activeGroupId!].taskList.forEach((task) => {
      task.dragging = false
    })
    document.body.style.cursor = ''
    draggingTaskIndex.value = null
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
    groupStore.updateGroup
  }
}

//Перенос текста
const formattedText = (title: string) => {
  return title.replace(/\n/g, '<br>')
}

interface Image {
  id: string
  url: string
  width: number
  height: number
  breeds: []
  favourite: {}
}

const fetchData = async () => {
  image.value = null
  try {
    const response = await axios.get('https://api.thecatapi.com/v1/images/search')
    const data = response.data

    if (Array.isArray(data) && data.length > 0) {
      image.value = data[0]
      visibleModal.value = true
    } else {
      image.value = null
    }
  } catch (error) {
    console.log('Ошибка котиков: ', error)
    image.value = null
  }
}
</script>
<template>
  <div class="main-content w-full h-full flex flex-column">
    <div class="title-container flex align-items-center justify-content-between w-full py-3">
      <h1
        class="text-4xl font-medium line-height-4 ml-8 w-6"
        v-if="groupStore.isActiveGroupId(false)"
      >
        {{ groupStore.activeGroupTitle }}
      </h1>
      <InputText
        v-model="groupStore.groupList[groupStore.activeGroupId!].title"
        v-if="groupStore.isActiveGroupId(true)"
        maxlength="20"
        class="text-4xl font-medium line-height-4 ml-8 border-none bg-white-alpha-30 border-round-sm w-6"
        @keydown.enter.exact.prevent="groupStore.editGroup(groupStore.activeGroupId!)"
      />
      <div class="buttons flex mr-8 pr-2 gap-2" v-if="groupStore.activeGroupId !== null">
        <Button
          v-if="groupStore.activeGroupId !== null"
          @click.stop="groupStore.editGroup(groupStore.activeGroupId)"
          unstyled
          label="Редактировать список"
          :icon="
            groupStore.groupList[groupStore.activeGroupId].isEditing
              ? 'pi pi-check-square'
              : 'pi pi-pen-to-square'
          "
          :pt="{
            root: {
              class:
                'edit-button bg-yellow-100 hover:bg-yellow-200 px-3 border-round border-none flex gap-2 align-items-center transition-ease-out transition-duration-100 cursor-pointer',
            },
            label: { class: 'text-lg line-height-3' },
            icon: { class: 'text-xl' },
          }"
        ></Button>
        <Dialog
          v-model:visible="visibleModal"
          modal
          header="Ваш котик"
          :pt="{
            root: {
              class: 'px-3 py-2 border-round-md bg-white border-1 border-solid surface-border',
            },
            title: {
              class: 'text-xl',
            },
            content: {
              class: 'overflow-hidden flex justify-content-center align-items-center',
            },
          }"
          ><Image
            :src="image?.url"
            :pt="{
              image: {
                class: 'image',
              },
            }"
          ></Image
        ></Dialog>
        <Button
          unstyled
          @click="fetchData"
          aria-label="Посмотреть котика"
          v-if="!groupStore.groupList[groupStore.activeGroupId!].isEditing"
          :pt="{
            root: {
              class:
                'cat-button bg-yellow-100 hover:bg-yellow-200 border-round border-none flex align-items-center transition-ease-out transition-duration-100 cursor-pointer w-max',
            },
            label: { class: 'max-w-0' },
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
        <ConfirmDialog id="confirm">
          <template #container="{ message, acceptCallback, rejectCallback }">
            <div class="flex flex-column align-items-center p-5 surface-overlay border-round-2xl">
              <div
                class="border-circle bg-red-600 inline-flex justify-content-center align-items-center h-6rem w-6rem -mt-8"
              >
                <i class="pi pi-exclamation-circle text-7xl text-white"></i>
              </div>
              <span class="font-bold text-2xl block mb-2 mt-4">{{ message.header }}</span>
              <p class="mb-0">{{ message.message }}</p>
              <div class="flex align-items-center gap-4 mt-4">
                <Button
                  label="Удалить"
                  @click="acceptCallback"
                  class="w-7rem bg-red-100 hover:bg-red-200 py-2 border-round transition-ease-out transition-duration-100"
                ></Button>
                <Button
                  label="Отменить"
                  @click="rejectCallback"
                  class="w-7rem border-red-100 hover:border-red-200 border-solid border-2 py-2 border-round transition-ease-out transition-duration-100"
                ></Button>
              </div>
            </div>
          </template>
        </ConfirmDialog>
        <Button
          unstyled
          aria-label="Удалить группу"
          :aria-expanded="visible"
          :aria-controls="visible ? 'confirm' : ''"
          icon="pi pi-trash"
          v-if="groupStore.groupList[groupStore.activeGroupId!].isEditing"
          @click.stop="confirmDeleteGroup(groupStore.activeGroupId!)"
          :pt="{
            root: {
              class:
                'delete-button bg-red-100 hover:bg-red-200 border-round border-none flex align-items-center transition-ease-out transition-duration-100 cursor-pointer w-max',
            },
            label: { class: 'max-w-0' },
            icon: { class: 'text-xl' },
          }"
        >
        </Button>
      </div>
    </div>
    <div class="tasks-container flex flex-column gap-4 w-full mt-4 mb-2 overflow-y-auto">
      <Button
        unstyled
        @click="taskStore.addTask"
        v-if="groupStore.activeGroupId !== null"
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
      <div class="task-list flex flex-column gap-4 w-full" v-if="groupStore.activeGroupId !== null">
        <Button
          :key="item.id"
          v-for="(item, index) in groupStore.groupList[groupStore.activeGroupId].taskList"
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
            :class="[taskStore.taskIcon(item), { 'cursor-move': item.isEditing }]"
            @mousedown="onMouseDown(index, $event)"
          ></i>
          <span
            :class="{ 'line-through': item.completionStatus }"
            class="text-base line-height-3 text-justify my-2"
            v-if="!item.isEditing"
            v-html="formattedText(item.title)"
          >
          </span>
          <Textarea
            rows="1"
            cols="20"
            autoResize
            v-if="item.isEditing"
            v-model="item.title"
            maxlength="250"
            class="textarea text-base line-height-3 border-none w-full bg-white-alpha-30 text-justify border-round-sm my-2"
            @mousedown.stop="item.isSelecting = true"
            @mouseup.stop="item.isSelecting = false"
            @mouseleave.stop="item.isSelecting = false"
            @keydown.enter.exact.prevent="taskStore.editTask(item.id)"
          />
          <div class="edit-buttons ml-auto flex gap-2 align-content-center">
            <Button
              :icon="item.isEditing ? 'pi pi-check' : 'pi pi-pencil'"
              aria-label="Edit"
              @click.stop="taskStore.editTask(item.id)"
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
              @click="taskStore.deleteTask(item.id)"
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
.cat-button {
  padding: 0px 14px;
}
.delete-button {
  padding: 0px 16px;
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
.tasks-container {
  scrollbar-gutter: stable;
}
.tasks-container::-webkit-scrollbar {
  width: 0.5rem;
}
.tasks-container::-webkit-scrollbar-thumb {
  background-color: rgba(44, 62, 80, 0.5);
  border-radius: 5rem;
}
.tasks-container::-webkit-scrollbar-track-piece:start {
  background: transparent;
}
.tasks-container::-webkit-scrollbar-track-piece:end {
  background: transparent;
}
</style>
<style>
.image {
  max-width: 500px;
  width: 100%;
  height: auto;
  object-fit: contain;
}
</style>
