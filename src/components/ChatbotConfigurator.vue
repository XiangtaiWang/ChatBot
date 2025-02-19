<template>
  <div class="container">
    <button @click="goBack" class="back-button">Back</button>
    <input v-model="whatsappBusinessAccountId" type="text" placeholder="WhatsApp Business Account ID" class="input-field">
    <button @click="save" class="save-button">Save</button>
    <button v-if="whatsappBusinessAccountId" @click="deleteAccount" class="delete-button">Delete</button>
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    <div v-if="successMessage" class="success-message">{{ successMessage }}</div>

    <div class="help-section">
      <h2>Setting up your Chatbot with WhatsApp </h2>
      <p>Follow these steps to create and configure your WhatsApp Business Account:</p>
      <ol>
        <li><a href="https://business.whatsapp.com" target="_blank" rel="noopener noreferrer">Create a WhatsApp Business Account</a></li>
        <li>Follow the instructions to set up your business profile and phone number.</li>
        <li><a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer">Create a WhatsApp App</a></li>
        <li>Configure your Webhook URL for receiving incoming messages. Insert "blablabla as webhook url" and "token as validation token". See <a href="https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks" target="_blank" rel="noopener noreferrer">Webhook documentation</a> for more details.</li>
        <li>copy this code into your javascript or wordpress<ClipboardCopy :text= "iFrameHTMLCode" /></li>
      </ol>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { getFirestoreDb, getCurrentUserId } from "../firebase";
import ClipboardCopy from './ClipboardCopy.vue';
const router = useRouter();


const db = getFirestoreDb();
const route = useRoute()

const chatBotId = route.params.id
const whatsappBusinessAccountId = ref('')
const errorMessage = ref('')
const successMessage = ref('')

const goBack = () => {
  router.go(-1)
}

const fetchWhatsAppAccount = async () => {
  try {
    const userId = getCurrentUserId();
    const docRef = doc(db, 'ChatBots', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const chatbots = docSnap.data().chatbots || [];
      const chatbot = chatbots.find(bot => bot.id === chatBotId);
      if (chatbot && chatbot.whatsappBusinessAccountId) {
        whatsappBusinessAccountId.value = chatbot.whatsappBusinessAccountId;
      }
    }
  } catch (error) {
    console.error("Error fetching WhatsApp Business Account ID:", error);
  }
}

onMounted(fetchWhatsAppAccount);

const save = async () => {
  if (!whatsappBusinessAccountId.value) {
    errorMessage.value = 'Please enter a WhatsApp Business Account ID.'
    successMessage.value = ''
    return
  }

  try {
    const userId = getCurrentUserId();
    const docRef = doc(db, 'ChatBots', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
    const chatbots = docSnap.data().chatbots || [];
      const existingAccount = chatbots.find(bot => bot.id !== chatBotId && bot.whatsappBusinessAccountId === whatsappBusinessAccountId.value);
      if (existingAccount) {
        errorMessage.value = `This WhatsApp Business Account ID is already in use by another chatbot: ${existingAccount.name}.`;
        successMessage.value = '';
        return;
  }
      const index = chatbots.findIndex(bot => bot.id === chatBotId);

      if (index !== -1) {
        const updatedChatbot = { ...chatbots[index], whatsappBusinessAccountId: whatsappBusinessAccountId.value };
        const updatedChatbots = [...chatbots];
        updatedChatbots[index] = updatedChatbot;
        await updateDoc(docRef, { chatbots: updatedChatbots });
        errorMessage.value = ''
        successMessage.value = 'WhatsApp Business Account ID saved successfully!'
      } else {
        errorMessage.value = 'Chatbot not found.';
    successMessage.value = '';
  }
}
  } catch (error) {
    errorMessage.value = 'An error occurred while saving.'
    successMessage.value = ''
    console.error(error)
  }
}

const deleteAccount = async () => {
  try {
    const userId = getCurrentUserId();
    const docRef = doc(db, 'ChatBots', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const chatbots = docSnap.data().chatbots || [];
      const index = chatbots.findIndex(bot => bot.id === chatBotId);

      if (index !== -1) {
        const updatedChatbot = { ...chatbots[index], whatsappBusinessAccountId: '' };
        const updatedChatbots = [...chatbots];
        updatedChatbots[index] = updatedChatbot;
        await updateDoc(docRef, { chatbots: updatedChatbots });
        whatsappBusinessAccountId.value = '';
        successMessage.value = 'WhatsApp Business Account ID deleted successfully!';
      } else {
        errorMessage.value = 'Chatbot not found.';
        successMessage.value = '';
      }
    }

  } catch (error) {
    errorMessage.value = 'An error occurred while deleting.';
    successMessage.value = '';
    console.error(error);
  }
}
const generateEmbedChatbotURL = (chatbotId) => {
  const routeResolution = router.resolve({
    name: 'EmbedChatbot',
    params: { chatbotId: chatbotId }
  });
  return routeResolution.href; // routeResolution.href will contain the generated URL string
};

const urlForChatbot = generateEmbedChatbotURL(chatBotId);
const baseUrl = import.meta.env.VITE_HOSTING_URL
const iFrameUrlToUse = ref(`${baseUrl}${urlForChatbot}`)
const iFrameHTMLCode = ref(`<iframe
  src="${iFrameUrlToUse.value}"
  width="400" height="600" frameborder="0"
  style="border: none; display: block; margin: 0 auto;" ></iframe>`)

</script>
<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.back-button {
  padding: 10px 20px;
  margin-bottom: 10px;
  background-color: #eee;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.input-field {
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 5px;
}

.save-button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 10px;
}

.delete-button {
  padding: 10px 20px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 10px;
}

.error-message {
  color: red;
  margin-top: 10px;
}

.success-message {
  color: green;
  margin-top: 10px;
}
</style>