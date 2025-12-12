# Smile API

Smile provides a common API which is accessed in user [Views](/coding/views) and
[Components](/coding/components). This API provides a set of methods and
properties which enable things like navigation, state management, data access,
and more.

## Usage

The Smile API is typically accessed through the `useViewAPI` composable, which
extends the base `useAPI` with additional functionality for interacting with the
stepper and handling user input events:

```js
// import and initialize view API (recommended)
import useViewAPI from '@/core/composables/useViewAPI'
const api = useViewAPI()

// or import and initialize base API only
import useAPI from '@/core/composables/useAPI'
const api = useAPI()
```

The `useViewAPI` composable provides all the functionality of `useAPI` plus
additional methods for:

- Stepper control and data management
- Keyboard event handling
- Mouse event handling
- Step data recording
- Timing utilities
- State visualization

::: danger When to use `useViewAPI` versus `useAPI`?

There are two ways to invoke the Smile API (`useViewAPI` or `useAPI`). You
should only use `useViewAPI` with [Views](/coding/views) which are top level
components you register in `design.js` timeline. This is because `useViewAPI` is
specifically designed to provide View-level API features like the
[steps](/coding/steps) functionality. In other components if you need access to
API features like configuration settings, or the global store use `useAPI`.

:::

## Stepper Functions

The following functions are available when using `useViewAPI`:

### Navigation

- `goNextStep(resetScroll = true)`: Advances to the next step in the stepper.
  The `resetScroll` parameter controls whether to automatically scroll to the
  top of the page after navigation.
- `goPrevStep(resetScroll = true)`: Returns to the previous step in the stepper.
  The `resetScroll` parameter controls whether to automatically scroll to the
  top of the page after navigation.
- `goToStep(path, resetScroll = true)`: Navigates to a specific step by path.
  The `resetScroll` parameter controls whether to automatically scroll to the
  top of the page after navigation.
- `goFirstStep(resetScroll = true)`: Resets the stepper to its first step. The
  `resetScroll` parameter controls whether to automatically scroll to the top of
  the page after navigation.
- `hasNextStep()`: Checks if there's a next step available.
- `hasPrevStep()`: Checks if there's a previous step available.
- `hasSteps()`: Checks if the stepper has any steps.

### Data Access

- `stepData`: Getter/setter for the current step's data. This is a proxy that
  allows you to get and set values on the current step's data. Changes are
  automatically saved to the stepper state.
- `stepDataLeaf`: Getter/setter for the current leaf node's data only. Similar
  to `stepData` but only includes data from the current leaf node, not the
  entire path. This is useful when you want to work with just the current step's
  data without including parent block data.
