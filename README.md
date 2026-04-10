
# Smile 🤠 (codec-lab fork)

This is the codec-lab fork of the [Smile project](https://smile.gureckislab.org/), used as the base template for running experiments.

## Starting a new experiment

Don't worry, it's easy and most of it you only do once! See also the [general smile setup docs](https://smile.gureckislab.org/starting.html).

### Step 1: Copy this repo

Create a new private GitHub repository from this template and clone it locally:

```bash
gh repo create <YOUR_EXPERIMENT_NAME> --private --template codec-lab/smile
gh repo clone <YOUR_GITHUB_USERNAME>/<YOUR_EXPERIMENT_NAME>
cd <YOUR_EXPERIMENT_NAME>
```

### Step 2: Get the lab config files

Pull the lab's secret configuration files (Firebase credentials, deploy keys, etc.) from the private [smile-secrets](https://github.com/codec-lab/smile-secrets) repo:

```bash
npm run get_secrets
```

> **Note:** You need access to [codec-lab/smile-secrets](https://github.com/codec-lab/smile-secrets) first — ask Mark.

Then push the config to your repo's GitHub secrets:

```bash
npm run upload_config
```

### Step 3: Install dependencies

Install the required Node packages for local development and testing:

```bash
npm run setup_project
```

### Step 4: Verify deployment

Create an initial deployment to confirm everything is configured correctly. A confirmation will appear in the lab Slack channel.

```bash
npm run force_deploy
```

In the future, deployments happen automatically whenever you push to your repo.

### Step 5: Start developing

Run the development server to see the default experiment setup:

```bash
npm run dev
```

More information about developing is available in the [smile docs](https://smile.gureckislab.org/coding/developing.html).

## Downloading experiment data

To download your experiment data, run:

```bash
npm run getdata
```

You will be prompted for:
- **Data type** — `testing` (your own test runs) or `real` (actual participant data)
- **Complete only or all** — whether to include only participants who finished the experiment
- **Branch name** — defaults to your current branch
- **Filename** — where to save the output

Data is saved as JSON to `data/`.

More information about data analysis is available in the [smile docs](https://smile.gureckislab.org/analysis.html).

## Downloading recruitment data

To download recruitment data, run:
```bash
npm run getrecruitment
```

You will be prompted for:
- **Data type** — `testing` or `real`
- **Branch name** — defaults to your current branch
- **Filename** — where to save the output

Data is saved as JSON to `data/private/` (gitignored).
