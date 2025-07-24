<script setup>
import { useData } from 'vitepress'

const { theme } = useData()
</script>

# Required software you will need to install

Before getting started on a <SmileText/> project, you will need to install a few
items on your local computer.

## 1. Install the latest Node.js

You will need to install Node.js on your computer. You can download the latest
version [here](https://nodejs.org/en/download/). After the installation
completes, verify that you have the `npm` command in your terminal program of
choice. If you already have Node installed, verify that the version of Node.js
is greater than or equal to {{ theme.nodeVersion }}. You can check your
installed version by typing `node -v`.

## 2. Create a GitHub account if you haven't and install the command-line tool

You will also need a [GitHub account](https://github.com/join) (a free account
is fine). Next, you will need to install the GitHub Command Line Interface
(CLI). You can [download it here](https://cli.github.com) using the installer or
Homebrew. Finally, allow CLI access to your GitHub account by typing in your
terminal:

```
gh auth login --web
```

## 3. Install a web browser (or two or three)

Install Safari, Chrome, Arc, and/or Firefox. You may want to install multiple
browsers to try out your code in each of them. However, for developing/testing
your code, Arc/Chrome is particularly recommended because of the wide range of
available extensions.

## 4. Install VSCode, Vue Extension for VSCode, and Prettier

It is highly recommended that you use [VS Code](https://code.visualstudio.com/),
the [Vue](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
extension, the
[Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss),
and the
[Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
extension. These tools will help you write and debug your code more easily.
