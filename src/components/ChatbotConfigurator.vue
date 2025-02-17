<template>
  <div class="container">
    <button @click="goBack" class="back-button">Back</button>
    <input v-model="whatsappBusinessAccountId" type="text" placeholder="WhatsApp Business Account ID" class="input-field">
    <button @click="save" class="save-button">Save</button>
    <button v-if="whatsappBusinessAccountId" @click="deleteAccount" class="delete-button">Delete</button>
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { getFirestoreDb, getCurrentUserId } from "../firebase";
const db = getFirestoreDb();

const route = useRoute()
const router = useRouter()
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