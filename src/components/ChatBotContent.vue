
<template>
  <div class="messages">
    <div v-if="lastMessage" :class="['message', lastMessage.sender]">
      <button @click="handleOptionBackToLastStep">Back</button> <p>{{ lastMessage.text }}</p>
      <div v-if="lastMessage.nextSteps" class="options">
        <button
          v-for="(option, optIndex) in lastMessage.nextSteps"
          :key="optIndex"
          @click="handleOptionClick(option.toString())"
        >
          {{ option }}
        </button>
      </div>
    </div>

    <div ref="aiAssistant" class="ai-assistant">
      <h3>Ask AI Question</h3>
      <input v-model="question" :disabled="isProcessing" placeholder="Enter your question..." />
      <div>
        <p v-if="aiResponse.answer != ''" class="ai-response-answer">{{ aiResponse.answer }}</p>
        <div v-if="aiResponse.reference">
          <a v-for="(link, index) in aiResponse.reference" :href="link" target="_blank" class="ai-response-reference">Reference{{ index + 1 }}</a>
        </div>
      </div>
      <button @click="submitQuestion" :disabled="isProcessing">Ask</button>
      <div v-if="aiResponse.answer != ''">
        <button v-if="isFeedbackVisible" @click="saveFeedback(aiResponse.question, aiResponse.answer, true)">Correct</button>
        <button v-if="isFeedbackVisible" @click="handleIncorrectClick">Incorrect</button>
        <div v-if="isIncorrectInputVisible">
          <input type="text" v-model="correctAnswer" placeholder="Enter the correct answer..." />
          <button @click="saveFeedback(aiResponse.question, correctAnswer, true)" :disabled="isProcessing">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, defineProps } from "vue";
import { doc, getDocs, collection, addDoc, Timestamp, query, where, collectionGroup } from "firebase/firestore";
import { getFirestoreDb, getCurrentUserId } from "../firebase";
import { callApi } from "@/utils/apiCaller";
import { useRoute } from 'vue-router';
const route = useRoute();
// const props = defineProps<{ chatbotId: string }>();
const props = defineProps<{
  chatbotId?: string;
}>();
const chatbotIdFromRoute = route.params.chatbotId as string | undefined;
const db = getFirestoreDb();
const userId = getCurrentUserId();
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


type AIResponse = {
  answer: string;
  question: string;
  reference: string | null;
}

// const chatbots = ref<Chatbot[]>([]);
const selectedChatbotId = ref<string | undefined>(props.chatbotId);
const messages = ref<Message[]>([]);
const lastMessage = ref<Message | null>(null);
const steps: Record<string, Option> = {};
const question = ref('');
const isProcessing = ref(false);
const isFeedbackVisible = ref(false);
const isIncorrectInputVisible = ref(false);
const correctAnswer = ref('');

const aiResponse = ref<AIResponse>({
  answer: '',
  question: '',
  reference: null,
});

const handleOptionClick = (option: string) => {
    const step = steps[option];
    if (step) {
    let message = { text: step.label, sender: "bot", nextSteps: step.nextSteps } as Message;
      addMessage(message);
    }
};

const handleOptionBackToLastStep = ()=>{
  if (messages.value.length>1) {
    messages.value.pop();
  }
};

const addMessage = (message: Message) => {
  messages.value.push(message);
  };

watch(() => messages.value.length, (newLen) => {

  lastMessage.value = messages.value[messages.value.length - 1];
  
});

const submitQuestion = async () => {
  if (!selectedChatbotId.value || !question.value) return;

  isProcessing.value = true;
  isFeedbackVisible.value = true;

  const payload = {
    uid: userId,
    chatbotId: selectedChatbotId.value,
    question: question.value
};

  try {
    let res = JSON.parse(await callApi("/asking", payload));
    aiResponse.value.answer = res.answer;
    aiResponse.value.reference = res.reference;
    aiResponse.value.question = res.question;
  } catch (error) {
    console.error('Error asking AI question:', error);
  }

  isProcessing.value = false;
};

const handleIncorrectClick = () => {
  isIncorrectInputVisible.value = true;
}
const startChat = (initialStep: string) => {
  const startStep = steps[initialStep];
  if (startStep) {
    let message = { text: startStep.label, sender: "bot", nextSteps: startStep.nextSteps } as Message;
    addMessage(message);
      } else {
    console.error("Initial step not found:", initialStep);
      }
};

const saveFeedback = async (user_query, llm_response, is_correct) => {
  try {
    const feedbacksCollection = collection(db, `chatbot_interactions/${selectedChatbotId.value}/feedbacks`);
    await addDoc(feedbacksCollection, {
      user_query,
      llm_response,
      is_correct,
      timestamp: Timestamp.now(),
      metadata: {
        user_id: userId,
      },
});
    alert('Feedback saved successfully!');
    isIncorrectInputVisible.value = false;
  } catch (error) {
    alert('Error saving feedback');
  }
};

const loadChatbot = async (chatbotId: string) => {
  console.log(chatbotId);

  const querySnapshot = await getDocs(collection(db, "ChatBots"));
  const matchingDocs = querySnapshot.docs.filter(doc => {
    const chatbots = doc.data().chatbots;
    return chatbots.some(chatbot => chatbot.id === chatbotId);
  });

  if (matchingDocs.length > 0) {
  const doc = matchingDocs[0];
  const data = doc.data(); // This gets the data of the matched document
  // Access the 'chatbots' array
  const chatbots = data.chatbots;
  // Find the specific chatbot object using chatbotId
  const chatbot = chatbots.find(chatbot => chatbot.id === chatbotId);
  Object.values(chatbot.options).forEach((option: any) => {
          steps[option.name] = option;
        });
        startChat(chatbot.initialStep);

  console.log(chatbot.name);

} else {

  console.log("No chatbot found with the given ID.");
}

};


onMounted(async () => {
  // if (props.chatbotId) {
  //   await loadChatbot(props.chatbotId);
  // }
  let chatbotIdToLoad: string | null = null;

// 1. Check for chatbotId prop first (takes precedence)
if (props.chatbotId) {
  chatbotIdToLoad = props.chatbotId;
  console.log("Chatbot ID loaded from props:", chatbotIdToLoad);
} else {
  // const chatbotIdFromRoute = route.params.chatbotId as string | null;
  // 2. If no prop, check URL parameters
  // const urlParams = new URLSearchParams(window.location.search);
  // const chatbotIdFromUrl = urlParams.get('chatbotId');
  if (chatbotIdFromRoute) {
    chatbotIdToLoad = chatbotIdFromRoute;
    console.log("Chatbot ID loaded from URL parameter:", chatbotIdToLoad);
  } else {
    console.error("chatbotId not found in props or URL parameters.");
  }
}

if (chatbotIdToLoad) {
  await loadChatbot(chatbotIdToLoad);
}
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