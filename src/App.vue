<template>
  <header>
    <!-- <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" /> -->

    <div v-if="!isEmbedRoute" class="wrapper">
      <nav v-if="!isEmbedRoute">
        <RouterLink to="/Home">Home</RouterLink>
        <!-- <RouterLink to="/about">About</RouterLink> -->
        <RouterLink to="/Login">Login</RouterLink>
        <RouterLink to="/ChatBot">ChatBot</RouterLink>
        <RouterLink to="/ChatbotSelector">Edit ChatBot</RouterLink>
      </nav>
    </div>
  </header>
  <body>
    <RouterView />
  </body>
  
</template>
<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { computed } from 'vue';
const route = useRoute(); // Get the current route object


// Create a computed property to check if the current route path starts with '/embed_chatbot'
const isEmbedRoute= computed(() => {
  return route.path.startsWith('/embed_chatbot');
});
// export default{
//   name: "App",
//   components:{

//   }
// }
</script>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
