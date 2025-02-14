<template>
  <div class="options-editor">
    <h1>Edit Chatbot</h1>
    <input v-model="chatbot.name" placeholder="Chatbot Name" type="text" required />
    <h2>Edit Options</h2>
    <ul>
      <li v-for="(option, index) in chatbot.options" :key="index">
        <input
          v-model="option.label"
          placeholder="Display Text"
          type="text"
          required
        />
        <input
          v-model="option.name"
          placeholder="Unique Name"
          type="text"
          required
        />
        <div>
          <h3>Next Steps</h3>
          <ul>
            <li v-for="(nextStep, stepIndex) in option.nextSteps" :key="stepIndex">
              <input v-model="option.nextSteps[stepIndex]" placeholder="Next Step" type="text" />
              <button @click="deleteNextStep(index, stepIndex)">Delete</button>
            </li>
          </ul>
          <button @click="addNextStep(index)">Add Next Step</button>
        </div>
        <label>
          <input
            type="radio"
            :checked="chatbot.initialStep === option.name"
            @change="setInitialStep(option.name)"
          />
          Set as Initial Step
        </label>
        <button @click="deleteOption(index)">Delete Option</button>
      </li>
    </ul>
    <button @click="addOption">Add Option</button>
    <button class="save-button" @click="saveChatbot">Save All Changes</button>

    <!-- New section for URL input and Embed button -->
    <div class="embed-section">
      <h2>Train your own AI!</h2>
      <input v-model="rootUrl" placeholder="Enter an URL" type="text" required />
      <button @click="embedChatbot">Embed</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getFirestoreDb, getCurrentUserId } from "../firebase";
import { callApi } from '@/utils/apiCaller';
import axios from 'axios'; // Import axios for HTTP requests


const db = getFirestoreDb();
const userId = getCurrentUserId();
const chatbotsDocRef = doc(db, "ChatBots", userId as string);
const route = useRoute();
const router = useRouter();

const chatbotId = route.params.id as string;
const chatbot = ref<{ id: string; name: string; initialStep: string; options: any[] }>({
  id: "",
  name: "",
  initialStep: "", // Used to specify the initial step name
  options: [],
});

// Load chatbot data
const loadChatbot = async () => {
  const docSnap = await getDoc(chatbotsDocRef);
  if (docSnap.exists()) {
    const chatbots = docSnap.data().chatbots || [];
    const targetChatbot = chatbots.find((c: any) => c.id === chatbotId);
    if (targetChatbot) {
      chatbot.value = targetChatbot;
    } else {
      router.push({ name: "ChatbotSelector" });
    }
  } else {
    router.push({ name: "ChatbotSelector" });
  }
};


const saveChatbot = async () => {
  const docSnap = await getDoc(chatbotsDocRef);
  if (docSnap.exists()) {
    const chatbots = docSnap.data().chatbots || [];
    const updatedChatbots = chatbots.map((c: any) =>
      c.id === chatbotId ? chatbot.value : c
    );
    await updateDoc(chatbotsDocRef, { chatbots: updatedChatbots });
    alert("Changes saved!");
  }
};

// Add, delete, and validate functions
const addOption = () =>
  chatbot.value.options.push({ label: "", name: "", nextSteps: [] });
const deleteOption = (index: number) => {
  const deletedOption = chatbot.value.options[index];
  chatbot.value.options.splice(index, 1);
  // If the deleted option was the initial step, reset initialStep
  if (chatbot.value.initialStep === deletedOption.name) {
    chatbot.value.initialStep = "";
  }};
const addNextStep = (optionIndex: number) =>
  chatbot.value.options[optionIndex].nextSteps.push("");
const deleteNextStep = (optionIndex: number, stepIndex: number) =>
  chatbot.value.options[optionIndex].nextSteps.splice(stepIndex, 1);

// Set initial step by name
const setInitialStep = (stepName: string) => {
  chatbot.value.initialStep = stepName;
};

// New data property for the URL input
const rootUrl = ref("");

// Method to send POST request
const embedChatbot = async () => {
  try {
    let payload = {
      uid: userId,
      rootUrl: rootUrl.value,
      chatbotId: chatbotId,
    }
    let res = callApi("/embedding", payload)
    // const response = await axios.post('http://127.0.0.1:8000/embedding', {
    //   uid: userId,
    //   rootUrl: rootUrl.value,
    //   chatbotId: chatbotId,
    // });

    // console.log(response.data);
    // await axios.post('http://127.0.0.1:8000/hi')
    alert("Train successfully!");
  } catch (error) {
    console.error(error);
    alert("Failed to send embed request.");
  }
};

onMounted(loadChatbot);
</script>

<style scoped>
.options-editor {
  width: 600px;
  margin: auto;
  padding: 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.options-editor h1,
.options-editor h2 {
  margin-bottom: 16px;
}

.options-editor ul {
  list-style: none;
  padding: 0;
}

.options-editor li {
  margin-bottom: 16px;
}

button {
  margin-top: 8px;
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

button.save-button {
  background-color: #28a745;
}

button.save-button:hover {
  background-color: #218838;
}

.embed-section {
  margin-top: 32px;
}
</style>