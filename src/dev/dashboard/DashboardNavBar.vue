<script setup></script>

<template>
  <nav class="flex items-center justify-between w-full border-b min-h-[36px] max-h-[36px] text-sm px-2">
    <!-- Left section - anchored to the left -->
    <div class="flex items-center flex-shrink-0 px-2 py-1 rounded">
      <div class="flex items-center">
        <div class="hidden sm:block">
          <div class="flex items-center text-xs font-normal">
            <i-ix-analyze class="size-4 mr-1" /><b>ANALYZE MODE</b>
          </div>
        </div>
        <div class="block sm:hidden">
          <div class="flex items-center text-xs font-semibold"><i-ix-analyze class="size-4 mr-1" /><b>ANALYZE</b></div>
        </div>
      </div>
    </div>

    <!-- Middle section - centered -->
    <div class="flex items-center justify-center flex-1 min-w-0 px-2 py-1 rounded">
      <div class="flex items-center space-x-2">
        <!-- Add any middle content here -->
        <div class="text-xs text-gray-600">
          <!-- Middle content placeholder -->
        </div>
      </div>
    </div>

    <!-- Right section - anchored to the right -->
    <div class="flex items-center flex-shrink-0 px-1 py-1 rounded">
      <div class="flex items-center space-x-2.5 border-gray-300 pl-4 rounded-l"></div>
    </div>
  </nav>
</template>

<style scoped>
a:hover {
  color: #10dffa;
}

/* Keep any custom styles that might be needed for child components */
</style>
