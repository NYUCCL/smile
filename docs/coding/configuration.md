# Configuration Options

<style>
.note {
    font-size: 0.9em;
    text-align: right;
}
</style>

Applications inevitably need configuration options. These control the look and
feel of your experiment or have the password for databases or other services.

This guide gives you the minimum information you need to get started as well as
details on adding new configuration options specific for your project.

## Getting started quickly

Configuration options in <SmileText /> are either stored in the `env/` folder or
can be configured at runtime using the `api.setRuntimeConfig()` function (see
the full API docs [here](/api)).

[Dotenv](https://dotenv.org) files are simply plain text files that define
configuration options in all caps along with values separated by an equals
sign.[^wisdom]. For example:

[^wisdom]:
    Some wisdom about these things is available on the
    [12 Factor App](https://12factor.net) site, particularly the section on
    [config](https://12factor.net/config). In this document, it is argued that
    environment variables are the safest way to configure sensitive information
    (this way they are never mentioned in files that could be accidentally
    committed.)

```
MY_CONFIG_OPTION  = 'hi'
ANOTHER_OPTION    = 33
MY_CONFIG         = '${MY_CONFIG_OPTION}1234'
```

If you have set up a [base repo](/labconfig) it will contain encrypted versions
of your lab's configuration files. As described in the
[starting a new project](/starting) guide, you will want to simply decrypt the
files provided in the repository.

::: danger Warning!

This will only work if you have signed and encrypted your lab's configurations.
See instructions [here](/adduser).

:::

To do this simply type:

```
git secret reveal
```

this should create several `.env.*.local` files in your `env/` directory (the
`*` means anything fills in there).

After all the necessary files are in the `env` folder run:

```
npm run upload_config
```

to configure your deployment process.

## Runtime configuration

Runtime configuration is done using the `api.setRuntimeConfig()` function. This
is useful for configuation options that are specific to the flow of your
experiment but are not passwords or other sensitive information. The most common
use case here is to set options in the `src/user/design.js` file.

For example, the following code sets several options at the top of the design.js
file. These override the default values in the `.env` file but can be a more
clear and convenient way to set them (it is also easier to share the design.js
file).

```js
api.setRuntimeConfig('allowRepeats', false)

api.setRuntimeConfig('colorMode', 'light')
api.setRuntimeConfig('responsiveUI', true)

api.setRuntimeConfig('windowsizerRequest', { width: 800, height: 600 })
api.setRuntimeConfig('windowsizerAggressive', true)

api.setRuntimeConfig('anonymousMode', false)
api.setRuntimeConfig('labURL', 'https://gureckislab.org')
api.setRuntimeConfig('brandLogoFn', 'universitylogo.png')

api.setRuntimeConfig('maxWrites', 1000)
api.setRuntimeConfig('minWriteInterval', 2000)
api.setRuntimeConfig('autoSave', true)
```

::: danger Warning!

Runtime configuration will **override** the values in the `.env` files. As a
result it makes sense to treat the `.env` files as default values which can be
modified in `design.js`.

:::

Runtime configuration also allows you to easily add new configuration options
that might be specific for your study that you want to configure in a global
place.

For example, you might want to the pay rate for your study. You could add this
to the `design.js` file as follows:

```js
api.setRuntimeConfig(
  'payrate',
  '$15USD/hour prorated for estimated completition time + performance related bonus'
)
```

Then in your component you can access this configuration option as follows:

```js
const payrate = api.getRuntimeConfig('payrate')
```

Runtime configuration options override the values in the `.env` files if they
have the same name. For example, if the `.env` file contains an option
`VITE_LAB_URL` then setting `api.setRuntimeConfig('labURL')` will override it
(see below for the `VITE_` syntax). However, if you create a novel runtime
config it will be stored separately (specifically `smileConfig.runtime`) in your
data file.

## Types of configuration variables

There are several configuration variables across different files. The first
thing to be aware of is that some variables begin with `VITE_` (e.g.,
`VITE_LAB_URL`). These variables can be exported and made available to the
Javascript of your experiment.

Variables that do not begin with `VITE_` are only available for other purposes
(e.g., configuring GitHub Actions, etc...).

## How configuration files are organized

Configuration files go in the `env` folder. Here is a typical listing of this
folder.

```
env/
├── .env
├── .env.local
├── .env.git.local
├── .env.docs.local
└── .env.deploy.local
```

You may not see all these files to begin with and so may need to create them (as
just described in a [previous section of this page](#getting-started-quickly) or
manually).

All the filenames begin with `.env` which is the convention used by the
[dotenv](https://dotenv.org) package. This is a growing standard within the web
application community.

Some files end in `.local` as the file extension. These files are by default
ignored by git (via the `.gitignore` file) and so are not version tracked. This
is necessary because some configuration options which go in those files are
considered "secret" and we don't want them easily searched in GitHub when/if
your project repository becomes publically shared.

Note that if you change the value of any configuration options, you must stop
your development server and start it again (running `npm run dev`) to see
changes update. Unlike code changes, Vite cannot update reload these while the
server is running.

Let's consider the files one by one.

#### Experiment Options (`.env`)

`.env` **is** version tracked in git and contains what we will call
**experiment** configuration options. These options are usually critical for
replicability of an experiment. Here is a typical file with fake entries for the
values (adjust for your situation):

```
# this file is tracked by github and contains
# default configuration parameters for the experiment
# these can be overridden by the user in the design.js file
# use the api.setRuntimeConfig() function
# this is to provide defaults for the experiment in case the user
# does not specify all the parameters in the design.js file

# allow repeats
VITE_ALLOW_REPEATS               = false

# color mode (light, dark or system)
VITE_COLOR_MODE                  = light


# should the ui default to allow responsive resizing
VITE_RESPONSIVE_UI               = true

# window sizing
VITE_WINDOWSIZER_REQUEST         = 800x600
VITE_WINDOWSIZER_AGGRESSIVE      = true

# branding
VITE_ANONYMOUS_MODE              = false
VITE_LAB_URL                     = 'https://mylab.edu'
VITE_BRAND_LOGO_FN                = 'universitylogo.png'

# randomization
VITE_RANDOM_SEED                 = 100012

# data saving
VITE_AUTO_SAVE_DATA              = true
VITE_MAX_WRITES                  = 1000
VITE_MIN_WRITE_INTERVAL          = 2000

# stepper configuration
VITE_MAX_STEPS                   = 5000

```

Notice that the configuration options in this file begin with `VITE_`. This
means they are made available to the web application/experiment.

- `VITE_ALLOW_REPEATS` attempts to prevent participants from taking your task
  more than once.
- `VITE_COLOR_MODE` sets the color mode of the experiment. Can be 'light',
  'dark', or 'system' (where system attempts to ask the browser what the setting
  should be based on the users OS)
- `VITE_RESPONSIVE_UI` set to true if you want the default
  [layout](/styling/layouts) to be responsive or fixed to the windowsizer
  request
- `VITE_WINDOWSIZER_REQUEST` configures the requested size of the page for
  rendering content (used by WindowSizerView.vue component)
- `VITE_WINDOWSIZER_AGGRESSIVE` if set to true and the user resizes the page,
  this will hide the task and show a guide to resize the window. It is called
  "aggressive" since it really stops the task moving forward when the user makes
  their window too small. This is enabled only after the subject is told and
  agrees they made the window a given size.
- `VITE_ANONYMOUS_MODE` is a boolean that configures if the experiment should be
  deployed in anonymous mode. This mode is useful for submitting a link to the
  study with a paper submission. In this mode, all <SmileText/>-default
  references to the organization conducting the study are removed.
- `VITE_LAB_URL` is the URL of the lab website. This can be used to link to the
  lab website or university homepage so participants can learn more about the
  organization conducting the study.
- `VITE_BRAND_LOGO_FN` is the filename of the logo for your lab. This is used in
  the header of the experiment. The file should placed be in `src/user/assets/`.
- `VITE_RANDOM_SEED` initializes the pseudo-random number generator in
  <SmileText />
- `VITE_AUTO_SAVE_DATA` configures if smile attempts to automatically save data
  when pages/view in the [timeline](timeline.html) are advanced.
- `VITE_MAX_WRITES` configures the maximum total number of writes that each
  experiment can perform to the Firestore database. Each write to the database
  document costs money so this can prevent runaway costs. It can be adjusted if
  needed though for you specific experiment.
- `VITE_MIN_WRITE_INTERVAL` configured the minimum time in milliseconds that
  should pass between writes to the Firestore. This respects Firestore's limit
  of 1 write per document per second. It defaults to 2000ms.
- `VITE_MAX_STEPS` configures the maximum number of rows/steps that can be
  contained in a View component. This helps manage performance and UI complexity
  when dealing with large numbers of steps in your experiment.

#### Web Services Options (`.env.local`)

`.env.local` contains options for connection to other web services such as
Firebase/Firestore for databases or for tracking bugs. These options are not
particularly "secret" (the options begin with `VITE_` which means they are made
available to the webapp), but aren't things we necessarily want to be crawlable
on github public repositories.

```
# enter firebase database credentials
VITE_FIREBASE_APIKEY             = apikey
VITE_FIREBASE_AUTHDOMAIN         = project.firebaseapp.com
VITE_FIREBASE_PROJECTID          = project
VITE_FIREBASE_STORAGEBUCKET      = project.appspot.com
VITE_FIREBASE_MESSAGINGSENDERID  = msgid
VITE_FIREBASE_APPID              = appid

# enter google analytics id
VITE_GOOGLE_ANALYTICS            = xxxx
```

- There several `VITE_FIREBASE_` options for configuring Google's Firestore
  backend (see [data storage](/coding/datastorage) for more info).
- `VITE_GOOGLE_ANALYTICS` is the Google Analytics ID for your experiment
  (optional)

#### Code Version Options (`.env.github.local`)

The `.env.github.local` file contains information about the latest git commit
for this project. The purpose of this file is so that your Javascript
application can keep track of which version of the code it is running. One key
principle of <SmileText/> is that
[data must always be linked to the code that created it](/philosophy.html#data-must-always-be-linked-to-the-code-that-created-it).

This file is generated automatically using a
[post commit hook](https://www.atlassian.com/git/tutorials/git-hooks) which
finds the current information and regenerates the file. For this reason you
should **never edit this file**. A helpful message at the top of the file will
always remind you this. The post-commit hook logic which generates the file is
stored in `scripts/post-commit`.

```
# DO NOT EDIT THIS FILE IT IS AUTOMATICALLY GENERATED
# this file is automatically generated by
# the post-commit hook (see scripts/post-commit).

VITE_PROJECT_NAME      = my_cool_project
VITE_GIT_HASH          = de318d8
VITE_GIT_REPO_NAME     = ${VITE_PROJECT_NAME}
VITE_GIT_OWNER         = gureckis
VITE_GIT_BRANCH_NAME   = main
VITE_GIT_LAST_MSG      = trigger a deployment!!
VITE_DEPLOY_BASE_PATH  =  "/${VITE_GIT_OWNER}/${VITE_GIT_REPO_NAME}/${VITE_GIT_BRANCH_NAME}/"
VITE_CODE_NAME         = something-something-something

# this port might not be correct, but it doesn't really matter
VITE_DEV_PORT_NUM      =  3000
VITE_DEPLOY_URL        =  "http://localhost:${VITE_PORT_NUM}${VITE_DEPLOY_BASE_PATH}"
VITE_CODE_NAME_DEPLOY_URL         =  "http://localhost:${VITE_DEV_PORT_NUM}/e/${VITE_CODE_NAME}"
```

Options include

- `VITE_PROJECT_NAME` is the name of your project (obtained from your the name
  of your git repository)
- `VITE_GIT_HASH` is a
  [SHA hash](https://www.designveloper.com/blog/hash-values-sha-1-in-git/) that
  indexes the current commit. This can be used on GitHub to look up any version
  of the code as you develop.
- `VITE_REPO_NAME` has the same value as `VITE_PROJECT_NAME`.
- `VITE_GIT_OWNER` is the username of the owner of the repository
- `VITE_BRANCH_NAME` is the name of the branch the most recent commit was made
  on
- `VITE_GIT_LAST_MSG` is the last commit message
- `VITE_DEPLOY_BASE_PATH` is the most important variable in the file because it
  configures your
  [deployment path](/recruit/deploying.html#using-github-as-a-project-organizing-tool)
  or where you code will appear on the server. It is built up out of the
  configuration options above.
- `VITE_CODE_NAME` is a unique hash of `VITE_DEPLOY_BASE_PATH`` using human
  readable words (via [codenamize](https://github.com/stemail23/codenamize-js))
- `VITE_DEV_PORT_NUM ` is what port Vite will try to use during development and
  local integration testing (i.e., when you run `npm run dev`). Defaults to
  `3010`.
- `VITE_DEPLOY_URL` is the expected URL for your application. When you run the
  deployment this is set to the final URL of your hosted server. When debugging
  locally (`npm run dev`) this is set to the URL you open in your browser to
  develop/debug.
- `VITE_CODE_NAME_DEPLOY_URL` is the version of the deploy URL masked by the
  `VITE_CODE_NAME`

##### Docs Deployment Config (`.env.docs.local`)

This file configures where the <SmileText/> documentation will be deployed to.
These options should generally be shielded from public repositories. Note that
these variable names do not begin with `VITE_` meaning they are not accessible
to your Javascript experiment.

```
# this file is not tracked by github and contains
# sensitive information inluding write access to our documentation
# web server!

# enter docs web server information here
DOCS_DEPLOY_HOST        = "docs.mydomain.org"
DOCS_DEPLOY_PATH        = "/home/user/domain.org"
DOCS_DEPLOY_PORT        = 22
DOCS_DEPLOY_USER        = user
DOCS_DEPLOY_KEY         = "-----BEGIN RSA PRIVATE KEY-----\nYOURKEY\n-----END RSA PRIVATE KEY-----"
```

- `DOCS_DEPLOY_HOST` is the hostname of where you upload your files
- `DOCS_DEPLOY_PATH` is the directory you upload your docs to
- `DOCS_DEPLOY_PORT` is the ssh port for your server (usually 22)
- `DOCS_DEPLOY_USER` is the username for your server
- `DOCS_DEPLOY_KEY` is the RSA private key used to access your server via
  passwordless ssh[^rsakey]

##### Deployment Config (`.env.deploy.local`)

The final file configures similar (secret) deployment options for your actual
experiment.

```
# this file is not tracked by github and contains
# sensitive information inluding write access to our experiment
# hosting web server!

# enter experiment hosting web server information here
EXP_DEPLOY_HOST        = "exps.mydomain.org"
EXP_DEPLOY_PATH        = "/home/user/exps.mydomain.org"
EXP_DEPLOY_PORT        = 22
EXP_DEPLOY_USER        = user
EXP_DEPLOY_MODE        = production
SLACK_WEBHOOK_URL      = https://hooks.slack.com/workflows/something
SLACK_WEBHOOK_ERROR_URL= https://hooks.slack.com/workflows/somethingelse
EXP_DEPLOY_KEY         = "-----BEGIN RSA PRIVATE KEY-----\n-----END RSA PRIVATE KEY-----"

```

- `EXP_DEPLOY_HOST` is the hostname of where you upload your files
- `EXP_DEPLOY_PATH` is the directory you upload your experiment to
- `EXP_DEPLOY_PORT` is the ssh port for your server (usually 22)
- `EXP_DEPLOY_USER` is the username for your server
- `EXP_DEPLOY_MODE` is the mode of the deployment (production, development, or
  presentation)
- `SLACK_WEBHOOK_URL` is the url for the Slack Webhook for posting deployment
  messages
- `SLACK_WEBHOOK_ERROR_URL` is the url for the Slack Webhook for posting error
  messages
- `EXP_DEPLOY_KEY` is the RSA private key used to access your server via
  passwordless ssh[^rsakey]

[^rsakey]:
    The key needs to be all on one line with `\n` character coding new lines.

## Configuring your deployment settings on GitHub

Several of the configuration options are designed to configure
["secrets"](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
on your GitHub repo. These are variables that you define in the settings section
of the repository which can then be accessed by a script at run time using
Github Actions. They are omitted from version control and from logs making it a
good way to share sensitive information without exposing them in a public repo.
When you run `npm run upload_config` you should see output like this (with
NYUCCL/smile replaced with your username and repo):

```
> smile@0.0.0 upload_config
> sh scripts/update_config.sh

✓ Set Actions secret SECRET_APP_CONFIG for NYUCCL/smile
✓ Set Actions secret DOCS_DEPLOY_PORT for NYUCCL/smile
✓ Set Actions secret DOCS_DEPLOY_PATH for NYUCCL/smile
✓ Set Actions secret DOCS_DEPLOY_USER for NYUCCL/smile
✓ Set Actions secret DOCS_DEPLOY_HOST for NYUCCL/smile
✓ Set Actions secret DOCS_DEPLOY_KEY for NYUCCL/smile
✓ Set Actions secret EXP_DEPLOY_HOST for NYUCCL/smile
✓ Set Actions secret SLACK_WEBHOOK_ERROR_URL for NYUCCL/smile
✓ Set Actions secret EXP_DEPLOY_KEY for NYUCCL/smile
✓ Set Actions secret EXP_DEPLOY_USER for NYUCCL/smile
✓ Set Actions secret EXP_DEPLOY_PATH for NYUCCL/smile
✓ Set Actions secret EXP_DEPLOY_PORT for NYUCCL/smile
✓ Set Actions secret SLACK_WEBHOOK_URL for NYUCCL/smile
```

These secrets are used by the GitHub actions to properly build and deploy your
website and docs without causing problems. See the discussion
[here](https://stackoverflow.com/questions/60176044/how-do-i-use-an-env-file-with-github-actions)
for some helpful tips.

## Importing configuration settings into your experiment

Variables with the name `VITE_` are made available to your web
application/experiment. [Vite](https://vitejs.dev) uses the
[dotenv Node.js package](https://vitejs.dev/guide/env-and-mode.html) to read in
`.env` files and make them accessible in your javascript. This is done by doing
a static string replacement operation on all the files before building them (and
is also done as a step in the development server). The variables become
available in your code as `import.meta.env.VITE_XXXX` where `XXX` is the name of
the environment variable.

If you look at the content of `src/config.js` you can see how these items are
pulled into a global configuration object.

<<< ../../src/core/config.js

It is important to keep in mind that variables passed to `src/core/config.js`
will not necessarily appear in GitHub but **will** be visible to people
performing your experiment via the source code. So it is useful to keep in mind
if a configuration option should or shouldn't be shared with your Javascript
experiment.

## Adding new configuration options

Adding new configuration options can also happen in `.env.local`. You simply
make up a new `VITE_SOMETHING` variable. Then add it to the object in
`src/core/config.js` to expose it to your web application! The configuration is
available as `smileconfig` anywhere in your Vue app. It's pretty easy.

If you add any new configuration options, you must stop your development server
and start it again (running `npm run dev`) to see changes update. Unlike code
changes, Vite cannot update reload these while the server is running.

Note: if you add new configuration options, you need to also update them on
GitHub for those to sync to deployments. Run `npm run upload_config` as
explained above under
[Configuring your deployment settings on GitHub](#configuring-your-deployment-settings-on-github).
