import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useGroupStore } from './GroupStore'

interface Task {
  id: number
  title: string
  completionStatus: boolean
  isEditing: boolean
  isSelecting: boolean
  dragging: boolean
}

export const useTaskStore = defineStore('task', () => {
  const groupStore = useGroupStore()
  const taskList = computed(() => {
    if (
      groupStore.activeGroupId !== null &&
      groupStore.groupList[groupStore.activeGroupId].taskList !== null
    ) {
      return groupStore.groupList[groupStore.activeGroupId].taskList
    }
    return null
  })

  const addTask = () => {
    if (taskList.value !== null && groupStore.activeGroupId !== null) {
      const newTask: Task = {
        id: taskList.value.length,
        title: 'Новая задача',
        completionStatus: false,
        isEditing: false,
        isSelecting: false,
        dragging: false,
      }
      groupStore.groupList[groupStore.activeGroupId].taskList.unshift(newTask)
      groupStore.updateGroup()
    }
  }

  const deleteTask = (itemId: number) => {
    if (taskList.value && groupStore.activeGroupId !== null) {
      groupStore.groupList[groupStore.activeGroupId].taskList = taskList.value.filter(
        (task) => task.id !== itemId,
      )
      groupStore.updateGroup()
    }
  }

  const editTask = (taskId: number) => {
    if (taskList.value && groupStore.activeGroupId !== null) {
      let item = groupStore.groupList[groupStore.activeGroupId].taskList.find(
        (task) => task.id === taskId,
      )

      if (item) {
        if (!item.isEditing) {
          item.isEditing = true
        } else if (item.isEditing) {
          item.isEditing = false
          groupStore.updateGroup()
        }
      }
    }
  }

  const taskIcon = (item: Task): string => {
    let icon = ''
    if (!item.isEditing) {
      icon = item.completionStatus ? 'pi pi-check-circle' : 'pi pi-circle'
    } else {
      icon = 'pi pi-ellipsis-v'
    }
    return icon
  }

  return {
    taskList,
    addTask,
    deleteTask,
    editTask,
    taskIcon,
  }
})
