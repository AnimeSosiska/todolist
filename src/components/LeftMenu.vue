<script lang="ts" setup>
import Logo from './icons/Logo.vue'
import { useGroupStore } from '../stores/GroupStore'
const groupStore = useGroupStore()

const ripple = (e: MouseEvent) => {
  const target = e.target as HTMLDivElement
  const rect = target.getBoundingClientRect()
  let x = e.clientX - rect.left
  let y = e.clientY - rect.top

  let ripples = document.createElement('span')
  ripples.classList.add('ripple')
  ripples.style.left = x + 'px'
  ripples.style.top = y + 'px'
  target.appendChild(ripples)

  setTimeout(() => {
    ripples.remove()
  }, 1000)
}
</script>
<template>
  <div class="menu border-round-left-2xl border-none max-w-14rem w-full h-full flex flex-column">
    <div class="logo-container relative overflow-hidden" @click.stop="(event) => ripple(event)">
      <Logo id="logo" class="h-full" />
    </div>
    <div class="groups-container flex flex-column gap-4 mt-4 overflow-y-auto pb-2 pt-1 w-full">
      <Button
        label="Новый список"
        icon="pi pi-folder-plus"
        :pt="{
          root: {
            class:
              'shadow-2 hover:bg-bluegray-100 transition-duration-100 ml-3 mr-2 px4 border-round border-none flex gap-2 align-items-center transition-ease-out cursor-pointer',
          },
          label: { class: 'text-base line-height-3' },
          icon: { class: 'text-xl' },
        }"
        @click="groupStore.createGroup()"
      />
      <Button
        v-for="(item, index) in groupStore.groupList"
        :key="item.id"
        :label="item.title"
        :pt="{
          root: {
            class: [
              'shadow-2 transition-duration-100 ml-3 mr-2 px4 border-round border-none flex gap-2 align-items-center transition-ease-out cursor-pointer',
              {
                'bg-yellow-50 hover:bg-yellow-100': item.isActive,
                'hover:bg-bluegray-100': !item.isActive,
              },
            ],
          },
          label: {
            class:
              'text-base line-height-3 mx-auto white-space-nowrap text-overflow-ellipsis overflow-hidden',
          },
          icon: { class: 'text-xl' },
        }"
        @click="groupStore.setActiveGroup(index)"
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
  display: flex;
  min-height: max-content;
}
#logo {
  padding: 18px 0 18px 0;
  margin: auto;
  pointer-events: none;
  z-index: 50;
}
.groups-container {
  scrollbar-gutter: stable;
}
.groups-container::-webkit-scrollbar {
  width: 0.5rem;
}
.groups-container::-webkit-scrollbar-thumb {
  background-color: rgba(44, 62, 80, 0.5);
  border-radius: 5rem;
}
.groups-container::-webkit-scrollbar-track-piece:start {
  background: transparent;
}
.groups-container::-webkit-scrollbar-track-piece:end {
  background: transparent;
}

Button {
  color: #2c3e50;
  border-color: #2c3e50;
  background: #e0e0e0;
  min-height: 50px;
  font-family: 'Nunito', serif;
}
</style>
<style>
.ripple {
  background-color: #fff;
  position: absolute;
  transform: translate(-50%, -50%);
  pointer-events: none;
  border-radius: 50%;
  animation: ripple-animate 1s linear infinite;
}

@keyframes ripple-animate {
  0% {
    width: 0;
    height: 0;
  }
  100% {
    width: 500px;
    height: 500px;
    opacity: 0;
  }
}
</style>
