# Animations

This project uses the [Motion](https://motion.dev/) library for animations.
Motion is a powerful animation library for Vue that provides smooth, performant
animations with a simple API.

## What is Motion?

Motion is a library that makes it easy to add animations to your Vue components.
It provides a simple API with easy-to-use animation functions, optimized
performance that doesn't block the UI, flexibility to support various animation
types, and native Vue 3 support through composables.

## Basic Example

Here's a simple example of using Motion to animate a button:

```vue
<script setup>
import { ref } from 'vue'
import { Motion } from 'motion/vue'

const isVisible = ref(true)
</script>

<template>
  <div>
    <button
      @click="isVisible = !isVisible"
      class="bg-blue-500 text-white px-4 py-2 rounded"
    >
      Toggle Animation
    </button>

    <Motion
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }"
      :transition="{ duration: 0.3 }"
      class="mt-4 p-4 bg-gray-100 rounded"
    >
      <p>This content animates in and out!</p>
    </Motion>
  </div>
</template>
```

## Animation Properties

Motion supports various animation properties:

### Transform Properties

- `x`, `y`, `z`: Translation
- `scale`, `scaleX`, `scaleY`: Scaling
- `rotate`, `rotateX`, `rotateY`, `rotateZ`: Rotation
- `skew`, `skewX`, `skewY`: Skewing

### Visual Properties

- `opacity`: Transparency
- `color`: Color transitions
- `backgroundColor`: Background color changes
- `borderColor`: Border color changes

### Layout Properties

- `width`, `height`: Size changes
- `top`, `left`, `right`, `bottom`: Position changes

## Common Animation Patterns

### Fade In/Out

```vue
<Motion
  :initial="{ opacity: 0 }"
  :animate="{ opacity: 1 }"
  :exit="{ opacity: 0 }"
  :transition="{ duration: 0.3 }"
>
  <div class="p-4 bg-blue-100 rounded">
    Fade animation
  </div>
</Motion>
```

### Slide In from Left

```vue
<Motion
  :initial="{ x: -100, opacity: 0 }"
  :animate="{ x: 0, opacity: 1 }"
  :transition="{ duration: 0.5, ease: 'easeOut' }"
>
  <div class="p-4 bg-green-100 rounded">
    Slide from left
  </div>
</Motion>
```

### Scale Animation

```vue
<Motion
  :initial="{ scale: 0 }"
  :animate="{ scale: 1 }"
  :transition="{ duration: 0.3, ease: 'easeOut' }"
>
  <div class="p-4 bg-yellow-100 rounded">
    Scale animation
  </div>
</Motion>
```

### Bounce Effect

```vue
<Motion
  :initial="{ y: -50, opacity: 0 }"
  :animate="{ y: 0, opacity: 1 }"
  :transition="{
    duration: 0.6,
    ease: [0.68, -0.55, 0.265, 1.55],
  }"
>
  <div class="p-4 bg-purple-100 rounded">
    Bounce effect
  </div>
</Motion>
```

## Transition Options

Motion provides various transition options:

### Duration

```vue
<Motion :transition="{ duration: 0.5 }">
  <!-- Content -->
</Motion>
```

### Easing Functions

```vue
<Motion
  :transition="{
    duration: 0.3,
    ease: 'easeInOut',
  }"
>
  <!-- Content -->
</Motion>
```

Common easing options:

- `linear`: Constant speed
- `easeIn`: Slow start, fast end
- `easeOut`: Fast start, slow end
- `easeInOut`: Slow start and end, fast middle

### Delay

```vue
<Motion
  :transition="{
    duration: 0.3,
    delay: 0.2,
  }"
>
  <!-- Content -->
</Motion>
```

## Interactive Animations

### Hover Animations

```vue
<template>
  <Motion
    :initial="{ scale: 1 }"
    :whileHover="{ scale: 1.1 }"
    :transition="{ duration: 0.2 }"
    class="cursor-pointer"
  >
    <div class="p-4 bg-blue-100 rounded">Hover me!</div>
  </Motion>
</template>
```

### Click Animations

```vue
<template>
  <Motion :whileTap="{ scale: 0.95 }" class="cursor-pointer">
    <button class="bg-blue-500 text-white px-4 py-2 rounded">Click me!</button>
  </Motion>
</template>
```

## Staggered Animations

For animating multiple elements with delays:

```vue
<template>
  <div class="space-y-2">
    <Motion
      v-for="(item, index) in items"
      :key="item.id"
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{
        duration: 0.3,
        delay: index * 0.1,
      }"
    >
      <div class="p-3 bg-gray-100 rounded">
        {{ item.text }}
      </div>
    </Motion>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Motion } from 'motion/vue'

const items = ref([
  { id: 1, text: 'Item 1' },
  { id: 2, text: 'Item 2' },
  { id: 3, text: 'Item 3' },
  { id: 4, text: 'Item 4' },
])
</script>
```

## Best Practices

### 1. Performance

- Use `transform` properties (x, y, scale, rotate) instead of layout properties
  when possible
- Avoid animating properties that trigger layout recalculations
- Use `will-change` CSS property for elements that will animate frequently.

### 2. Accessibility

- Respect user preferences for reduced motion
- Provide alternative content for users who disable animations
- Ensure animations don't interfere with screen readers

### 3. User Experience

- Keep animations short (200-500ms for most interactions)
- Use easing functions that feel natural
- Don't over-animate—less is often more.

### 4. Responsive Design

- Consider how animations work on different screen sizes
- Test animations on mobile devices
- Ensure animations don't break on smaller screens

## Motion Library Documentation

For comprehensive documentation, examples, and advanced features, visit the
official Motion documentation:

**📚 [Motion Documentation](https://motion.dev/)**

The Motion documentation includes:

- Complete API reference
- Advanced animation techniques
- Performance optimization guides
- Interactive examples
- Community resources

## Common Use Cases

### Page Transitions

```vue
<Motion
  :initial="{ opacity: 0, x: 20 }"
  :animate="{ opacity: 1, x: 0 }"
  :exit="{ opacity: 0, x: -20 }"
  :transition="{ duration: 0.3 }"
>
  <div class="page-content">
    <!-- Page content -->
  </div>
</Motion>
```

### Loading States

```vue
<Motion
  :initial="{ opacity: 0 }"
  :animate="{ opacity: 1 }"
  :transition="{ duration: 0.5 }"
>
  <div class="loading-spinner">
    Loading...
  </div>
</Motion>
```

### Form Validation

```vue
<Motion
  :initial="{ scale: 1 }"
  :animate="{ scale: hasError ? 1.02 : 1 }"
  :transition="{ duration: 0.2 }"
>
  <input 
    :class="{ 'border-red-500': hasError }"
    class="border rounded px-3 py-2"
  />
</Motion>
```

Motion provides a powerful yet simple way to add engaging animations to your Vue
applications. Start with simple animations and gradually explore more advanced
features as needed.
