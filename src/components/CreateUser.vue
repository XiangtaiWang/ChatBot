<template>
        <h1>hello create</h1>
        <input v-model="id" type="text" />
        <input v-model="createdBy" type="text" />

        <button type="submit" @click="CreateUser">Create User</button>
        <h1>current Id is: {{ id }}</h1>
        <h1>createdBy: {{ createdBy }}</h1>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { createUser } from '@/firebase';
import type { User } from "@/types/user";
export default defineComponent({
    data() {
        return {
            id: '',
            createdBy:''
        }
     },
    
    methods: {
        async CreateUser(){
        // todo: if undefined or empty, remind
        let user: User = {
            id: this.id!,
            createdBy: this.createdBy!
        }
        await createUser(user)
    }
    }}
)
</script>