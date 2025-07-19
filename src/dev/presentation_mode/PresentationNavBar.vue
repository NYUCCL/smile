<script setup>
/**
 * @fileoverview Navigation bar component for presentation mode
 * Provides a clean, minimal navigation interface with presentation controls
 */

// Component imports - all used
import RouteInfoButton from '@/dev/developer_mode/navbar/ViewInfoButtonGroup.vue'
import ResetButton from '@/dev/presentation_mode/PresentationModeResetButton.vue'
import QRCodeButton from '@/dev/presentation_mode/QRCodeButton.vue'
import DarkModeButton from '@/dev/presentation_mode/DarkModeButton.vue'
import { Presentation } from 'lucide-vue-next'
</script>

<template>
  <!-- Main navigation container -->
  <nav class="flex items-center justify-between w-full border-b min-h-[36px] max-h-[36px] text-sm px-2">
    <!-- Left section - Presentation mode branding -->
    <div class="flex items-center flex-shrink-0 px-2 py-1 rounded">
      <div class="flex items-center">
        <!-- Desktop presentation mode label -->
        <div class="hidden sm:block">
          <div class="flex items-center text-xs font-normal">
            <i-uil-presentation-line class="size-4 mr-1" /><b>PRESENTATION MODE</b>
          </div>
        </div>
        <!-- Mobile presentation mode label -->
        <div class="block sm:hidden">
          <div class="flex items-center text-xs font-semibold"><Presentation class="size-4 mr-1" /><b>PRES</b></div>
        </div>
      </div>
    </div>

    <!-- Middle section - Centered content area -->
    <div class="flex items-center justify-center flex-1 min-w-0 px-2 py-1 rounded">
      <div class="flex items-center space-x-2">
        <!-- Middle content placeholder -->
        <div class="text-xs text-gray-600">
          <!-- Middle content placeholder -->
        </div>
      </div>
    </div>

    <!-- Right section - Control buttons -->
    <div class="flex items-center flex-shrink-0 px-1 py-1 rounded">
      <div class="flex items-center space-x-2.5 border-gray-300 pl-4 rounded-l">
        <!-- Dark mode toggle button -->
        <div class="flex items-center">
          <DarkModeButton></DarkModeButton>
        </div>

        <!-- QR code generation button -->
        <div class="flex items-center">
          <QRCodeButton></QRCodeButton>
        </div>

        <!-- Reset to main page button -->
        <div class="flex items-center">
          <ResetButton></ResetButton>
        </div>

        <!-- Route information buttons (desktop only) -->
        <div class="hidden md:flex items-center">
          <RouteInfoButton></RouteInfoButton>
        </div>
      </div>
    </div>
  </nav>
</template>
