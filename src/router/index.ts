import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Login from '../components/Login.vue';
import ChatBot from '@/components/ChatBot.vue';
import ChatbotSelector from '@/components/ChatBotSelector.vue';
import ChatbotEditor from "@/components/ChatBotEditor.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/Home',
      name: 'Home',
      component: HomeView,
    },
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import('../views/AboutView.vue'),
    // },
    { path: '/Login', component: Login },
    { path: '/Chatbot', component: ChatBot },
    { path: "/ChatbotSelector", name: "ChatbotSelector", component: ChatbotSelector },
    { path: "/edit/:id", name: "ChatbotEditor", component: ChatbotEditor },
    { path: '/', redirect: '/Login' },
  ],
})

export default router
