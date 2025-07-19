<script setup>
/**
 * Props for the CircleProgress component
 * @property {number} percentage - The percentage to display (0-100)
 * @property {number} size - The size of the SVG in px
 * @property {number} strokeWidth - The width of the stroke
 * @property {string} basecolor - The base color of the circle
 * @property {string} slicecolor - The color of the progress slice
 */
const props = defineProps({
  percentage: Number,
  size: Number,
  strokeWidth: Number,
  basecolor: String,
  slicecolor: String,
})
</script>

<template>
  <!-- SVG pie chart for progress display -->
  <div class="pie-chart">
    <svg viewBox="0 0 32 32">
      <circle r="16" cx="16" cy="16" />
    </svg>
  </div>
</template>

<style scoped>
.pie-chart {
  display: inline-block;
}

svg {
  width: v-bind(size + 'px');
  height: v-bind(size + 'px');
  transform: rotate(-90deg);
  border-radius: 50%;
}

circle {
  fill: v-bind(basecolor);
  stroke: v-bind(slicecolor);
  stroke-width: 32;
  stroke-dasharray: v-bind(percentage) 100; /* for 38% */
}
</style>
