# Recruiting Participants

The first step in recruiting participants is to get the public URL for your
study. If you're in the Gureckis Lab, the easiest way to do this is through the
`#smile-deploy` slack channel. Find the message for your most recent commit,
which will look like this:

![Slack URL](/images/getURL-slack.png)

The public URL for your study is the second one
(`https://exps.gureckislab.org/e/note-useless-uncle` in the example above).

## Prolific

### Posting your study

From the Prolific dashboard, either click 'New study’, or duplicate a previous
study from within the 'Completed’ tab on the sidebar (click 'Action’, then
'Duplicate’).

Describe your study in the first section:

![Prolific study description](/images/prolific-step1.png)

In the second section, you provide the study link for your participants. When
Prolific sends participants to this URL, it can pass three variables:
PROLIFIC_PID (unique to the participant), STUDY_ID (unique to the study), and
SESSION_ID (unique to the participant and study). To record these variables, we
need to add to the end of the study URL.

First, we need to direct participants to the Prolific welcome page, so we add
`#/welcome/prolific/` to the end of the URL.

Then, we need to record the variables from Prolific, so we add:
`?PROLIFIC_PID={{ "{{%PROLIFIC_PID%" }}}}&STUDY_ID={{ "{{%STUDY_ID%" }}}}&SESSION_ID={{ "{{%SESSION_ID%" }}}}`
to the end of the URL.

So the final URL you give Prolific should look like this:

`https://exps.gureckislab.org/e/note-useless-uncle/#/welcome/prolific/?PROLIFIC_PID={{ "{{%PROLIFIC_PID%" }}}}&STUDY_ID={{ "{{%STUDY_ID%" }}}}&SESSION_ID={{ "{{%SESSION_ID%" }}}}`

Here's how you enter that in Prolific:

![Prolific study link](/images/prolific-step2.png)

Next, you need to tell Prolific how to end the study. Smile automatically
redirects participants to Prolific when the study has completed (as long as you
include `#/welcome/prolific/` in the URL, which directs participants through the
Prolific version of your study). So you shoud select "I'll redirect them using a
URL":

![Prolific end study](/images/prolific-step3.png)

The completion code doesn't have to be anything in particular. Smile is
configured to produce a random completion code specific to each participant,
based on a hash of the participants' data file. This can be used to verify that
each participants' completion code matches their data (e.g., to prevent
completion codes from being shared with people who didn't actually complete the
study). As a result, however, the completion code submitted by participants will
not match the completion code on Prolific. This is fine -- you can still
auto-approve all participants when the study is completed. However, if you want
to reject participants who have the incorrect completion code, you may need to
do so manually.

You can override the completion code provided by Smile by editing
`ThanksPage.vue`.

Next, you need to specify your sample. It can sometimes be helpful to screen out
participants with a low approval rate or who are very new to Prolific:

![Prolific participants 1](/images/prolific-step4.png)
![Prolific participants 2](/images/prolific-step5.png)

Finally, you should enter how long your study takes, and how much you want to
pay participants. In the <GureckisLabText />, you should aim to pay participants
$15/hour. Prolific requires a minimum of $8/hour.

You can now preview your study -- it's good practice to test that Prolific
directs you to the correct URL for your study, that Smile saves the Prolific URL
parameters with the data, and that you get redirected back to Prolific when the
study is completed.

Finally, you can save your study as a draft or publish your study. You can also
schedule a later time/date for your study to be published.

### Paying participants

When your study is complete, it will be listed as "AWAITING REVIEW" on the
active studies tab:

![Prolific finish](/images/prolific-step6.png)

Click on the name of your study, then click "Approve all" to pay all
participants who finished the entire study. If you don't want to approve all
participants, you can approve individually by clicking the check mark next to
each submission. You can also click "More," then "Approve in bulk" to provide a
list of Prolific IDs to approve.

