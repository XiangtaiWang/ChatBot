<template>
    <div class="chatbot-selector">
      <h1>Chatbot Management</h1>
      <ul>
        <li v-for="(chatbot, index) in chatbots" :key="index">
          <span>{{ chatbot.name }}</span>
          <button @click="editChatbot(chatbot.id)">Edit</button>
          <button @click="deleteChatbot(index)">Delete</button>
        </li>
      </ul>
      <button @click="addChatbot">Add New Chatbot</button>
    </div>
  </template>
  
  <script lang="ts" setup>
  import { ref, onMounted } from "vue";
  import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
  import { getFirestoreDb, getCurrentUserId } from "../firebase";
  import { useRouter } from "vue-router";
  
  const db = getFirestoreDb();
  const userId = getCurrentUserId();
  const chatbotsDocRef = doc(db, "ChatBots", userId as string);
  const router = useRouter();
  
  const chatbots = ref<{ id: string; name: string; options: any[]; createdOn: string}[]>([]);
  
  // Load all chatbots for the user
  const loadChatbots = async () => {
    const docSnap = await getDoc(chatbotsDocRef);
    if (docSnap.exists()) {
      chatbots.value = docSnap.data().chatbots || [];
    } else {
      chatbots.value = [];
    }
  };
  
  // Add a new chatbot
  const addChatbot = async () => {
    const docSnap = await getDoc(chatbotsDocRef);
    if(!docSnap.exists()){
      await setDoc(doc(db, "ChatBots", userId as string), {
    });
    }
    const now = new Date()
    const newChatbot = { id: `chatbot_${Date.now()}`, name: "New Chatbot", options: [], createdOn: now.toDateString() };
    chatbots.value.push(newChatbot);
    await updateDoc(chatbotsDocRef, { chatbots: chatbots.value });
  };
  
  // Delete a chatbot
  const deleteChatbot = async (index: number) => {
    chatbots.value.splice(index, 1);
    await updateDoc(chatbotsDocRef, { chatbots: chatbots.value });
  };
  
  // Navigate to the chatbot editor
  const editChatbot = (id: string) => {
    router.push({ name: "ChatbotEditor", params: { id } });
  };
  
  onMounted(loadChatbots);
  </script>
  
  <style scoped>
  .chatbot-selector {
    padding: 16px;
  }
  
  ul {
    list-style: none;
    padding: 0;
  }
  
  li {
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  button {
    margin-left: 8px;
  }
  </style>