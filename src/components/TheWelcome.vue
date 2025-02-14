<script setup lang="ts">

import { callApi } from '@/utils/apiCaller';
const newData = {};
const result = await callApi('/', newData); // Example POST request to /users
if (result) {
    console.log("API call successful!");
}
</script>

<template>

</template>