<!-- - Set the URL for your experiment to the IP address of the server using the format `http://<hostname>:<port-number>/`. (T Make sure you include the forward slash, `/`, at the end, and make sure that you do not include the angle brackets.
- Under 'How to record Prolific IDs’, select the option 'I’ll use URL parameters’.
- Make sure Prolific will pass the following variables: PROLIFIC_PID, STUDY_ID, and SESSION_ID.
- At the end of the three steps above, the URL in the box under 'What is the URL of your study?’ should look something like:

http://128.100.100.100:9000/?PROLIFIC_PID=[[%PROLIFIC_PID%]]&STUDY_ID=[[%STUDY_ID%]]&SESSION_ID=[[%SESSION_ID%]]


At the end you redirect the participant to
https://app.prolific.co/submissions/complete?cc=HZCQS9MX
The completion code doesn't have to be anything in particular but there is an  -->

## Cloud Research

### Description

[CloudResearch](https://www.cloudresearch.com)—previously known as TurkPrime—is
a service that runs on top of Amazon Mechanical Turk that offers some additional
screening and demographic information about workers. The most relevant service
for psychologists is probably the
[MTurk Toolkit](https://www.cloudresearch.com/products/turkprime-mturk-toolkit/).
Essentially, CloudResearch pre-screens workers on Mechanical Turk to flag
possible bots as well as reliably inattentive participants. The idea is that by
using their technology you can get higher quality data than using the low-level
MTurk API.

Cloud Research takes several steps to improve the general data quality for
surveys including presenting workers questions which they check for consistency
(did the subject give the same answer last week as they did today?). They can
also perform some demographic sampling/filters if you need samples from
particular population groups.

They also provide GUI tools for posting HITs on Mechanical Turk that simplify
recruitment.

To get started you first need to create an account on
[CloudResearch.com](https://account.cloudresearch.com/Account/Login)

Next, you have to connect your Mechanical Turk account to Cloud Research,
effectively granting them access to post and approve HITs on your behalf.
CloudResearch provides instructions on doing this
[here](https://cloudresearch-com.s3.amazonaws.com/files/Instructions+for+linking+MTurk+and+CloudResearch+Accounts.pdf).

<!-- To create studies you use the intuitive study builder.  There are many custom fields that you can use to configure your study including payment, demographic restrictions, privacy-enhancing features, etc... However, the most important is to post the correct link to the study.  Here is an example.  But basically it is


At the end of CloudResearch studies you display to the worker a completion code that they paste into the study window.   -->

### Posting your study

Once you have connected your MTurk account (see previous section), go to the
CloudResearch dashboard and click "Create Study". You can choose to recruit
participants from the Mechanical Turk pool or CloudResearch's own platform,
Prime Panels. The steps below assume you have chosen MTurk, but the overall
process is similar for both.

In the first section, give your study an internal name and, optionally, list an
email address at which to be notified when the study starts and finishes.

In the "survey hyperlink" section, you provide the study link for your
participants (see the top of this page). This should be the anonymized version
(e.g., `https://exps.gureckislab.org/e/note-useless-uncle`). Additionally, we
need to direct participants to the Cloud research welcome page, so we add
`#/welcome/cloudresearch/` to the end of the URL. So an example would look like
this:

```
https://exps.gureckislab.org/e/note-useless-uncle#/welcome/cloudresearch/
```

Check the "Yes" radio button to auto-capture worker information so that you can
later extract it from the query string.

![CloudResearch basic information](/images/cloudresearch-step1.png)

On the "Setup & Payment" page, indicate the amount you'd like to pay each
participant. This will depend on the estimated time to complete the study, but
should be above minimum wage. In the <GureckisLabText />, the target is
$15/hour.

On the "Demographics" page, you can target specific participant populations to
recruit from, for an added fee.

On the "Worker Approval" page, select how your participants will have their work
approved. By default, Smile generates a custom completion code for each
participant based on a hash of their data, which can serve as an added
confirmation that the data came from that individual CloudResearch participant.
To enable this behavior, select the option to approve workers "Manually" and to
use a "Custom Completion Code". You could also use a single fixed completion
code for all participants (at the risk that this could be shared on a worker
forum or similar)—make sure to edit `ThanksPage.vue` if you choose to do so.

![CloudResearch worker approval](/images/cloudresearch-step2.png)

When you're done setting up your study, click "Save" and return to the
dashboard. From there, select "Launch Options" to either launch your study right
away, or schedule a time for it to launch later.

## Mechanical Turk

You can also use <SmileText /> with "raw" Mechanical Turk. It is generally
difficult to work with external surveys on Mechanical Turk so it is recommended
to use the Amazon Web Services API to create and manage HITs. This usually
requires some extra software such as [psiTurk](https://psiturk.org). However,
for simply posting a link to your <SmileText /> experiment it is easy to use
[Supersubmiterator](https://github.com/sebschu/Submiterator) which is a simple
python tool for interfacing with the API.

The instructions for installing and using Supersubmiterator are on that
project's github page. The main thing is to replace the `experimentURL` field of
the config file with the appropriate landing page. In this case it would be (as
an example):

```
"experimentURL": "https://exps.gureckislab.org/e/note-useless-uncle#/welcome/mturk/"
```

where `note-useless-uncle` would be replaced with the unique URL for your
project.

To test your "raw" Mturk hit you can look at two different landuing urls. When
the subjet is browsing for tasks on the Mturk website they see your page in
"preview mode" which corresponds to this URL:

```
https://exps.gureckislab.org/e/note-useless-uncle#/welcome/mturk/?assignmentId=ASSIGNMENT_ID_NOT_AVAILABLE&hitId=123RVWYBAZW00EXAMPLE&turkSubmitTo=https://www.mturk.com/&workerId=AZ3456EXAMPLE
```

Mturk adds these parameters to your URL when a participant accepts the hit.

```
htt?ps://exps.gureckislab.org/e/note-useless-uncle#/welcome/mturk/assignmentId=123RVWYBAZW00EXAMPLE456RVWYBAZW00EXAMPLE&hitId=123RVWYBAZW00EXAMPLE&turkSubmitTo=https://www.mturk.com/&workerId=AZ3456EXAMPLE
```

which loads slightly different content. You can customize aspects of this via
the `recruitment/MTurkRecruitPage.vue` component.

## SONA

[SONA Systems](https://www.sona-systems.com) is a participant management
platform commonly used at universities for recruiting research participants from
subject pools. Participants typically receive course credit for their
participation, though SONA also supports paid studies.

<SmileText /> supports both **SONA (credit)** and **SONA (paid)** as recruitment
services.

### Configuration

SONA requires several environment variables to be set in your `env/.env.local`
file. You will need to obtain these values from your SONA administrator or from
your SONA experiment settings page.

```
# sona (credit)
VITE_SONA_URL                    = 'https://yourschool.sona-systems.com'
VITE_SONA_EXPERIMENT_ID          = 'your_experiment_id'
VITE_SONA_CREDIT_TOKEN           = 'your_credit_token'

# sona (paid)
VITE_SONA_PAID_URL               = 'https://yourschool.sona-systems.com'
VITE_SONA_PAID_EXPERIMENT_ID     = 'your_experiment_id'
VITE_SONA_PAID_CREDIT_TOKEN      = 'your_credit_token'
```

You only need to fill in the set that matches your study type (credit or paid).
After updating these values, run `npm run upload_config` to sync them to GitHub
for deployment.

- `VITE_SONA_URL` / `VITE_SONA_PAID_URL` is the base URL of your institution's
  SONA instance (e.g., `https://yourschool.sona-systems.com`)
- `VITE_SONA_EXPERIMENT_ID` / `VITE_SONA_PAID_EXPERIMENT_ID` is the experiment
  ID assigned by SONA when you create the study
- `VITE_SONA_CREDIT_TOKEN` / `VITE_SONA_PAID_CREDIT_TOKEN` is the
  authentication token SONA provides for automatic credit/payment granting via
  web studies

### Setting up your study URL in SONA

When creating a web study in SONA, you need to provide the study URL. SONA will
append a `survey_code` parameter that identifies each participant. Your study URL
should follow this pattern:

For credit-based studies:

```
https://exps.gureckislab.org/e/note-useless-uncle/#/welcome/sona/?survey_code=%SURVEY_CODE%
```

For paid studies:

```
https://exps.gureckislab.org/e/note-useless-uncle/#/welcome/sona_paid/?survey_code=%SURVEY_CODE%
```

Replace `note-useless-uncle` with your project's code name. The `%SURVEY_CODE%`
placeholder is automatically replaced by SONA with the participant's unique
survey code.

### Informed consent for unpaid studies

SONA credit-based studies are unpaid, so the default informed consent language
about monetary payment is inappropriate. To show course-credit-appropriate
consent language, set the `unpaidStudy` runtime config option in your
`design.js`:

```js
api.setRuntimeConfig('unpaidStudy', true)
```

This changes the compensation bullet in the default `InformedConsentText.vue`
from payment language to course credit language. See the
[configuration docs](/coding/configuration) for more on runtime config. You can
also toggle this setting in the developer tools sidebar using the "Unpaid"
switch.

::: tip
The `unpaidStudy` option is not specific to SONA — it can be used for any
recruitment service where participants are not paid (e.g., citizen science
studies).
:::

### How completion works

When a participant finishes the study, the thanks page automatically provides a
button that redirects them back to SONA. This redirect URL includes the
participant's survey code and your credit/payment token, so SONA can
automatically grant credit or payment without any manual intervention.

For credit studies, the redirect goes to:

```
{SONA_URL}/webstudy_credit.aspx?experiment_id={ID}&credit_token={TOKEN}&survey_code={CODE}
```

This means participants are credited immediately upon clicking the button — no
completion codes to copy and paste.

### Testing in developer mode

In the developer tools sidebar, you can select "sona" or "sona_paid" from the
**Service** dropdown to simulate SONA recruitment during development. This lets
you test the full flow including the thanks/credit page without needing an
actual SONA participant.

## SPARK

[SPARK](https://spark.hartleylab.org) is a recruitment service from the Hartley
Lab designed for adolescent participants of various ages. Unlike SONA, SPARK
does not require environment variables or credit tokens — completion is handled
by redirecting participants back to the SPARK platform.

::: tip
SPARK is available to Hartley Lab members and collaborators. Contact the
Hartley Lab for access.
:::

### URL parameters

SPARK passes the following URL parameters when directing a participant to your
study:

- `subject_ID` (required) — the SPARK subject identifier
- `participant_ID` — the participant identifier
- `age` — the participant's age
- `gender` — the participant's gender

These parameters are stored in `api.private.recruitmentInfo` and can be
accessed anywhere in your experiment code. For example, you can use
`api.private.recruitmentInfo.age` and `api.private.recruitmentInfo.gender` in
`src/user/components/InformedConsentText.vue` to display age-appropriate consent
forms (e.g., showing a parental consent form for participants under 18).

The study URL format is:

```
https://your-deploy-host/e/your-code-name/#/welcome/spark/?subject_ID=SUBJECTID&participant_ID=PARTICIPANTID&age=AGE&gender=GENDER
```

### How completion works

When a participant finishes the study, the thanks page provides a button that
redirects them to:

```
https://spark.hartleylab.org/completed/${subject_ID}
```

This marks the participant's session as complete in the SPARK system.

### Testing in developer mode

In the developer tools sidebar, you can select "spark" from the **Service**
dropdown to simulate SPARK recruitment during development. The SPARK card in the
recruitment chooser will launch with test parameters so you can verify the full
flow including the thanks/completion redirect.

## PANDA

[PANDA](https://www.discoveriesinaction.org) (Princeton and NYU Discoveries in
Action) is a recruitment platform for younger participants, run by Marjorie
Rhodes and Sarah Jane Leslie at Princeton.

### URL parameters

PANDA passes a single URL parameter when directing a participant to your study:

- `ID` (required) — the PANDA participant identifier

Give PANDA the base study URL (without query parameters):

```
https://your-deploy-host/e/your-code-name/#/welcome/panda/
```

PANDA will automatically append `?ID=<participant_id>` when directing
participants to your study. The `ID` parameter is stored in both
`api.private.recruitmentInfo.panda_id` and `api.data.panda_id` (so it appears
in saved data files).

### Dual-iframe caveat

PANDA loads the study in two iframes simultaneously (one hidden, for
mobile/desktop switching). This can cause localStorage conflicts when two Vue
app instances run at once. <SmileText /> handles this automatically:

1. **Hidden iframe detection**: When the study loads via PANDA and
   `window.innerWidth === 0` (indicating a hidden iframe), navigation is
   cancelled so the hidden instance never initializes.
2. **localStorage clearing**: On visible iframe load, any existing
   `smilestore-*` keys are cleared from localStorage before processing URL
   parameters. This also handles the sibling/retry case where families need to
   run the study multiple times.

No special configuration is needed — this is handled in the `welcome_referred`
route's `beforeEnter` guard.

### How completion works

PANDA has no completion redirect URL. When a participant finishes the study, the
thanks page shows a generic "study complete" message. Researchers can customize
their own end-of-study flow by using the optional PANDA builtin components (see
below).

### Optional builtin components

<SmileText /> provides optional PANDA-specific builtin components that
researchers can import and add to their timeline:

- **`ParentFormView`** (`@/user/components/panda/ParentFormView.vue`): An
  end-of-study parent form collecting video privacy consent, digital signature,
  how-did-you-find-us checkboxes, primary language, and comments. Typically used
  with `meta: { setDone: true }`.

- **`UploadVideoView`** (`@/user/components/panda/UploadVideoView.vue`): A final
  screen with a placeholder for an instructional video telling parents how to
  upload their video recording. Force-saves data on mount. Typically used with
  `meta: { resetApp: true }`.

These live in `src/user/components/panda/` rather than `src/builtins/` because
they are starter templates meant to be customized for each study (e.g.,
replacing the video placeholder with your actual instructional video URL).

To use these, uncomment the PANDA section in `src/user/design.js` or add:

```js
import ParentFormView from '@/user/components/panda/ParentFormView.vue'
import UploadVideoView from '@/user/components/panda/UploadVideoView.vue'

timeline.pushSeqView({
  name: 'parentform',
  component: ParentFormView,
  meta: { setDone: true },
})

timeline.pushSeqView({
  name: 'uploadvideo',
  component: UploadVideoView,
  meta: { resetApp: true },
})
```

### Testing in developer mode

In the developer tools sidebar, you can select "panda" from the **Service**
dropdown to simulate PANDA recruitment during development. The PANDA card in the
recruitment chooser will launch with a test ID so you can verify the full flow.

## Crowd-sourcing

In the future the lab might make a citizen science recruitment portal. To
support this we provides a similar API to prolific/AMT with the more generic
CITIZEN_ID type identity variables:

`/?CITIZEN_ID=XXXXX&CITIZEN_TASK_ID=123RVWYBAZW00EXAMPLE&CITIZEN_ASSIGN_ID=AZ3456EXAMPLE`

However this is not completely implemented.
