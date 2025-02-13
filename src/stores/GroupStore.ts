import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface Group {
  id: number
  title: string
  taskList: Task[]
  isEditing: boolean
  isActive: boolean
}

interface Task {
  id: number
  title: string
  completionStatus: boolean
  isEditing: boolean
  isSelecting: boolean
  dragging: boolean
}

export const useGroupStore = defineStore('group', () => {
  const groupList = ref<Group[]>(JSON.parse(localStorage.getItem('groupList') ?? '[]'))
  const activeGroupId = ref<number | null>(groupList.value.length > 0 ? 0 : null)

  const activeGroupTitle = computed(() => {
    if (activeGroupId.value !== null) {
      return groupList.value[activeGroupId.value].title
    } else {
      return 'Вы ещё не создали список!'
    }
  })

  const setActiveGroup = (index: number) => {
    groupList.value.forEach((group) => {
      group.isActive = false
    })
    activeGroupId.value = index
    groupList.value[index].isActive = true
    document.title = groupList.value[index].title + ' - To-Do List'
  }

  const updateGroup = () => {
    localStorage.setItem('groupList', JSON.stringify(groupList.value))
  }

  const deleteGroup = (deletingGroupId: Group['id']) => {
    activeGroupId.value = null
    groupList.value = groupList.value.filter((group) => group.id !== deletingGroupId)
    if (groupList.value.length > 0) {
      setActiveGroup(0)
      document.title = groupList.value[0].title + ' - To-Do List'
    }
    updateGroup()
  }

  const createGroup = () => {
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
      isEditing: false,
      isActive: false,
    }
    groupList.value.push(newGroup)
    setActiveGroup(newGroup.id)
    updateGroup()
  }

  const isActiveGroupId = (inputText: boolean) => {
    if (activeGroupId.value !== null) {
      return inputText
        ? groupList.value[activeGroupId.value].isEditing
        : !groupList.value[activeGroupId.value].isEditing
    }
    return !inputText
  }

  const editGroup = (groupIndex: number) => {
    if (groupList.value[groupIndex]) {
      const updatedGroup = { ...groupList.value[groupIndex] }
      updatedGroup.isEditing = !updatedGroup.isEditing

      if (!updatedGroup.isEditing) {
        updatedGroup.title = activeGroupTitle.value
      }
      groupList.value = groupList.value.map((group, index) =>
        index === groupIndex ? updatedGroup : group,
      )
      updateGroup()
    }
  }

  if (groupList.value.length > 0) setActiveGroup(0)

  return {
    groupList,
    activeGroupId,
    activeGroupTitle,
    setActiveGroup,
    updateGroup,
    deleteGroup,
    createGroup,
    isActiveGroupId,
    editGroup,
  }
})
