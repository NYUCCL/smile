<script setup>
import { reactive, computed } from 'vue'

const config = reactive({
    username: 'ghuser',
    projectname: 'my_cool_project',
    description: 'my new research project',
    base_git: 'nyuccl/smile'
})
</script>

<style lang="css">
.vp-doc  label {
    font-weight: bold;
    font-size: 1.1em;
    color: #42b883;
}
.vp-doc input {
    border: 1px;
    width: 90%;
    font-size: 1.1em;
    background-color: white;
    border: 1px solid #999;
    padding: 5px;
    padding-left: 10px;
    color: rgb(84, 84, 84);
}
.form {
    width: 90%;
    border-collapse:collapse;
    border: 0px;
}

.label {
    text-align: right;
    border: none;
}
.data {
    width: 60%;
    border: none;
}
.vp-doc td {
    vertical-align:top;
    border: none;
    font-size: 1em;
}
.vp-doc tr {
    border: none;
    font-size: 1em;
}
.vp-doc table {
    overflow-x: none;
    width: 90%;
    padding-left: 10px;
    padding-right: 20px;
    margin-right: 10px;
    margin-left: 0px;
}
</style>

# Starting a new project

After [setting up your lab](/labconfig), when you want to start a new project,
there are a few steps you must take. These include copying the current version
of the <SmileText/> project, adjusting the configuration settings for your
project, and running a setup script.

**Don't worry it is easy and most of it you only do once!**

:::details Customize this page!

To prevent typos, you can enter the key details of your project here and the
example commands below will be adapted for your situation, allowing you to
simply cut and paste without modifying the commands. This also gives some
recommendations. Things throughout this page will update as you type; nothing is
stored.

<table class="form">
    <tbody>
        <tr>
            <td class="label">
                <label for="username">GitHub username</label><br>
                Enter your GitHub user name here.
            </td>
            <td class="data">
                <input id="username" type="text" v-model="config.username" />
            </td>
        </tr>
        <tr>
            <td class="label">
                <label for="base_git">Base Github repo</label><br>
                If in gureckislab then default to `nyuccl/smile` otherwise, it is the base smile repo for your lab (e.g, `hartleylab/smile`).
            </td>
            <td class="data">
                <input id="base_git" type="text" v-model="config.base_git" />
            </td>
        </tr>
        <tr>
            <td class="label">
                <label for="projectname">Project name</label><br>
                We highly recommend you use underscores for spaces and name your project based on 
        the science (e.g., `question_asking`).
            </td>
            <td class="data">
                <input id="projectname" type="text" v-model="config.projectname" />
            </td>
        </tr>
        <tr>
            <td class="label">
                <label for="description">Description</label><br>
                Provide a one sentence description of your experiment.
            </td>
            <td class="data">
                <input id="description" type="text" v-model="config.description" />
            </td>
        </tr>
    </tbody>
</table>

:::

## 1. Copy over the basic project

Set your current working directory to where you would like to place your files.
For example, on Mac this might be your Desktop:

```
cd ~/Desktop
```

Following the steps below, copy the Smile GitHub repo into a new project name
and clone it locally.

In this example command, the new project will be named `{{config.projectname}}`,
using the NYU CCL Smile GitHub repo as a template.

**Note:** If your lab has already been [set up](/labconfig), you will likely use
your lab's copy of the Smile GitHub repo as a template (e.g.,
`hartleylab/smile`).

<div class="language-js"><pre><code><span class="line">gh repo create {{config.projectname}} --private --template {{config.base_git}}</span></code></pre></div>

Then clone that project to a local folder with the same name:

<div class="language-"><pre><code><span class="line">gh repo clone {{config.username}}/{{config.projectname}}</span></code></pre></div>

Next, update the GitHub description for your new repo:

<div class="language-"><pre><code><span class="line">gh repo edit {{config.username}}/{{config.projectname}} --description "{{config.description}}"</span></code></pre></div>

After this, you can visit GitHub and you should see a new repo in your personal
repositories list:
[http://github.com/{{config.username}}/{{config.projectname}}](http://github.com/{{config.username}}/{{config.projectname}})

Finally, change into the newly created project directory (assuming you called
your project `{{config.projectname}}`):

<div class="language-"><pre><code><span class="line">cd {{config.projectname}}</span></code></pre></div>

## 2. Configure your project

### Deployment `env/` files

If your lab has already been [set up](/labconfig), then you simply need to
obtain a copy of the base `env/` files for your repository. You specifically
need your lab's copies of

```
env/.env.deploy.local
env/.env.docs.local
env/.env.local
```

These will be ignored by git via the .gitignore and should be treated carefully
(e.g., don't put them on GitHub or in a publicly accessible spot).

**Only on first setup:** After all the necessary files are in the `env` folder,
run:

```
npm run upload_config
```

to configure your deployment process, remove some files you do not need, and
create an initial deployment/commit. The `npm run upload_config` command only
needs to be run once in your project the first time you create it. If you are
collaborating with someone on an existing project, you only need to run
`git secret reveal`.

::: info Error handling

In case of error, retry the process of [adding a new user](/adduser).

:::

### Google service account key

To download data from Firebase, you'll need a local copy of the Google Cloud
service account key. You can either:

- With a browser, log in to the firebase console for the project and download a
  service account key. At time of writing, this involves clicking the following
  sequence: project overview -> users and permissions -> service accounts ->
  generate new private key (with node.js).
- Use the Google Cloud CLI: first install it
  ([link here](https://cloud.google.com/sdk/docs/install)), then run
  - `gcloud init`
  - `gcloud auth login`
  - `gcloud iam service-accounts keys create service-account-key.json --iam-account=my-iam-account@my-project.iam.gserviceaccount.com`
- Get a copy from a lab member directly

However you acquire the key, name the file `.service-account-key.json`. Note the
leading `.`, which will hide it by default (press Command-Shift-Period to toggle
the showing of hidden files) and place it in the `firebase/` directory of your
project.

## 3. Setup the project

Next, run the `npm run setup_project` command:

```
npm run setup_project
```

This will install the required Node packages for local development and testing.

## 4. Verify the deployment

If you have properly configured your application, then you should be able to
create an initial deployment. Simply run

```
npm run force_deploy
```

to create a deployment given the current code in GitHub. In the future,
deployments will happen automatically anytime you push to your repo.

If your lab coordinator set up the Slack features of your
[base project](/labconfig), then join the `#smile-deploy` Slack channel for your
lab. A robot :robot: there will let you know that your project was deployed and
provide you with a web link to the live site.

If that didn't happen/work, then continue reading to learn more about
[deployments](/recruit/deploying), including
[debugging tips](/recruit/deploying#debugging-deployment-issues).

From here on out, any time you make a change to any file (except in the `docs/`
folder or a
[few specifically named branches](/recruit/deploying#what-commits-trigger-a-deployment)),
commit it, and push that change to your project repository, the Slack bot will
confirm your code has been uploaded to the live webserver and is theoretically
ready for participants.

## 5. Begin developing!

Next, you can begin testing and developing your app!

Simply type

```
npm run dev
```

to run the development server and see the current, default setup of the site.
More information about developing is available [here](/coding/developing).
