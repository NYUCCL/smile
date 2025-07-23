# Icons

This project uses the [Iconify](https://iconify.design/) package for icons.
Iconify provides access to over 100,000 icons from various icon libraries,
making it easy to find and use the perfect icon for your needs. Iconify is a
universal icon framework that allows you to use icons from multiple icon
libraries with a single package. Instead of installing separate packages for
different icon sets, you can access icons from libraries like
[lucide](https://lucide.dev/),
[material design icons](https://fonts.google.com/icons),
[font awesome free](https://fontawesome.com/), and many more.

## Finding Icons

The best way to find icons is through the
[Iconify Icon Sets](https://icon-sets.iconify.design/) website:

1. Visit [icon-sets.iconify.design](https://icon-sets.iconify.design/)
2. Browse by library or search for specific icons
3. Click on any icon to see its name and usage
4. Copy the icon name for use in your project (see below)

## Icon Naming Convention

Icons in this project use the UnoCSS naming convention:

```
<i-{library}-{icon-name} />
```

You can make this your default format for copying icons on the Iconify website
to make life easier.

### Examples:

```vue
<!-- Lucide icons -->
<i-lucide-home />
<i-lucide-settings />
<i-lucide-user />
<i-lucide-download />

<!-- Material Design icons -->
<i-mdi-account />
<i-mdi-cog />
<i-mdi-download />

<!-- Feather icons -->
<i-feather-home />
<i-feather-settings />
<i-feather-user />

<!-- Heroicons -->
<i-heroicons-home />
<i-heroicons-cog />
<i-heroicons-user />
```

<i-lucide-home />
<i-lucide-settings />
<i-lucide-user />
<i-lucide-download />

<!-- Material Design icons -->
<i-mdi-account />
<i-mdi-cog />
<i-mdi-download />

<!-- Feather icons -->
<i-feather-home />
<i-feather-settings />
<i-feather-user />

<!-- Heroicons -->
<i-heroicons-home />
<i-heroicons-cog />
<i-heroicons-user />

## Popular Icon Libraries

### Lucide Icons

Modern, clean icons that are perfect for most use cases.

```vue
<i-lucide-home />
<i-lucide-settings />
<i-lucide-user />
<i-lucide-download />
<i-lucide-upload />
<i-lucide-edit />
<i-lucide-trash />
<i-lucide-plus />
<i-lucide-minus />
<i-lucide-check />
<i-lucide-x />
<i-lucide-search />
<i-lucide-heart />
<i-lucide-star />
<i-lucide-mail />
<i-lucide-phone />
<i-lucide-calendar />
<i-lucide-clock />
<i-lucide-map-pin />
<i-lucide-link />
```

<i-lucide-home />
<i-lucide-settings />
<i-lucide-user />
<i-lucide-download />
<i-lucide-upload />
<i-lucide-edit />
<i-lucide-trash />
<i-lucide-plus />
<i-lucide-minus />
<i-lucide-check />
<i-lucide-x />
<i-lucide-search />
<i-lucide-heart />
<i-lucide-star />
<i-lucide-mail />
<i-lucide-phone />
<i-lucide-calendar />
<i-lucide-clock />
<i-lucide-map-pin />
<i-lucide-link />

### Material Design Icons

Google's comprehensive icon set with many variants.

```vue
<i-mdi-home />
<i-mdi-account />
<i-mdi-cog />
<i-mdi-download />
<i-mdi-upload />
<i-mdi-pencil />
<i-mdi-delete />
<i-mdi-plus />
<i-mdi-minus />
<i-mdi-check />
<i-mdi-close />
<i-mdi-magnify />
<i-mdi-heart />
<i-mdi-star />
<i-mdi-email />
<i-mdi-phone />
<i-mdi-calendar />
<i-mdi-clock />
<i-mdi-map-marker />
<i-mdi-link />
```

<i-mdi-home />
<i-mdi-account />
<i-mdi-cog />
<i-mdi-download />
<i-mdi-upload />
<i-mdi-pencil />
<i-mdi-delete />
<i-mdi-plus />
<i-mdi-minus />
<i-mdi-check />
<i-mdi-close />
<i-mdi-magnify />
<i-mdi-heart />
<i-mdi-star />
<i-mdi-email />
<i-mdi-phone />
<i-mdi-calendar />
<i-mdi-clock />
<i-mdi-map-marker />
<i-mdi-link />

## Icon Size

You can control icon size using Tailwind CSS classes:

```vue
<!-- Extra small -->
<i-lucide-home class="w-3 h-3" />

<!-- Small -->
<i-lucide-home class="w-4 h-4" />

<!-- Default -->
<i-lucide-home class="w-5 h-5" />

<!-- Large -->
<i-lucide-home class="w-6 h-6" />

<!-- Extra large -->
<i-lucide-home class="w-8 h-8" />
```

  <!-- Extra small -->
  <i-lucide-home class="w-3 h-3" />

  <!-- Small -->
  <i-lucide-home class="w-4 h-4" />

  <!-- Default -->
  <i-lucide-home class="w-5 h-5" />

  <!-- Large -->
  <i-lucide-home class="w-6 h-6" />

  <!-- Extra large -->
  <i-lucide-home class="w-8 h-8" />

## Icon Colors

Icons inherit the text color by default, but you can customize them:

```vue
<!-- Inherit text color -->
<i-lucide-home />

<!-- Specific color -->
<i-lucide-heart class="text-red-500" />

<!-- Multiple colors -->
<i-lucide-star class="text-yellow-400" />
<i-lucide-check class="text-green-500" />
<i-lucide-alert-triangle class="text-orange-500" />
<i-lucide-x class="text-red-500" />
```

  <i-lucide-home />

  <!-- Specific color -->
  <i-lucide-heart class="text-red-500" />

  <!-- Multiple colors -->
  <i-lucide-star class="text-yellow-400" />
  <i-lucide-check class="text-green-500" />
  <i-lucide-alert-triangle class="text-orange-500" />
  <i-lucide-x class="text-red-500" />
