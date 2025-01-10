

<script setup lang="ts">
import IntlTelInput from "intl-tel-input/vueWithUtils";
import "intl-tel-input/styles";
import { ref, watch } from "vue";

const intlTelInputRef = ref(null);
const isPhoneValid = defineModel('isPhoneValid')
const errorCode = ref(null);
const phoneNumber = defineModel('phoneNumber')

// watch(isPhoneValid, ()=>{
//   console.log(isPhoneValid.value);
// })
// watch(phoneNumber, ()=>{

// })
</script>

<template>
  <IntlTelInput
  :ref="intlTelInputRef"
  @changeNumber="phoneNumber = $event"
  @changeValidity="isPhoneValid = $event"
  @changeErrorCode="errorCode = $event"
  :options="{
      initialCountry: 'co',
    }"
  :inputProps="{
    required:true,
    id:'phone'
  }"
  />

  <div v-if="!isPhoneValid && phoneNumber!=''" class="notice">phone incorrect</div>
</template>