<script setup>
import ButtonVariantsExample from '../examples/ButtonVariantsExample.vue'
import ButtonVariantsExampleRaw from '../examples/ButtonVariantsExample.vue?raw'
import ButtonColorVariantsExample from '../examples/ButtonColorVariantsExample.vue'
import ButtonColorVariantsExampleRaw from '../examples/ButtonColorVariantsExample.vue?raw'
import ButtonSizesExample from '../examples/ButtonSizesExample.vue'
import ButtonSizesExampleRaw from '../examples/ButtonSizesExample.vue?raw'
import ButtonIconsExample from '../examples/ButtonIconsExample.vue'
import ButtonIconsExampleRaw from '../examples/ButtonIconsExample.vue?raw'
import ButtonGroupExample from '../examples/ButtonGroupExample.vue'
import ButtonGroupExampleRaw from '../examples/ButtonGroupExample.vue?raw'
import ButtonGroupSizesExample from '../examples/ButtonGroupSizesExample.vue'
import ButtonGroupSizesExampleRaw from '../examples/ButtonGroupSizesExample.vue?raw'
import CheckboxExample from '../examples/CheckboxExample.vue'
import CheckboxExampleRaw from '../examples/CheckboxExample.vue?raw'
import SwitchExample from '../examples/SwitchExample.vue'
import SwitchExampleRaw from '../examples/SwitchExample.vue?raw'
import BadgeExample from '../examples/BadgeExample.vue'
import BadgeExampleRaw from '../examples/BadgeExample.vue?raw'

</script>

# UI Components

