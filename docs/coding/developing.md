# Developing your experiments

When developing and debugging your experiment it is useful to interact with a
web server running on your local computer (i.e., your laptop or desktop). This
is much faster than waiting for the changes to be uploaded to the cloud and then
having your browser download the files again.

In <SmileText/> this is all handled by [Vite](https://vitejs.dev). Vite is a
development tool that is heavily optimized for developer experience (DX). There
is a lot to say about the features of Vite but more directly to test your
application locally simple type:

```
npm run dev
```

in the project folder. You should see something like this:

```
  vite v2.9.9 dev server running at:

  > Local: http://localhost:3000/
  > Network: use `--host` to expose

  ready in 283ms.
```

If you open the link shown after `Local:` (in this case,
`http://localhost:3000/`) in your browser[^mac] it will show you a live demo of
your web experiment. This website will automatically refresh and change as you
make modifications to your code. That's all you need to get started.

[^mac]:
    On Mac if you press the Command (⌘) key while clicking the link it will open
    in a new tab.

## Smile developer bar

When you are viewing your website on the development server there is a special
bar visible along the top of the page. This provides some useful links as well
as the ability to jump between different stages/routes of your experiment. This
bar will not be rendered when the website is deployed (so participants won't be
able to see it!).

On pages that have forms that have to be filled out you as the developer can
make a new button appear in the developer bar called "Autofill Form" which will
automatically fill in the form with some preset values making it easier to
advance to the next stage of debugging.

## Testing the build process

You can also test the build process locally. Simply type

```
npm run build
```

If the build is successful, the files will be bundled exactly as they will be on
your final deployed website. (Files go into the `dist/` folder which is not
tracked by git).

Next, you can view the website almost exactly as it will appear online by typing

```
npm run preview
```

## Hot Module Replacement

One of the most useful features of Vite in development mode is that it
automatically reloads the webpage any time changes are made to any project
files. This prevents you from having to go back and forth between your editor
and the browser and manually refreshing the browser window.

[Some tools](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
provide this automatic updating by forcing the entire browser webpage to reload
anytime a file changes.

However, the downside of reloading the site page each time there is a change is
that the "state" of the page is reset. For example, if you were testing your
experiment and were on trial 10 of the experiment, paused, and then changed the
color of one of the fonts, most live-reloaders will completely reload the page
taking you back to the first trial of the experiment (i.e., the state is reset).

Instead, Vite can reload modules for parts of a page without reloading the
_entire_ page. This can be **very powerful** for developing experiments because
it can prevent a lot of mindless clicking just to get back to a particular state
and trigger an error, etc... Once you understand this difference you'll wonder
how you ever programmed for the web without it. This feature is known as
[Hot Module Replacement](https://vitejs.dev/guide/features.html#hot-module-replacement).

## Bundling, Tree-Shaking, and Code-spliting

A second key feature of Vite is that it acts as a bundler. When you use complex
libraries in your project there may be lots of dependencies both within and
between packages. As one example, the popular [lodash](https://lodash.com)
library organizes all the functions into individual modules so importing the
lodash library in Node.js technically may load as many as 600 other files at
once. If this was running on a real webserver the number of separate requests
might overload the server. As a result, modern websites "bundle" the required
code into a single, optimized file so that only one file is imported. Vite does
this behind the scenes for you both in development and building mode.

There are several other features of Vite including a process called
[Tree-Shaking](https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking),
which removes functions from the bundle which are not used in the current app to
reduce the file size, and
[Code Splitting](https://developer.mozilla.org/en-US/docs/Glossary/Code_splitting),
which organizes files into "chunks" that reflect common dependencies across
different pages of a site.

## Merging changes to the template into your existing project

Because Smile is still being developed, there may be changes to the Smile
template after you begin setting up your own project. If you want to merge those
changes into your own project, follow these steps:

First, you need to make sure that your organization's fork of the Smile template
(the base Smile repo for your organization) has the latest version of Smile.

Once the Smile admin for your lab has merged any changes with your own lab's
base repo, you can follow these steps to merge the changes into your own
project.

The first time you want to get changes from the Smile template, you need to add
the base Smile repo for your lab as a new remote. For example, if your lab
organization is called `NYUCCL` on Github and the template repo is called
`smile`, you'd type the following command:

```
git remote add smile https://github.com/NYUCCL/smile.git
```

You only need to do this once. Next time, the Smile template will already be
added as a remote.

Next, fetch the current template from the Smile repo:

```
git fetch smile
```

If this is your first time merging changes from the template, create a branch
called smile-template in your project, and switch to that branch

```
git checkout -b smile_template
```

If you've done this before, the branch already exists, so just switch to the
branch:

```
git checkout smile_template
```

Then, merge the main branch of the current smile template into the
smile_template branch, and push the changes in smile_template to origin

```
git merge smile/main --allow-unrelated-histories -X theirs
git push
```

Make a new branch called update, based off the current branch your study is
being developed on

```
git checkout -b update
```

Merge the smile_template branch into update, and resolve conflicts:

```
git merge smile_template
```

Merge update into your experiment's branch, for example called main:

```
git checkout main
git merge update
```

Voila, your smile has been updated to be even bigger! The extra step (creating
another additional update branch) prevented the entire commit history of the
NYUCCL/smile repository from being added to your project, which helps keeps
things nice and clean.

Finally, you should re-run node's package installer incase any of the required
packages changed:

```
npm i
```
