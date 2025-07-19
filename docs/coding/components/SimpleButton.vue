<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

<template>
  <Button @click="count++">Count is: {{ count }}</Button>
</template>

<style scoped></style>
