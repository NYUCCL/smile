# Contributing

We are taking a "docs first" approach to this project by planning the development in the documentation
and then working on implementation.  Thus, the place to start is by contributing to the docs.  **It's easy
and fun.**

The docs are developed with [Vitepress](https://vitepress.vuejs.org) which is super awesome.

The first step is to clone the project [github repo](https://github.com/NYUCCL/smile).  This has files both for the project and for the documentation.  Next `cd smile` to set your current terminal to the working copy directory.  Next type `npm i` (aka `npm install`) to automatically install all the dependencies of the smile project.

Things are still evolving but you should get a directory listing like this:

```
.
├── LICENSE
├── README.md
├── docs/                 <- docs are in here
├── index.html
├── node_modules/         <- appears when you run `npm install`
├── package-lock.json
├── package.json          <- useful to take a look at
├── public/
├── src
│   ├── App.vue
│   ├── assets
│   ├── components/
│   └── main.js
└── vite.config.js
```

The documentation lives in the `docs/` folder.

An important file here is `package.json` which describes the javascript dependencies of the current project but
also provides a set of commands available for managing the project.  The content contains something like this:

```json
{
  ...
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "docs:dev": "vitepress dev docs",  // this is a docs command!
    "docs:build": "vitepress build docs", // this too
    "docs:serve": "vitepress serve docs" // this too
  },
  ...
}
```

In the `scripts` section you see several commands.  To run them you just type `npm run <cmd>`. 
For instance typing `npm run docs:dev` will effectively type `vitepress dev docs`.  The `npm run <cmd>`
commands are just shorthands for running build steps of the vitepress documentation system, and
later for the 🫠 Smile project itself.  Anytime you forget the possible commands just type `npm run`
on a line by itself and you'll get a listing like this:

```sh
➜ npm run
Scripts available in smile@0.0.0 via `npm run-script`:
  dev
    vite
  build
    vite build
  preview
    vite preview
  docs:dev
    vitepress dev docs
  docs:build
    vitepress build docs
  docs:serve
    vitepress serve docs
```

## Development
To develop the docs in real time type `npm run docs:dev`.  You should see something like this

```sh
➜ npm run docs:dev

> smile@0.0.0 docs:dev
> vitepress dev docs

vitepress v1.0.0-alpha.1

  > Local: http://localhost:3000/
  > Network: use `--host` to expose
```

Opening `http://localhost:3000/` in your browser will let you see the current documentation website.

Lets look at the current files in the `docs/` folder:

```
docs
├── .vitepress
│   └── config.js
├── contributing.md
├── index.md
├── introduction.md
├── manifesto.md
└── notes.md
```

The docs are written in [plain markdown](https://vitepress.vuejs.org/guide/markdown.html).  Just edit or add
new `.md` files as you like.  You can also add new subfolders.  To add them to the side bar or nav bar at the top take a look inside
`.vitepress/config.js`.  It is mildly self-explanatory (full docs [here](https://vitepress.vuejs.org/config/introduction.html)).
Vitepress is under active development but quite functional.

One cool thing about running `npm run docs:dev` is the website uses hot module reloading so any changes you 
save to the markdown or configuration files will automatically update your browser giving you instant feedback.  It is incredibly
fast thanks to Vite.

When you are done making changes to the docs just use git commands to stage the files, commit them and (when you are ready) push
them to the github repo.

## What happens next?

:::warning
This is to-be-implemented
:::

Currently the docs are live at [http://smile.gureckislab.org](http://smile.gureckislab.org).  When you commit changes to the docs to github they are automatically rebuilt and synchronized with that website url (using [Github Actions](https://docs.github.com/en/actions)) so there is nothing you really need to do.  Pushing your changes to the master branch will update the website.