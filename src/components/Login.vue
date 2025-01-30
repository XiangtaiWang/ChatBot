<template>
  <div v-if="isRegistering" class="register-container">
    <h2>Register</h2>
    <form @submit.prevent="register">
      <input type="email" v-model="email" placeholder="Email" required />
      <input type="password" v-model="password" placeholder="Password" required />
      <input type="text" v-model="name" placeholder="Name" required />
      <input type="text" v-model="companyName" placeholder="Company Name" required />
      <PhoneInput v-model:phone-number="phoneNumber" v-model:isPhoneValid="isPhoneValid"/>
      <!-- <h1>hihi: {{ isPhoneValid }}</h1> -->
      <button type="submit" :disabled="isLoading || registerButtonDisabled">
        <span v-if="isLoading">Registering...</span>
        <span v-else>Register</span>
      </button>
    </form>
    <p>
      Already have an account? <a href="#" @click.prevent="isRegistering = false">Login</a>
    </p>
  </div>

  <div v-else class="login-container">
    <h2>Login</h2>
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
    <form @submit.prevent="login">
      <input type="email" v-model="email" placeholder="Email" required />
      <input type="password" v-model="password" placeholder="Password" required />
      <button type="submit" :disabled="isLoading">
        <span v-if="isLoading">Logging in...</span>
        <span v-else>Login</span>
      </button>
    </form>
    <p>
      Don't have an account? <a href="#" @click.prevent="isRegistering = true">Register</a>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { useRouter } from 'vue-router'; // Import useRouter
import { getFirebaseAuth, getCurrentUserId } from '@/firebase';
import PhoneInput from './PhoneInput.vue';
import { createUser } from '@/firebase';
import type { IUser } from '@/types/User';

const email = ref('');
const name = ref('');
const companyName = ref('');
const password = ref('');
const errorMessage = ref('');
const phoneNumber = ref('')
const isPhoneValid = ref(false)
const isLoading = ref(false);
const isRegistering = ref(false); // Add registration state
const router = useRouter(); // Use useRouter
const auth = getFirebaseAuth();
const registerButtonDisabled = ref(true)

const isDataValid = () =>{

let result = email.value=='' 
          || name.value==''
          || companyName.value==''
          || password.value==''
          || isPhoneValid.value==false
  return result
}

watch([email, name, companyName, password, isPhoneValid], ([], []) => {
  registerButtonDisabled.value = isDataValid()
  
});

const login = async () => {
  errorMessage.value = '';
  isLoading.value = true;
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
    // Redirect after successful login
    router.push('/home'); // Or whatever route you want to redirect to
  } catch (error: any) {
    errorMessage.value = error.message; // Display Firebase error message
    console.log(errorMessage.value);
    alert("Email or Password is incorrect.")
    
  } finally {
    isLoading.value = false;
  }
};

const register = async () => {
  if(isDataValid()){
    alert("Inputs might be wrong")
    return
  }
  errorMessage.value = '';
  isLoading.value = true;
  try {
    await createUserWithEmailAndPassword(auth, email.value, password.value);
    let uid = getCurrentUserId()
    let user: IUser = {
      id: uid!,
      phone: phoneNumber.value,
      name: name.value,
      companyName: companyName.value,
      email: email.value
    };
    await createUser(user)
    // Optionally redirect after successful registration, or show a message
    isRegistering.value = false; // Switch back to login form
    alert("Registration successful. Please login.")
  } catch (error: any) {
    errorMessage.value = error.message;
    alert("something is wrong. Try again")
    console.log(errorMessage.value);
    
  } finally {
    isLoading.value = false;
  }
};

</script>

<style scoped>
.login-container, .register-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 50px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.error-message {
  color: red;
  margin-bottom: 10px;
}

input {
  margin-bottom: 10px;
  padding: 8px;
  width: 250px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.iti {
  --iti-path-flags-1x: url('path/to/flags.webp');
  --iti-path-flags-2x: url('path/to/flags@2x.webp');
  --iti-path-globe-1x: url('path/to/globe.webp');
  --iti-path-globe-2x: url('path/to/globe@2x.webp');
}
</style>