<script setup>
import TwoColBasicExample from '../examples/TwoColBasicExample.vue'
import TwoColBasicExample2 from '../examples/TwoColBasicExample2.vue'
import TwoColBasicExampleRaw from '../examples/TwoColBasicExample.vue?raw'
import TitleTwoColLeftFirstExample from '../examples/TitleTwoColLeftFirstExample.vue'
import TitleTwoColLeftFirstExampleRaw from '../examples/TitleTwoColLeftFirstExample.vue?raw'
import TitleTwoColRightFirstExample from '../examples/TitleTwoColRightFirstExample.vue'
import TitleTwoColRightFirstExampleRaw from '../examples/TitleTwoColRightFirstExample.vue?raw'
import ConstrainedTaskWindowGhostExample from '../examples/ConstrainedTaskWindowGhostExample.vue'
import ConstrainedTaskWindowGhostExampleRaw from '../examples/ConstrainedTaskWindowGhostExample.vue?raw'
import ConstrainedTaskWindowGameExample from '../examples/ConstrainedTaskWindowGameExample.vue'
import ConstrainedTaskWindowGameExampleRaw from '../examples/ConstrainedTaskWindowGameExample.vue?raw'
import SimpleExample from '../examples/SimpleExample.vue'
import SimpleExampleRaw from '../examples/SimpleExample.vue?raw'
import ConstrainedPageExample from '../examples/ConstrainedPageExample.vue'
import ConstrainedPageExampleRaw from '../examples/ConstrainedPageExample.vue?raw'
import ConstrainedPageFixedExample from '../examples/ConstrainedPageFixedExample.vue'
import ConstrainedPageFixedExampleRaw from '../examples/ConstrainedPageFixedExample.vue?raw'
import CenteredContentExample from '../examples/CenteredContentExample.vue'
import CenteredContentExampleRaw from '../examples/CenteredContentExample.vue?raw'
import CenteredContentCustomExample from '../examples/CenteredContentCustomExample.vue'
import CenteredContentCustomExampleRaw from '../examples/CenteredContentCustomExample.vue?raw'
</script>

# Layouts

The UIKit provides several layout components to help structure your experiment
views consistently.

## TwoCol

A responsive two-column layout component that stacks columns vertically on
mobile and arranges them horizontally on larger screens.

### Props

- `leftFirst` - Boolean: Whether the left column appears first on mobile
  (default: false)
- `leftWidth` - String: Tailwind width class for the left column (default:
  'w-1/3'). The `leftWidth` prop accepts classes like `w-1/4` (25%), `w-1/3`
  (33%, default), `w-2/5` (40%), `w-1/2` (50%), `w-3/5` (60%), `w-2/3` (67%), or
  `w-3/4` (75%)
- `responsiveUI` - Boolean: Whether to use responsive layout behavior (default:
  true)
- `class` - String: Additional CSS classes to apply to the container

### Example

```vue
<script setup>
import { TwoCol } from '@/uikit/layouts'
</script>

<template>
  <TwoCol leftWidth="w-1/2" leftFirst class="custom-styles">
    <template #left>
      <!-- Left column content -->
    </template>
    <template #right>
      <!-- Right column content -->
    </template>
  </TwoCol>
</template>
```

::: raw

<ComponentViewer 
  name="TwoCol" 
  description="Responsive two-column layout with configurable left width" 
  :raw-code="TwoColBasicExampleRaw" height="400px">

  <TwoColBasicExample />

</ComponentViewer>

:::

Here is an example using a different width for the left column, and the right
column goes on top when the layout is compressed:

::: raw

<ComponentViewer 
  name="TwoCol" 
  description="Responsive two-column layout with configurable left width" 
  :raw-code="TwoColBasicExampleRaw2" height="400px">

  <TwoColBasicExample2 />

</ComponentViewer>

:::

## TitleTwoCol

Similar to TwoCol but includes an additional title slot above the columns.

### Props and Slots

Same as TwoCol, plus:

- All TwoCol props (`leftFirst`, `leftWidth`, `responsiveUI`, `class`)
- Additional `title` slot for header content

### Usage

```vue
<script setup>
import { TitleTwoCol } from '@/uikit/layouts'
</script>

<template>
  <TitleTwoCol leftWidth="w-1/3" leftFirst class="custom-styles">
    <template #title>
      <!-- Title content -->
    </template>
    <template #left>
      <!-- Left column content -->
    </template>
    <template #right>
      <!-- Right column content -->
    </template>
  </TitleTwoCol>
</template>
```

::: raw

<ComponentViewer name="TitleTwoCol" description="Two-column layout with title
section" :raw-code="TitleTwoColLeftFirstExampleRaw"  height="500px">

