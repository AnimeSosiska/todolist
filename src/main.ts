import './assets/main.css'
import '/node_modules/primeflex/primeflex.css'
import '/node_modules/primeflex/themes/primeone-light.css'
import '/node_modules/primeicons/primeicons.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import ConfirmationService from 'primevue/ConfirmationService'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(PrimeVue)
app.use(ConfirmationService)
app.component('InputText', InputText)
app.component('Button', Button)
app.use(router)

app.mount('#app')
