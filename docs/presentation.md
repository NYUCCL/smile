# Presentation Mode

Presentation mode is a way of deploying <SmileText /> experiments in a way that
they can be used to share examples of an experiment with other people. This can
be helpful in cases where you want to share a link to your experiment with
readers of a paper, collaborators, or others. You can also use this mode to
develop richer, interactive views of the data in your experiment as well as
complete websites devoted to a paper or project. A good example of an experiment
being shared in presentation mode is
[here](https://exps.gureckislab.org/e/telephone-gleaming-kill/#/).

There are three things that presentation mode enables:

1. A nicely designed "landing page" that you can customize to show links to
   preprints/published articles, figures, and also links that let you jump
   between various parts of your experiment
2. It disables the control on which page/route of the experiment is shown in
   which order allowing you and your audience to jump around and explore
   different parts of the task (e.g., jump to read the instructions without
   first completing the consent form)
3. A automatically generated QR code that you can use to link to the
   presentation mode site from posters, papers, or other materials.

## How to use Presentation Mode

To run the default experiment in developer mode run

```
npm run dev:present
```

This will launch a website that looks something like this:

![Presentation Mode](/images/presentmode.png)

Notice that you can use the drop-down "jump" menu to jump around between the
parts of your experiment in this mode.

## QR Code download

The small QR code button in the top nav bar opens a dropdown menu that shows a
QR code for the current webpage. This can be downloaded as a SVG and inserted
into posters and talks. It points to the deployed location of the presentation
mode website.

## How to customize Presentation Mode

To customize this presentation mode page edit the
`src/userPresentationModeView.vue` component. You can add links to papers, hot
link to different parts of your experiment, or add custom routes that help to
visualize your data, etc...

## How to deploy in Presentation Mode

To deploy your project in presentation mode there are two options:

### Option 1: Branch-based deployment

Create a new branch titled 'presentation' and push this to GitHub. This will
generate a special "presentation mode" deployment and you'll receive a slack
notification about when the website is ready. An example from the default
<SmileText/> repo is
[here](https://exps.gureckislab.org/nyuccl/smile/presentation/#/)

### Option 2: Environment variable deployment

Set the `EXP_DEPLOY_MODE` environment variable in your local `.env.deploy.local`
file to `'presentation'`. This can be done by:

1. Create or edit the file `.env.deploy.local` in your project root
2. Add the line: `EXP_DEPLOY_MODE = presentation`
3. Run the update script: `npm run update_config`

When you next commit and push to any branch, the site will be built in
presentation mode.
