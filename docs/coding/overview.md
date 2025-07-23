# Coding Overview

The following sections describe how to design experiments using the <SmileText/>
project. It covers the basics of programming new task elements, configuring the
timeline/flow of your experiments, and customizing the look and feel of your
experiments.

## Developer mode

When learning about <SmileText/> and later developing/debugging your experiment,
it is useful to interact with Smile using a web server running on your local
computer (i.e., your laptop or desktop). <SmileText/> provides a special local
developer mode, which adds some interface elements to the page that help you
debug and test your experiment. You can learn more about developer mode
[here](/coding/developing). But the TL;DR is:

```
npm run dev
```

in the project folder to get started.

## Configuring

Every experiment is different and requires different configuration options for
things like database credentials, etc. In <SmileText/>, configs are set using
`.env` files. Some of these are automatically generated, some are passed from
the [base repo](/labconfig) to child repos, and some need to be customized for
each experiment. [This section](/coding/configuration) of the documentation
explains all the configuration settings available.

## Components

<img src="/images/components.png" width="50%" align="right">

This section introduces the concept of a [**component**](/coding/components) and
how components help organize code by making it more modular and reusable. Then
we discuss specific features of Vue.js components (e.g.,
[single-file components](/coding/components#single-file-components),
[declarative rendering](/coding/components#declarative-rendering-and-reactivity),
and [reactivity](/coding/components#declarative-rendering-and-reactivity)) that
help make web development code more compact and error-free.

A large part of designing your own experiment will be implementing a custom
component for your task, or borrowing from an existing one.

## Views

Most experiments are made up of several phases (e.g., welcome, informed consent,
instructions, debriefing, etc.). We call the phases "Views" and each major phase
of an experiment is associated with its own Vue component. Learn about views
[here](/coding/views).

<img src="/images/viewstimeline.png" width="600" alt="timeline example" style="margin: auto;">

Smile comes with several [built-in views](/coding/views#built-in-views) for
common phases of an experiment. This includes things like obtaining informed
consent, presenting instructions, and presenting a thank you page. We describe
these default built-in views and provide an overview of how to customize them
for your own experiment.

## Timeline and Design

Most experiments require participants to proceed through these phases in a
particular order. For example, informed consent must be provided and agreed to
before we perform the actual experiment. Smile provides a
[timeline](/coding/timeline#timeline) that you use to configure this behavior.

The timeline is configured in an important file in every <SmileText/> project
called the [design file](/coding/timeline#the-design-file-user-design-js)
(located at `src/user/design.js`). This file is where you configure the timeline
for your experiment, including which phases are included and the order in which
they appear. In addition, the design is used to specify randomization across
conditions, preloading of content, and other important features of your
experiment.

You almost certainly will need to edit this file for your experiment.

## Stepping Views

Many experiments are organized into a series of repeated events called "trials".
Trials are different than Views because they often repeat the same basic
structure many times (analogous to the difference between a 'slide' and a 'build
step' in a Keynote/PowerPoint presentation). Smile provides several features for
[stepping views through a series of trials](/coding/steps). We introduce the
concept of a "step" and how to programmatically advance through a sequence of
steps within a particular View. The same concept is also used to add sequential
steps to any type of view (e.g., a sequence of instructions or a multi-part
form). Critically, by using the built-in <SmileText/> "stepped Views" feature,
if a participant refreshes the page or loses internet connection, they can pick
up where they left off.

<img src="/images/steps.png" width="600" alt="steps example" style="margin: auto;">

## Autofill

When developing and debugging your experiment, it is useful to have a way to
"fake" data from participants. This can be used to quickly advance through the
experiment to test different parts of the code. Smile provides a way to
[autofill forms](/coding/autofill) with fake data. In addition, you can generate
fake, but realistic data for your experiment. This can help later to test your
data analysis scripts.

## Randomization

Almost all experiments require some form of randomization. This could be
randomizing participants to a condition or randomizing the order of trials.
Smile provides several mechanisms for [randomizing](/coding/randomization) the
flow of experiments.

## Persistence

An important aspect of Smile is that it can be fully _persistent_, meaning that
if the participant reloads the browser page (or closes it and comes back), they
will pick up where they left off. This property has several important
implications for development and debugging.

## Saving and Recording Data

The most important function of any web experiment platform is securely saving
data. Smile provides several ways to
[save and record data](/coding/datastorage). In addition, the Smile API provides
convenience functions for data saving, making it quick and easy to save and
store what you need.