Smile provides a library of built-in lower-level components which are styled and
themed to match the overall project. These components build on
[Radix-Vue](https://www.radix-vue.com/) and
[Shadcn-vue](https://www.shadcn-vue.com/) and help you quickly develop
consistent interfaces with themed colors, dark mode support, and a consistent
look and feel. We anticipate adding more here over time.

## Importing Components

All UIkit components can be imported from the `@/uikit/components` directory.
The full list of available components is in the file. Most are in fact imported
from [Shadcn-vue](https://www.shadcn-vue.com/), but some have been extended for
use in Smile and are documented here:

```javascript
import { Badge } from '@/uikit/components/badge'
import { Button } from '@/uikit/components/button'
import { ButtonGroup, ButtonGroupItem } from '@/uikit/components/button-group'
import { Checkbox } from '@/uikit/components/checkbox'
import { Switch } from '@/uikit/components/switch'
```

## Button Component

The Button component is the primary interactive element for user actions. It
supports various styles, sizes, and can include icons.

::: raw

<ComponentViewer 
  name="Button Variants" 
  description="Different visual styles for buttons" 
  :raw-code="ButtonVariantsExampleRaw"
  :responsive="false"
  height="150px"
  preview-classes="p-8">

  <ButtonVariantsExample />

</ComponentViewer>

:::

There are also many color variants controlled by the main Tailwind theme sheet
(`src/core/main.css`).

::: raw

<ComponentViewer 
  name="Button Color Variants" 
  description="Themed color variants for buttons" 
  :raw-code="ButtonColorVariantsExampleRaw"
  :responsive="false"
  height="250px"
  preview-classes="p-8">

  <ButtonColorVariantsExample />

</ComponentViewer>

:::

There are also many sizes:

::: raw

<ComponentViewer 
  name="Button Sizes" 
  description="Different sizes for buttons" 
  :raw-code="ButtonSizesExampleRaw"
  :responsive="false"
  height="180px"
  preview-classes="p-8">

  <ButtonSizesExample />

</ComponentViewer>

:::

Buttons can include icons alongside text. Icons should ideally be placed before
the text content:

::: raw

<ComponentViewer 
  name="Buttons with Icons" 
  description="Buttons with various icons and variants" 
  :raw-code="ButtonIconsExampleRaw"
  :responsive="false"
  height="200px"
  preview-classes="p-8">

  <ButtonIconsExample />

</ComponentViewer>

:::

### Making Buttons Clickable

There are two main ways to make buttons interactive:

#### 1. Using onClick Handler

For simple click actions, you can add an `@click` handler directly to the
button:

```vue
<Button @click="handleClick" variant="primary">
  Click Me
</Button>
```

#### 2. Using asChild with Anchor Tags

For navigation or external links, you can use the `asChild` prop with an anchor
tag in the slot:

```vue
<Button asChild variant="primary">
  <a href="/some-page">Navigate to Page</a>
</Button>
```

This approach is useful for:

- Internal navigation
- External links
- Download links
- Any scenario where you need the button to behave like a link

The `asChild` prop tells the Button component to render its children as the root
element instead of a `<button>` tag, allowing you to use anchor tags while
maintaining the button's styling.

### Props

`variant` (string): The visual style variant can be `default`, `destructive`,
`outline`, `secondary`, `ghost`, `link`, `primary`, `primary-light`,
`button-link`, `button-link-light`, `info`, `info-light`, `success`,
`success-light`, `warning`, `warning-light`, `danger`, or `danger-light`.

`size` (string): The button size can be `icon` for icon-only buttons without
text or `menu` for menu-style buttons. Other standard sizes are also available.

## ButtonGroup Component

The ButtonGroup component creates a connected group of buttons, useful for
related actions or options.

::: raw

<ComponentViewer 
  name="ButtonGroup" 
  description="Connected group of buttons" 
  :raw-code="ButtonGroupExampleRaw"
  :responsive="false"
  height="100px"
  preview-classes="p-8">

  <ButtonGroupExample />

</ComponentViewer>

:::

ButtonGroup supports different sizes:

::: raw

<ComponentViewer 
  name="ButtonGroup Sizes" 
  description="Different sizes for button groups" 
  :raw-code="ButtonGroupSizesExampleRaw"
  :responsive="false"
  height="180px"
  preview-classes="p-8">

  <ButtonGroupSizesExample />

</ComponentViewer>

:::

### Props

`variant` (string): The visual style variant (same as Button component)

`size` (string): The button size (same as Button component)

## Checkbox Component

The Checkbox component provides a standard checkbox input with various styling
options.

::: raw

<ComponentViewer 
  name="Checkbox" 
  description="Checkbox component with variants, sizes, and states" 
  :raw-code="CheckboxExampleRaw"
  :responsive="false"
  height="80px"
  preview-classes="p-8">

  <CheckboxExample />

</ComponentViewer>

:::

### Props

`modelValue` (boolean): The checked state (use v-model for two-way binding)

`variant` (string): The visual style variant can be `default`, `primary`,
`info`, `success`, `warning`, or `danger`.

`size` (string): The checkbox size can be `xs`, `sm`, `default`, `lg`, or `xl`.

`disabled` (boolean): Whether the checkbox is disabled

## Switch Component

The Switch component provides a toggle switch input, ideal for on/off states.

::: raw

<ComponentViewer 
  name="Switch" 
  description="Switch component with variants, sizes, and states" 
  :raw-code="SwitchExampleRaw"
  :responsive="false"
  height="80px"
  preview-classes="p-8">

  <SwitchExample />

</ComponentViewer>

:::

### Props

`modelValue` (boolean): The checked state (use v-model for two-way binding)

`variant` (string): The visual style variant can be `default`, `primary`,
`info`, `success`, `warning`, or `danger`.

`size` (string): The switch size can be `sm`, `default`, `lg`, or `xl`.

`disabled` (boolean): Whether the switch is disabled

## Badge Component

The Badge component is used to display small pieces of information, such as
status indicators, labels, or counts.

::: raw

<ComponentViewer 
  name="Badge" 
  description="Badge component with different variants" 
  :raw-code="BadgeExampleRaw"
  :responsive="false"
  height="80px"
  preview-classes="p-8">

  <BadgeExample />

</ComponentViewer>

:::

### Props

`variant` (string): The visual style variant can be `default`, `secondary`,
`destructive`, or `outline`.
