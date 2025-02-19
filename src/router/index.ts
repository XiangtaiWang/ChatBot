import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Login from '../components/Login.vue';
import ChatBotContentSelector from '@/components/ChatBotContentSelector.vue';
import ChatbotSelector from '@/components/ChatBotManagementSelector.vue';
import ChatbotEditor from "@/components/ChatBotEditor.vue";
import ChatbotConfigurator from '@/components/ChatbotConfigurator.vue';
import ChatBotContent from '@/components/ChatBotContent.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/Home',
      name: 'Home',
      component: HomeView,
    },
    { path: '/Login', component: Login },
    { path: '/Chatbot', component: ChatBotContentSelector },
    { path: "/ChatbotSelector", name: "ChatbotSelector", component: ChatbotSelector },
    { path: "/edit/:id", name: "ChatbotEditor", component: ChatbotEditor },
    { path: '/', redirect: '/Login' },
    { path: '/ChatbotConfigurator/:id', name: "ChatbotConfigurator", component: ChatbotConfigurator},
    { path: '/embed_chatbot/:chatbotId', name: 'EmbedChatbot', component: ChatBotContent }
  ],
})

export default router