- `queryStepData`, `queryStepDataLeaf`: See
  [Data Query Methods](#data-query-methods).
- `dataAlongPath`: Getter for the raw data array of all steps in the current
  path. This is useful when you need to access the raw data structure of the
  path.
- `stepIndex`: Returns the current step index among leaf nodes.
- `blockIndex`: Returns the current block index.
- `pathString`: Returns the current path as a string.
- `path`: Returns the current path array.
- `length`: Returns the number of steps.
- `nSteps`: Alias for `length`.
- `blockLength`: Returns the number of steps in the current block.
- `stepLength`: Returns the total number of leaf nodes.
- `isLastStep()`: Returns true if the current step is the last step in the
  sequence.
- `isLastBlockStep()`: Returns true if the current step is the last step in the
  current block.
- `steps`: Provides direct access to the underlying Stepper state machine
  instance.

### Timing

- `startTimer(name = 'default')`: Starts a timer with the given name.
- `isTimerStarted(name = 'default')`: Checks if a timer has been started.
- `elapsedTime(name = 'default')`: Returns elapsed time in milliseconds.
- `elapsedTimeInSeconds(name = 'default')`: Returns elapsed time in seconds.
- `elapsedTimeInMinutes(name = 'default')`: Returns elapsed time in minutes.

### Global Variables

- `persist`: Access and modify view-specific persisted variables (gvars).
- `clearPersist()`: Clears all view-specific persisted variables.

### State Management

- `clear()`: Clears the stepper state and component registry.
- `clearCurrentStepData()`: Clears the data for the current step in the stepper.
- `updateStepper()`: Updates the internal stepper state.
- `recordStep()`: Records the current step data to the experiment data store.

### Event Handling

- `onKeyDown`: Handler for key down events.
- `onKeyPressed`: Handler for key press events.
- `onKeyUp`: Handler for key up events.
- `useMouse`: Hook for tracking mouse position and state.
- `useMousePressed`: Hook for tracking mouse button press state.

### Component Management

- `componentRegistry`: Map for storing and retrieving component definitions.

## Base API Functions

The following functions are available in both `useAPI` and `useViewAPI`:

## Navigation

- `goNextView(resetScroll = true)`: Advances to the next View in the timeline.
  The `resetScroll` parameter controls whether to automatically scroll to the
  top of the page after navigation.
- `goPrevView(resetScroll = true)`: Returns to the previous View in the
  timeline. The `resetScroll` parameter controls whether to automatically scroll
  to the top of the page after navigation.
- `goToView(view, force = true, resetScroll = true)`: Navigates to a specific
  View (by name). The `force` parameter temporarily disables navigation guards.
  The `resetScroll` parameter controls whether to automatically scroll to the
  top of the page after navigation.
- `hasNextView()`: Checks if there's a next View available.
- `hasPrevView()`: Checks if there's a previous View available.
- `nextView()`: Returns the next view object in the navigation sequence.
- `prevView()`: Returns the previous view object in the navigation sequence.

### Scroll Behavior

All navigation methods in both the base API and view API include an optional
`resetScroll` parameter that controls automatic scrolling behavior:

- **`resetScroll = true` (default)**: Automatically scrolls the main content
  container to the top after navigation. This ensures users start at the top of
  new views/steps.
- **`resetScroll = false`**: Preserves the current scroll position after
  navigation. Useful when you want to maintain the user's scroll position.

The scroll behavior targets the `.device-container` element, which is the main
content wrapper in SMILE applications.

**Example usage:**

```javascript
// Navigate to next view and scroll to top (default behavior)
api.goNextView()

// Navigate to next view but preserve scroll position
api.goNextView(false)

// Navigate to specific step and scroll to top
api.goToStep('trial/block1/step2')

// Navigate to specific step but preserve scroll position
api.goToStep('trial/block1/step2', false)
```

## State Management

- `resetLocalState()`: Clears all locally stored data, and redirects to the
  landing page.
- `resetApp()`: Resets the entire application state.
- `isResetApp()`: Checks if the app has been reset.
- `resetStore()`: Resets just the store state.
- `setKnown()`: Marks the user as known (has begun the experiment).
- `setDone()`: Marks the experiment as done.
- `setConsented()`: Marks that the user has consented.
- `setWithdrawn(forminfo)`: Marks that the user has withdrawn and saves
  information from withdrawal form.
- `verifyVisibility(value)`: Marks that the user can/can't see the whole
  experiment page.
- `getVerifiedVisibility()`: Retrieves the verified visibility state (true or
  false).
- `setCompletionCode(code)`: Sets the completion code for the experiment to
  `code`.
- `connectDB()`: Ensures the user is known and has consented, setting these
  states if needed.
- `completeConsent()`: Completes the consent process by setting consented status
  and known user if needed.
- `reloadBrowser()`: Reloads the current browser window/page.

## Component and Configuration Management

- `setAppComponent(key, value)`: Sets a global component configuration.
- `getAppComponent(key)`: Retrieves a global component configuration.
- `setRuntimeConfig(key, value)`: Sets a runtime configuration option.
- `getConfig(key)`: Retrieves a configuration option (first searches config then
  runtime).
- `getConditionByName(name)`: Retrieves a condition by its name.

## Data and Configuration Access

- `store`: Accesses the Smile store instance containing:
  - `store.browserPersisted`: Browser persisted state
  - `store.browserEphemeral`: Browser ephemeral state
  - `store.data`: Main data store
  - `store.private`: Private data store
  - `store.config`: Configuration settings
- `data`: Direct access to the data store (alias for `store.data`)
- `private`: Direct access to private data store (alias for `store.private`)
- `config`: Direct access to configuration (alias for `store.config`)
- `all_data`: Accesses combined private and data stores
- `all_config`: Accesses combined local, dev, github and main configs
- `urls`: Accesses URL configurations
- `logStore`: Accesses the logging store
- `route`: Accesses the current route
- `router`: Accesses the router object
- `timeline`: Accesses the timeline instance

## Utility Functions

- `useStepper`: Provides trial stepper functionality.
- `isBrowserTooSmall()`: Checks if the browser window is too small.
- `setAutofill(autofill)`: Sets up view autofill (development mode only).
- `removeAutofill()`: Removes view autofill (development mode only).
- `getRecruitmentService()`: Retrieves the recruitment service information.
- `getStepper(routeName)`: Gets the stepper for a specific route.
- `hasAutofill()`: Checks if autofill is available.
- `autofill()`: Performs autofill.
- `currentRouteName()`: Returns the current route name.
- `currentViewName()`: Returns the current view name.
- `getBrowserFingerprint()`: Retrieves the browser fingerprint.
- `preloadAllImages()`: Preloads all images for the experiment.
- `preloadAllVideos()`: Preloads all videos for the experiment.
- `getPublicUrl(path)`: Returns the public URL for a file.
- `getStaticUrl(path)`: Returns the URL for a user static file in
  `src/user/assets/`.
- `getCoreStaticUrl(path)`: Returns the public URL for a static asset provided
  by the smile library in `src/assets`.
- `scrollToTop()`: Scrolls the main content container to the top.
- `currentRouteInfo()`: Returns the current route info object.

## Randomization Functions

- `randomSeed(seed = uuidv4())`: Sets a new global random seed that will remain
  in use until the next route.
- `randomAssignCondition(conditionObject)`: Randomly assigns a condition based
  on the provided condition object. Supports weighted randomization.
- `randomInt(min, max)`: Generate a random integer between min and max
  (inclusive).
- `shuffle(array)`: Randomly reorder elements in an array using Fisher-Yates
  algorithm.
- `sampleWithReplacement(array, n, weights)`: Sample elements from an array with
  replacement.
- `sampleWithoutReplacement(array, n)`: Sample elements from an array without
  replacement.
- `faker`: Collection of faker distributions for generating random data.

## Logging and Debugging

- `log.debug(...message)`: Logs a debug message.
- `log.log(...message)`: Logs a standard message.
- `log.warn(...message)`: Logs a warning message.
- `log.error(...message)`: Logs an error message.
- `log.success(...message)`: Logs a success message.
- `log.clearPageHistory()`: Clears the page history log.
- `log.addToHistory(...args)`: Adds an entry to the page history log.

## Data Recording and Saving

The following methods are used to record and save data in the experiment. Note
that Firestore has limitations on the types of data it can store directly. When
using these methods, ensure your data objects are Firestore-safe:

- Only primitive types (string, number, boolean, null)
- Arrays of primitive types
- Objects containing only primitive types
- Timestamps
- References to other documents
- GeoPoints

Complex JavaScript objects (like functions, classes, or objects with circular
references) must be converted to Firestore-safe formats before saving.

- `recordPageData(data, routeName?)`: **Recommended** - Records data organized
  by route/page name and visit number. Data is stored in `pageData_<routeName>`
  with separate `visit_N` objects for each time the route is visited (e.g.,
  `visit_0`, `visit_1`, etc.). Each visit contains `timestamps` and `data`
  arrays that grow with each call during that visit. If routeName is omitted,
  uses the current route name. Returns `true` on success, `false` on validation
  failure. The data must be Firestore-safe and will be validated before
  recording:
  - Must be an object (not an array) - arrays would create nested arrays which
    Firestore doesn't support
  - Cannot contain nested arrays (e.g., `[[1,2], [3,4]]`)
  - Cannot contain functions or symbols
  - Keys cannot contain `.`, `/`, `[`, `]`, or `*`

  Example stored structure:

  ```javascript
  pageData_trial: {
    visit_0: {  // First visit to this route
      timestamps: [
        1702300000000,  // [0] first recordPageData() call
        1702300001000   // [1] second recordPageData() call
      ],
      data: [
        { response: 'A', rt: 450 },  // [0] first recordPageData() call
        { response: 'B', rt: 520 }   // [1] second recordPageData() call
      ]
    },
    visit_1: {  // Second visit to this route (e.g., participant returned)
      timestamps: [1702300100000],
      data: [
        { response: 'C', rt: 380 }
      ]
    }
  }
  ```

  Within each visit, `timestamps[i]` corresponds to `data[i]`. Each call to
  `recordPageData()` appends one timestamp and one data object to the current
  visit.

- `recordProperty(name, FirestoreSafeObject)`: Saves a Firestore-safe object at
  the top level of the data object. This does not save the data to the database,
  but it does record it in the local state. The next call to `saveData()` will
  save the data to the database.
- `recordStep()`: Records the current step data using `recordPageData()`. This
  does not save the data to the database, but it does record it in the local
  state. The next call to `saveData()` will save the data to the database.
- `recordWindowEvent(type, event_data = null)`: Records a window event. The
  event_data must be Firestore-safe if provided.
- `saveData(force)`: Saves the current data to the database (force save if
  specified). All data must be Firestore-safe.
- `computeCompletionCode()`: Generates a unique completion code by hashing all
  `pageData_*` fields (falls back to `studyData` for backward compatibility).

**Deprecated methods** (still functional but will log warnings):

- `recordForm(name, data)`: Use `recordPageData(data)` instead.
- `recordData(data)`: Use `recordPageData(data)` instead.

### Data Query Methods

These methods provide functionality for querying data across multiple steps in
the experiment.

- `queryStepData(pathFilter = null)`: Gets data for all leaf nodes in the
  stepper, optionally filtered by path pattern. Returns only the data directly
  associated with each leaf node, without merging parent block data.

```javascript
// Get data for all leaf nodes
const allLeafData = api.queryStepData()

// Get data for nodes matching a pattern
const trialData = api.queryStepData('trial/block*')
```

- `queryStepDataLeaf(pathFilter = null)`: Gets data for all leaf nodes in the
  stepper, optionally filtered by path pattern. Returns only the data directly
  associated with each leaf node, without merging parent block data. This is an
  alias for `queryStepData` for consistency with the `stepDataLeaf` getter.

```javascript
// Get data for all leaf nodes
const allLeafData = api.queryStepDataLeaf()

// Get data for nodes matching a pattern
const trialData = api.queryStepDataLeaf('trial/block*')
```

The difference between these methods:

- `queryStepData()` returns the merged data for each leaf node (including parent
  block data)
- `queryStepDataLeaf()` returns only the data directly from each leaf node
  (without parent block data)

Example:

Given a structure:

- block (blockType: 'practice')
  - trial1 (response: 'A')
  - trial2 (response: 'B')

`queryStepData()` returns (merged data):
`[ { blockType: 'practice', response: 'A' }, { blockType: 'practice', response: 'B' }, ]`

`queryStepDataLeaf()` returns (leaf data only):
`[({ response: 'A' }, { response: 'B' })]`
