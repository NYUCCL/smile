<script setup>
import { ref } from 'vue'
const text = ref('')
</script>

<template>
  <div class="border-1 border-gray-800 rounded-md p-2 w-[200px]">
    <input v-model="text" placeholder="Type here" />
  </div>
  <p><b>You typed: </b>{{ text }}</p>
</template>

<style scoped>
::placeholder {
  color: #d1d1d1;
}
</style>
