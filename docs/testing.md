# :lady_beetle: Testing your experiment

Testing refers to writing automated scripts that verify the logic and operation of your code. Testing your code is critical to avoid bugs that cost you money and add to participant frustration.

Helping to integrate testing the code for your experiments into your project is one of the key features of <SmileText/>.

In [test driven development](https://en.wikipedia.org/wiki/Test-driven_development) you first write tests that describe how you want your software to behave, which initially will all fail. Then as you implement your code you will begin passing the test. Later, as your project matures, old tests help make sure that new changes do not break existing code.

Testing is perhaps a less familiar concept to scientific researchers but one that can be especially useful in experiment design and development.

## Types of tests

Within the software development community, there are multiple "kinds" of tests. In <SmileText/>, we will consider **unit/component tests** and **integration tests**.

### Unit/Component tests

Unit tests apply to a particular piece of code in isolation. For example, a test might be written to verify a function or component. Testing for the web is complicated by the fact that your code runs and interacts with several other programs such as the browser or possible databases. In the unit testing approach we will consider, we will use tools that are called "headless" in the sense that the run the code in a "virtual browser" that doesn't directly open a browser window. This can be useful for bits of logic that are not directly displayed as well as generally testing smaller pieces of code.

There is one downside to unit tests for web applications which is that the test doesn't render a "visible" version of your user interface, nor does it often embed the unit in an overall application structure. As a result, even if a set of unit/component tests passes, the overall application (e.g., database, etc...) might still have bugs.

### Integration/End-to-end (E2E) tests

Integration/E2E tests refer to tests that run against the full application. They are called integration tests because they test the integration of various software pieces together. These are often much more complicated to test because you have to actually interact with the browser and possibly make network requests, etc...

For unit/component tests, <SmileText/> user [Vitest](https://vitest.dev) and [cypress](https://www.cypress.io) and for integration tests it uses only [cypress](https://www.cypress.io). An important helping library for tests is [Vue Test Utils](https://test-utils.vuejs.org)




```
npm run test
```


```
npm run test:ui
```

## Testing coverage

In an ideal world 100% of your code is covered by test (meaning that when your test harness runs every line of your application gets tested). Coverage refers to the percentage of code covered by test. The ideal goal is to increase this value. You can obtain the unit test coverage for <SmileText/> using this command:

```
npm run coverage
```

## Types of E2E tests

### Completion tests

### Mischief agent tests

### Data integrity tests

Data integrity tests verify that the data input by the user is accurately reflected in the Firebase database.

### Checklist tests

Checklist tests run and verify that key elements of your experiment are properly configured and do not still have default values set by the <SmileText /> project template. This can be helpful to run before you first deploy your project to make sure you didn't miss anything . If this test passes successfully it means that your experiment it not caught by common misconfigurations.

Testing individual files (this will only run tests that contain `timeline` in their paths):

```
npx vitest timeline
```

For more information about the vitest command line options [see these documents](https://vitest.dev/guide/cli.html).

### Testing firestore/firebase

Often it is helpful to run tests of database writing using Firebase/Firestore without actually writing to the live database (because such transactions run against the account costs). Instead you an run a local emulator of the Firebase/Firestore system using the [Firebase Local Emulator Suite](https://firebase.google.com/docs/emulator-suite). The google website includes information about how to install and run this code.

Once you launch the emulator using

```
firebase emulators:start
```

You'll be able to connect to a local web process (running on port 4000) which mimics the Firebase console where you can run test.

In order to run <SmileText/> in testing mode you need to run it in testing mode. This forces the system to use the local Firebase emulator instead of the real, web-based Firebase.

```
npm run dev:test
```