<TitleTwoColLeftFirstExample />
 
 
 </ComponentViewer>

:::

This shows what happens when the right column is first.

::: raw

<ComponentViewer name="TitleTwoCol" description="Two-column layout with right
column first" :raw-code="TitleTwoColRightFirstExampleRaw"  height="500px">

<TitleTwoColRightFirstExample />

</ComponentViewer>

:::

## ConstrainedTaskWindow

A constrained task window is a layout component that is used to constrain the
task window to a certain width and height frame. Ideal for use in a game where
you don't need a lot of scrolling.

### Props and Slots

- `width` - Number: Width of the task window in pixels (default: 800)
- `height` - Number: Height of the task window in pixels (default: 600)
- `variant` - String: The visual style variant can be `default`, `ghost`,
  `game`, or `outline` (default: 'default')
- `responsiveUI` - Boolean: Whether the task window is responsive (default:
  true)
- `class` - String: Additional CSS classes to apply to the container

The responsiveUI prop is used to control whether the task window is responsive
or not. If it is responsive, the task window will be resized to fit the screen.
If it is not responsive, the task window will be fixed at the width and height
specified (forcing the browser to scroll).

### Usage

```vue
<script setup>
import { ConstrainedTaskWindow } from '@/uikit/layouts'
</script>

<template>
  <ConstrainedTaskWindow
    variant="ghost"
    :responsiveUI="true"
    :width="500"
    :height="400"
    class="custom-styles"
  >
    <!-- Content -->
  </ConstrainedTaskWindow>
</template>
```

### Props

::: raw

<ComponentViewer name="ConstrainedTaskWindow" description="Constrained task
window with ghost variant and responsive UI"
:raw-code="ConstrainedTaskWindowGhostExampleRaw"  height="480px">

<ConstrainedTaskWindowGhostExample />
 
 </ComponentViewer>

:::

This shows the constrained task window with responsive UI disabled:

::: raw

<ComponentViewer name="ConstrainedTaskWindow" description="Constrained task
window with game variant and responsive UI disabled"
:raw-code="ConstrainedTaskWindowGameExampleRaw" height="480px">

<ConstrainedTaskWindowGameExample />
 
</ComponentViewer>

:::

## ConstrainedPage

The ConstrainedPage layout constrains content to specific width and height
dimensions, making it ideal for experiments that require consistent sizing
across different screens and devices.

### Props

- `width` - Number: Width of the page in pixels (default: 800)
- `height` - Number: Height of the page in pixels (default: 600)
- `responsiveUI` - Boolean: Whether to use responsive layout behavior (default:
  true)
- `class` - String: Additional CSS classes to apply

### Responsive Behavior

When `responsiveUI` is `true` (default), the layout uses responsive dimensions:

- Width: `90vw` with `maxWidth` set to the `width` prop
- Height: `minHeight` and `maxHeight` set to the `height` prop

When `responsiveUI` is `false`, the layout uses fixed dimensions:

- Width: Exact pixel value from `width` prop (fixed)
- Height: Exact pixel value from `height` prop (fixed)

### Usage

```vue
<script setup>
import { ConstrainedPage } from '@/uikit/layouts'
</script>

<template>
  <ConstrainedPage :width="800" :height="600" :responsiveUI="true">
    <!-- Your experiment content -->
  </ConstrainedPage>
</template>
```

::: raw

<ComponentViewer 
  name="ConstrainedPage" 
  description="Responsive constrained page layout" 
  :raw-code="ConstrainedPageExampleRaw"
  height="500px">

  <ConstrainedPageExample />

</ComponentViewer>

:::

Here's an example with `responsiveUI` disabled for fixed sizing:

::: raw

<ComponentViewer 
  name="ConstrainedPage Fixed" 
  description="Fixed size constrained page layout" 
  :raw-code="ConstrainedPageFixedExampleRaw"
  height="400px">

  <ConstrainedPageFixedExample />

</ComponentViewer>

:::

## CenteredContent

The CenteredContent layout provides a simple way to center content both
horizontally and vertically within its container. It applies consistent margins
and centering behavior.

### Props

- `class` - String: Additional CSS classes to apply to the container

### Usage

```vue
<script setup>
import { CenteredContent } from '@/uikit/layouts'
</script>

<template>
  <CenteredContent>
    <!-- Your centered content -->
  </CenteredContent>
</template>
```

::: raw

<ComponentViewer 
  name="CenteredContent" 
  description="Simple centered content layout" 
  :raw-code="CenteredContentExampleRaw"
  height="400px">

  <CenteredContentExample />

</ComponentViewer>

:::
