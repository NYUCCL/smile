<script setup>
import { ref } from 'vue'
import { getAuth, signInAnonymously } from 'firebase/auth'

const currentUser = ref(null)
const auth = getAuth()

async function authenticate() {
  try {
    const userCredential = await signInAnonymously(auth)
    currentUser.value = userCredential.user
  } catch (error) {
    console.error('Authentication failed:', error)
  }
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    alert('User ID copied to clipboard!')
  } catch (err) {
    console.error('Failed to copy:', err)
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    alert('User ID copied to clipboard!')
  }
}
</script>

<template>
  <div class="admin-setup p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
    <h3 class="text-lg font-semibold text-yellow-800 mb-4">Admin Setup</h3>

    <div v-if="!currentUser" class="mb-4">
      <button @click="authenticate" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Authenticate to Get Admin ID
      </button>
    </div>

    <div v-else class="space-y-4">
      <div class="bg-white p-4 rounded border">
        <h4 class="font-medium mb-2">Your User ID (for admin setup):</h4>
        <div class="bg-gray-100 p-2 rounded font-mono text-sm break-all">
          {{ currentUser.uid }}
        </div>
        <button
          @click="copyToClipboard(currentUser.uid)"
          class="mt-2 px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
        >
          Copy ID
        </button>
      </div>

      <div class="bg-blue-50 p-4 rounded border border-blue-200">
        <h4 class="font-medium text-blue-800 mb-2">Next Steps:</h4>
        <ol class="text-sm text-blue-700 space-y-1 list-decimal ml-4">
          <li>Copy your User ID above</li>
          <li>Add it to the Firebase rules as an admin ID</li>
          <li>Deploy the updated rules</li>
          <li>Refresh this page to get admin access</li>
        </ol>
      </div>

      <div class="bg-green-50 p-4 rounded border border-green-200">
        <h4 class="font-medium text-green-800 mb-2">For Firebase Rules:</h4>
        <p class="text-sm text-green-700 mb-2">Replace the admin check in firebase/firebase.rules with:</p>
        <pre class="bg-green-100 p-2 rounded text-xs overflow-x-auto"><code>function isAdmin() {
  return isAuthenticated() && (
    request.auth.uid == "{{ currentUser.uid }}" ||
    // Add more admin UIDs here
    request.auth.uid == "another-admin-uid-here"
  );
}</code></pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
code {
  white-space: pre-wrap;
}
</style>
