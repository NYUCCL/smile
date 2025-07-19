<script setup>
import { ref } from 'vue'
const text = ref('')
</script>

<template>
  <div class="p-2 w-[200px]">
    <input v-model="text" placeholder="Type here" />
  </div>
  <p><b>You typed: </b>{{ text }}</p>
</template>

<style scoped>
::placeholder {
  color: #d1d1d1;
}
</style>
