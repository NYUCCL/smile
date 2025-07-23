# Styling with Tailwind CSS

In modern web design, the look and feel of an application are determined jointly
by three types of files: HTML (for the basic structure/content), CSS (for the
style/colors/shapes/spacing), and JavaScript (for the dynamic interaction,
clicking, dragging, etc...).[^vue]

[^vue]:
    Interestingly these are roughly the same as the three sections of a
    [Single-file Component in Vue](/coding/components).

In this document, we will focus mostly on the CSS side of things: how you make
things look nice by choosing colors, layouts, spacing, and typography for your
experiments. If you are entirely unfamiliar with the term CSS or Cascading
Style-Sheets it might help to read this nice chapter from
[Interneting is Hard](https://www.internetingishard.com/html-and-css/hello-css/)
before continuing.

Smile relies on a special system for styling called
[Tailwind CSS](https://tailwindcss.com/). Tailwind CSS is a utility-first CSS
framework that provides a set of pre-built utility classes for styling web
applications. Unlike traditional CSS frameworks that provide pre-designed
components, Tailwind gives you low-level utility classes that let you build
completely custom designs without ever leaving your HTML. Tailwind is a very
popular CSS framework and is supported by many Large Language Models and coding
assistants. This means that even if you don't know the full Tailwind syntax you
can easily get help building Tailwind interfaces.

## The Tailwind Philosophy: Utility-First CSS

Tailwind follows the principle of **atomic CSS** or **utility-first CSS**.
Instead of writing custom CSS for each component, you compose designs by
combining small, single-purpose utility classes directly in your HTML.

### Traditional CSS vs Tailwind CSS

Let's compare how you might style a simple button using traditional CSS versus
Tailwind:

**Traditional CSS Approach:**

```css
/* In your CSS file */
.primary-button {
  background-color: #3b82f6;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
}

.primary-button:hover {
  background-color: #2563eb;
}
```

```html
<!-- In your HTML -->
<button class="primary-button">Click me</button>
```

**Tailwind CSS Approach:**

```html
<!-- Everything in your HTML -->
<button
  class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium"
>
  Click me
</button>
```

The key difference is that with Tailwind, you don't need to write any custom
CSS. Instead, you use utility classes that directly apply specific styles:

- `bg-blue-500` = `background-color: #3b82f6`
- `hover:bg-blue-600` = `background-color: #2563eb` on hover
- `text-white` = `color: white`
- `px-4 py-2` = `padding: 0.5rem 1rem`
- `rounded-md` = `border-radius: 0.375rem`
- `font-medium` = `font-weight: 500`

One neat feature of Tailwind is that it analyzes your entire project and only
includes the styles you actually use in your project. This makes the CSS payload
smaller and more efficient.

## Building a Simple Component with Tailwind

Let's walk through creating a simple card component using Tailwind CSS. We'll
start with a basic div and gradually add styling to demonstrate how utility
classes work together.

### Step 1: Basic Container

```html
<div>
  <h2>Card Title</h2>
  <p>This is some card content that demonstrates Tailwind CSS styling.</p>
</div>
```

**Result:**

::: raw

<div>
  <h2>Card Title</h2>
  <p>This is some card content that demonstrates Tailwind CSS styling.</p>
</div>

:::

This gives us a plain, unstyled div. Now let's add some basic styling:

### Step 2: Adding Background and Padding

```html
<div class="bg-gray-200 p-6">
  <h2>Card Title</h2>
  <p>This is some card content that demonstrates Tailwind CSS styling.</p>
</div>
```

**Result:**

::: raw

<div class="bg-gray-200 p-6">
  <h2>Card Title</h2>
  <p>This is some card content that demonstrates Tailwind CSS styling.</p>
</div>

:::

- `bg-gray-200` adds a light gray background
- `p-6` adds padding of 1.5rem (24px) on all sides

### Step 3: Adding Border and Rounded Corners

```html
<div class="bg-white p-6 border rounded-lg">
  <h2>Card Title</h2>
  <p>This is some card content that demonstrates Tailwind CSS styling.</p>
</div>
```

**Result:**

::: raw

<div class="bg-white p-6 border rounded-lg">
  <h2>Card Title</h2>
  <p>This is some card content that demonstrates Tailwind CSS styling.</p>
</div>

:::

- `border` adds a 1px border
- `rounded-lg` adds border-radius of 0.5rem (8px)
- `bg-white` changes the background to white

### Step 4: Adding Shadow and Spacing

```html
<div class="bg-white p-6 border rounded-lg shadow-md">
  <h2 class="text-xl font-bold mb-4">Card Title</h2>
  <p class="text-gray-600">
    This is some card content that demonstrates Tailwind CSS styling.
  </p>
</div>
```

**Result:**

::: raw

<div class="bg-white p-6 border rounded-lg shadow-md">
  <h2 class="text-xl font-bold mb-4">Card Title</h2>
  <p class="text-gray-600">
    This is some card content that demonstrates Tailwind CSS styling.
  </p>
</div>

:::

- `shadow-md` adds a medium drop shadow
- `text-xl` makes the heading larger (1.25rem)
- `font-bold` makes the text bold
- `mb-4` adds margin-bottom of 1rem (16px)
- `text-gray-600` makes the paragraph text a medium gray color

### Step 5: Adding Hover Effects

```html
<div
  class="bg-white p-6 border rounded-lg shadow-md hover:shadow-lg transition-shadow"
>
  <h2 class="text-xl font-bold mb-4">Card Title</h2>
  <p class="text-gray-600">
    This is some card content that demonstrates Tailwind CSS styling.
  </p>
</div>
```

**Result (hover to see the effect):**

::: raw

<div class="bg-white p-6 border rounded-lg shadow-md hover:shadow-lg transition-shadow">
  <h2 class="text-xl font-bold mb-4">Card Title</h2>
  <p class="text-gray-600">
    This is some card content that demonstrates Tailwind CSS styling.
  </p>
</div>

:::

- `hover:shadow-lg` increases the shadow on hover
- `transition-shadow` adds a smooth transition for the shadow change

## Understanding Tailwind's Naming Convention

Tailwind uses a systematic naming convention that makes it easy to understand
what each class does:

### Spacing Scale

- `p-1` = padding: 0.25rem (4px)
- `p-2` = padding: 0.5rem (8px)
- `p-4` = padding: 1rem (16px)
- `p-6` = padding: 1.5rem (24px)
- `p-8` = padding: 2rem (32px)

### Color System

- `bg-blue-500` = background-color: #3b82f6
- `text-red-600` = color: #dc2626
- `border-gray-300` = border-color: #d1d5db

### Responsive Design

- `md:bg-blue-500` = blue background only on medium screens and up
- `lg:text-xl` = larger text only on large screens and up

## Common Utility Classes

Here are some frequently used Tailwind utility classes:

### Layout

- `flex` - display: flex
- `grid` - display: grid
- `hidden` - display: none
- `block` - display: block

### Spacing

- `m-4` - margin: 1rem
- `mt-2` - margin-top: 0.5rem
- `mb-6` - margin-bottom: 1.5rem
- `mx-auto` - margin-left: auto; margin-right: auto
- `my-auto` - margin-top: auto; margin-bottom: auto
- `pt-4` - padding-top: 1rem

### Typography

- `text-sm` - font-size: 0.875rem
- `text-lg` - font-size: 1.125rem
- `text-4xl` - font-size: 2.25rem
- `font-bold` - font-weight: 700
- `text-center` - text-align: center

### Colors

- `bg-blue-500` - background-color: #3b82f6
- `text-white` - color: white
- `border-gray-300` - border-color: #d1d5db

### Effects

- `shadow-md` - box-shadow
- `rounded-lg` - border-radius: 0.5rem
- `opacity-50` - opacity: 0.5

## Tailwind Resources

Now that you understand the basics of Tailwind CSS, you can explore the
[Tailwind documentation](https://tailwindcss.com/docs) for a complete reference.

A very helpful resource is the
[Tailwind CSS Cheat Sheet](https://nerdcave.com/tailwind-cheat-sheet).

In addition, it can be helpful to install the
[Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
extension for VSCode. This will help you autocomplete Tailwind classes.
