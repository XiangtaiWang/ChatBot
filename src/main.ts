import './assets/main.css'
import 'intl-tel-input/build/css/intlTelInput.css';
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ChatBotContent from './components/ChatBotContent.vue';
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

// if (window.location.pathname.startsWith('/embed_chatbot')) {
//     // If it's an embed route, mount EmbeddableChatbot directly
//     createApp(ChatBotContent).mount('#app');
//   } else {
//     // For other routes, mount the default App component as usual
//     app.mount('#app');
//   }
