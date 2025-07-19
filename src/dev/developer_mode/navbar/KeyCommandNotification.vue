<script setup>
// Vue composables
import { ref, onMounted } from 'vue'

/**
 * Props for the key command notification
 * @property {string} command - The command key (e.g., 'Ctrl + R')
 * @property {string} action - The action description
 * @property {boolean} show - Whether to show the notification
 * @property {string} type - Notification type ('default' or 'error')
 */
const props = defineProps({
  command: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  show: {
    type: Boolean,
    required: true,
  },
  type: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'error'].includes(value),
  },
})
</script>

<template>
  <!-- Slide-up transition for notification -->
  <Transition name="slide-up">
    <div v-if="show" class="notification" :class="{ 'error-notification': type === 'error' }">
      <div class="notification-content" :class="{ 'error-content': type === 'error' }">
        <div class="command-badge">
          <kbd class="command-key" :class="{ 'error-key': type === 'error' }">{{ command }}</kbd>
        </div>
        <div class="action-text" :class="{ 'error-text': type === 'error' }">{{ action }}</div>
      </div>
      <div class="notification-arrow" :class="{ 'error-arrow': type === 'error' }"></div>
    </div>
  </Transition>
</template>

<style scoped>
.notification {
  position: fixed;
  top: 50px;
  left: 60px;
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  z-index: 9999;
  max-width: 300px;
  overflow: hidden;
}

.error-notification {
  background: #fef2f2;
  border: 1px solid #fecaca;
}

.notification-content {
  padding: 12px 16px;
  background: linear-gradient(135deg, var(--background) 0%, var(--muted) 100%);
}

.error-content {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
}

.command-badge {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.command-key {
  background: var(--primary);
  color: var(--primary-foreground);
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.025em;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--primary);
}

.error-key {
  background: #ef4444;
  color: #fef2f2;
  border: 1px solid #ef4444;
}

.action-text {
  color: var(--foreground);
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.4;
}

.error-text {
  color: #ef4444;
}

.notification-arrow {
  position: absolute;
  top: -6px;
  left: 20px;
  transform: rotate(45deg);
  width: 12px;
  height: 12px;
  background: var(--background);
  border-left: 1px solid var(--border);
  border-top: 1px solid var(--border);
}

.error-arrow {
  background: #fef2f2;
  border-left: 1px solid #fecaca;
  border-top: 1px solid #fecaca;
}

/* Animation */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateX(-100%) translateY(-10px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateX(-100%) translateY(-10px);
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .notification {
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.3),
      0 2px 4px -1px rgba(0, 0, 0, 0.2),
      0 0 0 1px rgba(255, 255, 255, 0.1);
  }
}
</style>
