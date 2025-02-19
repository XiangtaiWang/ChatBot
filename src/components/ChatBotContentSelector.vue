
<template>
  <div class="chatbot">
    <button v-if="selectedChatbotId" @click="resetChatbot" class="chatbot-button">Chatbot List</button>

    <div v-if="!selectedChatbotId" class="chatbot-list">
      <h3>Available Chatbots:</h3>
      <ul>
        <li v-for="(chatbot, index) in chatbots" :key="index">
          <button @click="selectChatbot(chatbot.id)" class="chatbot-button">{{ chatbot.name }}</button>
        </li>
      </ul>
    </div>

    <ChatBotContent v-else :chatbotId="selectedChatbotId" /> 
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from "vue";
import { doc, getDoc } from "firebase/firestore";
import { getFirestoreDb, getCurrentUserId } from "../firebase";

import ChatBotContent from "./ChatBotContent.vue";


const db = getFirestoreDb();
const userId = getCurrentUserId();
const docId = `${userId}`;

interface Option {
  nextSteps: String[] | undefined;
  label: string;
  nextStep: string[];
}

interface Message {
  text: string;
  sender: "bot" | "user";
  nextSteps: String[] | null;
}

interface Chatbot {
  id: string;
  name: string;
  initialStep: string;
  options: Record<string, Message>;
}

const chatbots = ref<Chatbot[]>([]);
const selectedChatbotId = ref<string | null>(null);
const messages = ref<Message[]>([]);
const lastMessage = ref<Message | null>(null);
const steps: Record<string, Option> = {};



const loadChatbots = async () => {
  const docRef = doc(db, "ChatBots", docId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();

    if (data && data.chatbots) {
      chatbots.value = data.chatbots;
    } else {
      console.error("No chatbots found for this user.");
    }
  } else {
    console.error("No chatbot data found for this user.");
  }
};

const selectChatbot = (chatbotId: string) => {
  selectedChatbotId.value = chatbotId;
  const selectedChatbot = chatbots.value.find((cb) => cb.id === chatbotId);

  if (selectedChatbot) {

    Object.values(selectedChatbot.options).forEach((option: any) => {
      if (option) {
        steps[option.name] = option;
      }
    });

    startChat(selectedChatbot.initialStep);
  } else {
    console.error("Chatbot not found for ID:", chatbotId);
  }
};

const startChat = (initialStep: string) => {
  const startStep = steps[initialStep];
  
  if (startStep) {
    let message = { text: startStep.label, sender: "bot", nextSteps: startStep.nextSteps } as Message;
    addMessage(message);
    
  } else {
    console.error("Initial step not found:", initialStep);
  }
};


const addMessage = (message: Message) => {
  messages.value.push(message);
};

watch(() => messages.value.length, (newLen, oldLen) => {
  if(newLen == 0){
    selectedChatbotId.value = null
  }else{
    lastMessage.value = messages.value[messages.value.length - 1];
  }
  
});

const resetChatbot = () => {
  selectedChatbotId.value = null;
}

onMounted(async () => {
  await loadChatbots();
});
</script>

<style scoped>
.chatbot {
  width: 400px;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
}
.chatbot-button {
  background-color: #4CAF50; /* Green background */
  border: none; /* Remove borders */
  color: white; /* White text */
  padding: 15px 32px; /* Some padding */
  text-align: center; /* Centered text */
  text-decoration: none; /* Remove underline */
  display: inline-block; /* Make the button take up full width */
  font-size: 16px; /* Increase font size */
  margin: 4px 2px; /* Add some margin */
  cursor: pointer; /* Mouse pointer on hover */
  border-radius: 8px; /* Rounded corners */
}

.chatbot-button:hover {
  background-color: #45a049; /* Darker green on hover */
}
.chatbot-list {
  margin-bottom: 16px;
}

.chatbot-list h3 {
  margin-bottom: 8px;
}

.chatbot-list ul {
  list-style: none;
  padding: 0;
}

.chatbot-list li {
  margin-bottom: 8px;
}

.messages {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 16px;
}

.message {
  margin: 8px 0;
  padding: 8px;
  border-radius: 4px;
  background-color: #e0f7fa;
}

.message.user {
  background-color: #ffecb3;
  align-self: flex-end;
}

.options button {
  margin: 4px;
  padding: 8px 16px;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.options button:hover {
  background-color: #0056b3;
}

.ai-assistant {
  margin-top: 16px;
  padding: 12px;
  background-color: #f1f5f9;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
}

.ai-assistant input {
  width: calc(100% - 24px);
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  transition: opacity .3s ease-in-out, pointer-events .3s ease-in-out;
}

.ai-assistant input[disabled] {
  opacity: 0.5;
  pointer-events: none;
}

.ai-assistant button {
  align-self: flex-start;
  padding: 10px 16px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity .3s ease-in-out, pointer-events .3s ease-in-out;
}

.ai-assistant button[disabled] {
  opacity: 0.5;
  pointer-events: none;
}

.ai-response-answer {
  font-weight: bold;
  color: #007bff;
}

.ai-response-reference {
  color: #007bff;
  text-decoration: underline;
}
</style>