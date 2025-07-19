# :moneybag: Computing Bonuses

When we assign performance-related bonuses to participants, we cannot trust the
client data to assign the bonus amount directly because a bad actor could alter
the code running in the browser to arbitrarily alter the value.

Instead, a better approach is to run some code on the server (i.e., some process
in the cloud) which runs the logic to compute the bonus and writes it to an
unmodifiable part of the data record for a user.

In <SmileText />, this is handled using
[Google Cloud Functions for Firebase](https://firebase.google.com/docs/functions/?authuser=0#implementation_paths).
This is a server technology, ironically called "serverless" where you upload
small Javascript functions that can perform limited computation to the Google
Cloud. Google cloud handles the maintenance and scaling of these functions in
tiny low-resource sandbox cloud computing environments. These environments are
started and stopped by Google according to arcane logic which balances cost and
needs.

This guide gives you an overview of using Cloud functions to compute server-side
functions. Although this guide is predicated on the most common use case --
computing bonuses -- it can also be used to design stimuli and enable other
custom functionality to your experiment.

## Overview of Cloud Functions

Google Cloud Functions are little bits of Javascript (or other languages) that
run in the cloud based on **triggers**. Triggers can be web requests (like
accessing a special URL that triggers the code to run) or can be **events**
within the Google Firebase system including things having to do with writing or
creating new documents in Firestore.

The basic use case then is to deploy a function that runs each time a data
file/document is marked as completed and then computes the bonus based on that
data file, and writes that value to a place within the Google Firestore that is
off limits to read/write access by public web clients.

This is helped by the fact that Google Cloud Functions have unlimited read-write
access to the Firestore database but web clients can be configured in various
ways to only have certain read/write permissions to particular documents.

## Install the Google Cloud Command Line Tool

To develop, test, and deploy Google Cloud Functions you need to install the
google command line tool using brew:

```
brew install --cask google-cloud-sdk
```

Once this is installed then login to firebase using your Google user account:

```
firebase login
```

:::warning Important You need to have the <SmileText /> Firestore project added
to your Google Firebase Cloud Console. Contact Todd if you are in the
gureckislab. :::

## Write/Edit a Cloud Function

Cloud Functions for your project are written in `functions/index.js`. The full
documentation for writing these methods is
[here](https://firebase.google.com/docs/functions?authuser=0) but there are
several examples provided for you showing the types of events you can use as
triggers and how to access Firestore data.

The most common type of triggers used with <SmileText /> are https events (when
something accesses a particular web url) or when certain firestore documents are
modified.

### https triggers

```js
exports.helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info('Hello logs!', { structuredData: true })
  response.send('Hello from Firebase!')
})
```

### Firestore triggers

```js
// Listens for new messages added to /messages/:documentId/original and creates an
// uppercase version of the message to /messages/:documentId/uppercase
exports.makeUppercase = functions.firestore
  .document('/messages/{documentId}')
  .onCreate((snap, context) => {
    // Grab the current value of what was written to Firestore.
    const original = snap.data().original

    // Access the parameter `{documentId}` with `context.params`
    functions.logger.log('Uppercasing', context.params.documentId, original)

    const uppercase = original.toUpperCase()

    // You must return a Promise when performing asynchronous tasks inside a Functions such as
    // writing to Firestore.
    // Setting an 'uppercase' field in Firestore document returns a Promise.
    return snap.ref.set({ uppercase }, { merge: true })
  })
```

## Test the Cloud Function

Firebase includes an emulator system that lets you test your functions locally
before deploying. To run the emulator type

```
firebase emulators:start
```

## Deploy the Cloud Function

To deploy to Cloud functions

```
firebase deploy --only functions
```
