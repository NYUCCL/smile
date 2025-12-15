---
outline: none
---

<img src="/images/smile.svg" width="300">

The Smile project is a new way to develop rich and interactive online
experiments. Smile prioritizes modularity and reusability. Unlike tools that
cater to non-programmers, Smile is designed to help reasonably competent
programmers (or AI-assisted programmers) accomplish more in less time.

<video controls autoplay loop muted poster="https://todd.gureckislab.org/images/blog/smile-0.1.0-devmode.png" style="max-width:100%;width:700px;">
  <source src="https://todd.gureckislab.org/videos/blog/smile-0.1.0-devmode.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

### Highlighted features:

- 🌈 Fast and fun front-end interface development with
  [Vue.js](https://vuejs.org), [Tailwind CSS](https://tailwindcss.com/), and
  [Shadcn/vue](https://www.shadcn-vue.com/). Create complex games, animations,
  and surveys with ease.
- 👩‍💻 Custom [developer mode tools](/coding/developing) provide a novel interface
  for specifying and debugging interactive experiments. Quickly jump between
  phases and trials in your experiments,
  [autofill forms and generate mock data for testing](/coding/autofill),
  [hot-reload](/coding/developing#hot-module-replacement) your code without
  restarting the entire experiment, and more!
- 🧩 Built-in support for
  [common experiment elements](/coding/views#built-in-views) like consent forms,
  instructions, and surveys. Just add your custom experiment logic and start
  collecting data.
- 🤖 Code writing is greatly accelerated using AI tools, as LLMs are trained on
  extensive codebases covering Vue, Tailwind, and other popular web standards
  used by the project.
- 👫 Supports multiple [recruitment services](/recruit/recruitment) including
  Prolific, MTurk, CloudResearch, and more.
- 📝 [Data provenance features](/analysis#data-provenance) include an audit
  trail of which version of the code was used to create each data file.
- 🐍 Easy-to-use [Python library](/analysis#python-analysis-library-smiledata)
  for data analysis with Polars DataFrames, built-in plotting, and support for
  Jupyter and Marimo notebooks.
- 😎 Great-looking and detailed docs, if we do say so ourselves!

Current development is happening at
[https://github.com/nyuccl/smile](https://github.com/nyuccl/smile).

Ready to get started? Continue [here](/requirements).

Not sure? Let us walk you through some [key concepts](/concepts).

Need help? Go [here](/help).

::: info Find this useful in your work? We have a plan to help you cite it!

We will eventually issue a preferred citation for the project on May 1, 2026. It
will be based on the GitHub contributions list (i.e., contributions to the docs
or code that hit the main branch, or noteworthy helpful interactions on GitHub
discussions). The author list is open to anyone who contributes substantially.

_Initial project development was supported by National Science Foundation Grant
[BCS-2121102](https://www.nsf.gov/awardsearch/showAward?AWD_ID=2121102&HistoricalAwards=false)
to T. M. Gureckis._

:::
