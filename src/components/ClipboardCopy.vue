<template>
    <div class="clipboard-container">
      <div class="text-to-copy">{{ props.text }}</div>  <button class="copy-button" @click="copyToClipboard">Copy</button>
      <span v-if="isCopied" class="success-message">Copied</span>
    </div>
  </template>
  
  <script setup>
  import { ref, defineProps } from 'vue';
  

  const props = defineProps({
    text: {
      type: String,
      required: true, 
    }
  });
  
  const isCopied = ref(false); 
  
  const copyToClipboard = () => {
    if (!navigator.clipboard) {

      alert("your browser doesn't support copy api, please update or use different one");
      return;
    }
  
    const text = props.text;
  
    navigator.clipboard.writeText(text)
      .then(() => {
        // 複製成功
        isCopied.value = true;
        setTimeout(() => {
          isCopied.value = false; // 幾秒後隱藏成功訊息
        }, 1500); // 1.5 秒後隱藏
      })
      .catch(err => {
        // 複製失敗
        console.error('copy failed: ', err);
        alert('copy failed.');
      });
  };
  </script>
  
  <style scoped>
  .clipboard-container {
    border: 1px solid #ccc;
    padding: 20px;
    border-radius: 8px;
    width: 300px;
    font-family: sans-serif;
  }
  
  .text-to-copy {
    background-color: #f8f8f8;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-bottom: 10px;
    overflow-wrap: break-word; /* 長文字自動換行 */
  }
  
  .copy-button {
    background-color: #4CAF50;
    color: white;
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
  }
  
  .copy-button:hover {
    background-color: #45a049;
  }
  
  .success-message {
    color: green;
    margin-left: 10px;
    display: inline-block; /* 確保訊息與按鈕在同一行 */
  }
  </style>