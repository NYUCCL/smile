# Plan: Refactor Data Recording API to Route-Based Structure

## Summary

Introduce `recordPageData()` method that organizes experiment data by route/page name and visit number (e.g., `pageData_consent.visit_0`, `pageData_trial.visit_1`), deprecate legacy methods (`recordForm`, `recordData`, `studyData`), and update completion code hash generation.

## Key Decisions

- **Field naming**: `pageData_<routeName>` (e.g., `pageData_consent`)
- **Data structure**: Visit-based organization with `visit_N` sub-objects containing `timestamps` and `data` arrays
- **Data aggregation**: Each call appends to the current visit's `timestamps` and `data` arrays
- **Visit tracking**: Visit index determined by counting occurrences in `routeOrder`
- **Hash source**: Collect all `pageData_*` fields and hash them (fallback to `studyData` for backward compat)
- **Deprecation behavior**: Log warning + redirect to new method
- **Firestore validation**: Validate data before recording to catch incompatible types early

## Data Structure Example

```javascript
pageData_trial: {
  visit_0: {  // First visit to this route
    timestamps: [
      1702300000000,  // [0] first recordPageData() call
      1702300001000   // [1] second recordPageData() call
    ],
    data: [
      { response: 'A', rt: 450 },  // [0]
      { response: 'B', rt: 520 }   // [1]
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

The structure provides:

- **Clear visit separation**: Each visit's data is in its own `visit_N` namespace
- **Easier analysis**: Can iterate over visits or access specific visit data directly
- **Self-documenting**: Structure clearly shows which data belongs to which visit
- Within each visit, `timestamps[i]` corresponds to `data[i]`
- Each call to `recordPageData()` appends one timestamp and one data object to the current visit

---

## Implementation Steps

### Step 1: Add `recordPageData` to useAPI.js

**File:** `src/core/composables/useAPI.js`

```javascript
/**
 * Validates data for Firestore compatibility.
 * @param {*} value - The value to validate
 * @param {string} [path=''] - Current path for error messages
 * @returns {{valid: boolean, error: string|null}} Validation result
 * @private
 */
validateFirestoreData(value, path = '') {
  // Check for null/undefined, primitives, unsupported types
  // Check arrays for nested arrays
  // Check objects for invalid keys and recursive validation
}

/**
 * Records data associated with a specific page/route.
 * Data is organized by visit number using visit_N keys (visit_0, visit_1, etc.).
 * @param {Object} data - The data to record (must be an object, not an array)
 * @param {string} [routeName] - Optional route name override
 * @returns {boolean} True on success, false on validation failure
 */
recordPageData(data, routeName = null) {
  const pageName = routeName || this.route.name
  if (!pageName) {
    this.logStore.error('SMILE API: recordPageData() - No route name available')
    return false
  }

  // Validate that data is not an array (would create nested arrays)
  if (Array.isArray(data)) {
    this.logStore.error('SMILE API: recordPageData() - Data cannot be an array...')
    return false
  }

  // Validate Firestore compatibility
  const validation = this.validateFirestoreData(data)
  if (!validation.valid) {
    this.logStore.error(`SMILE API: recordPageData() - Invalid data: ${validation.error}`)
    return false
  }

  const fieldName = `pageData_${pageName}`

  // Calculate current visit index from routeOrder
  const visitCount = this.store.data.routeOrder
    ? this.store.data.routeOrder.filter((entry) => entry.route === pageName).length
    : 0
  const currentVisitIndex = Math.max(0, visitCount - 1)
  const visitKey = `visit_${currentVisitIndex}`

  // Initialize pageData field if it doesn't exist
  if (!this.store.data[fieldName]) {
    this.store.data[fieldName] = {}
  }

  // Initialize visit structure if it doesn't exist
  if (!this.store.data[fieldName][visitKey]) {
    this.store.data[fieldName][visitKey] = {
      timestamps: [],
      data: [],
    }
  }

  // Append timestamp and data to the current visit
  this.store.data[fieldName][visitKey].timestamps.push(Date.now())
  this.store.data[fieldName][visitKey].data.push(JSON.parse(JSON.stringify(data)))

  this.logStore.debug(`SMILE API: recordPageData() recorded to ${fieldName}.${visitKey}`, data)

  return true
}
```

### Step 2: Add store helper for pageData fields

**File:** `src/core/stores/smilestore.js`

Add getter:

```javascript
getAllPageData: (state) => {
  const pageDataFields = {}
  for (const key in state.data) {
    if (key.startsWith('pageData_')) {
      pageDataFields[key] = state.data[key]
    }
  }
  return pageDataFields
},
```

### Step 3: Add deprecation warnings to old methods

**File:** `src/core/composables/useAPI.js`

Modify `recordForm`:

```javascript
recordForm(name, data) {
  this.logStore.warn(
    'SMILE API: recordForm() is deprecated. Use recordPageData() instead.'
  )
  this.store.recordProperty(name, data)  // Keep for backward compat
  this.recordPageData(data)              // Also record to new format
}
```

Modify `recordData`:

```javascript
recordData(data) {
  this.logStore.warn(
    'SMILE API: recordData() is deprecated. Use recordPageData() instead.'
  )
  this.store.data.trialNum += 1
  this.store.recordData(data)  // Keep for backward compat
  this.recordPageData(data)    // Also record to new format
}
```

### Step 4: Add `computeCompletionCode` to useAPI.js

**File:** `src/core/composables/useAPI.js`

```javascript
/**
 * Computes a unique completion code based on study data.
 * Creates a hash of all pageData_* fields and appends status indicators.
 * Falls back to studyData for backward compatibility if no pageData fields exist.
 *
 * @returns {string} A unique completion code with status suffix
 */
computeCompletionCode() {
  // Collect all pageData_* fields
  const pageDataFields = {}
  for (const key in this.store.data) {
    if (key.startsWith('pageData_')) {
      pageDataFields[key] = this.store.data[key]
    }
  }

  // Use pageData if available, fallback to studyData for backward compat
  let dataToHash
  if (Object.keys(pageDataFields).length > 0) {
    dataToHash = stringify(pageDataFields)
  } else {
    dataToHash = stringify(this.store.data.studyData)
  }

  const hashDigest = Base64url.stringify(sha256(dataToHash))

  const codes = { withdrew: 'xx', completed: 'oo' }
  let endCode = ''
  if (this.store.browserPersisted.withdrawn) {
    endCode = codes['withdrew']
  } else if (this.store.browserPersisted.done) {
    endCode = codes['completed']
  }
  return hashDigest.slice(0, 20) + endCode
}
```

**Also add imports to useAPI.js:**

```javascript
import sha256 from 'crypto-js/sha256'
import Base64url from 'crypto-js/enc-base64'
import stringify from 'json-stable-stringify'
```

### Step 5: Simplify ThanksView.vue

**File:** `src/builtins/thanks/ThanksView.vue`

Remove the local `computeCompletionCode` function and imports, use API instead:

```javascript
// Remove these imports:
// import sha256 from 'crypto-js/sha256'
// import Base64url from 'crypto-js/enc-base64'
// import stringify from 'json-stable-stringify'

// Replace local function call with:
const completionCode = api.computeCompletionCode()
api.setCompletionCode(completionCode)
```

### Step 6: Update useViewAPI.js

**File:** `src/core/composables/useViewAPI.js`

```javascript
recordStep() {
  this.recordPageData(this.stepData)
}
```

### Step 7: Update documentation

**File:** `docs/api.md`

- Document `recordPageData()` with visit-based structure and validation requirements
- Document `computeCompletionCode()`
- Mark `recordForm`, `recordData` as deprecated

---

## Files Modified

| File                                                         | Changes                                                                                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `src/core/composables/useAPI.js`                             | Add `validateFirestoreData`, `recordPageData`, `computeCompletionCode`, deprecate `recordForm`/`recordData`, add crypto imports |
| `src/core/stores/smilestore.js`                              | Add `getAllPageData` getter                                                                                                     |
| `src/builtins/thanks/ThanksView.vue`                         | Simplify to use `api.computeCompletionCode()`, remove crypto imports                                                            |
| `src/core/composables/useViewAPI.js`                         | Update `recordStep` to use new method                                                                                           |
| `src/builtins/deviceSurvey/DeviceSurveyView.vue`             | Update to use `recordPageData`                                                                                                  |
| `src/builtins/demographicSurvey/DemographicSurveyView.vue`   | Update to use `recordPageData`                                                                                                  |
| `src/builtins/taskFeedbackSurvey/TaskFeedbackSurveyView.vue` | Update to use `recordPageData`                                                                                                  |
| `src/builtins/instructionsQuiz/InstructionsQuiz.vue`         | Update to use `recordPageData`                                                                                                  |
| `src/builtins/demoTasks/FavoriteColor.vue`                   | Update to use `recordPageData`                                                                                                  |
| `src/builtins/demoTasks/FavoriteNumber.vue`                  | Update to use `recordPageData`                                                                                                  |
| `tests/vitest/core/composables/useAPI.test.js`               | Add tests for `recordPageData`, `computeCompletionCode`, validation, and deprecation warnings                                   |
| `tests/vitest/core/composables/useViewAPI.test.js`           | Update `recordStep` test                                                                                                        |
| `docs/api.md`                                                | Document new API, validation requirements, deprecation notes                                                                    |
| `docs/coding/autofill.md`                                    | Update examples to use `recordPageData`                                                                                         |
| `docs/styling/forms.md`                                      | Update examples to use `recordPageData`                                                                                         |

---

## Firestore Validation

`recordPageData` validates data before recording:

1. **Top-level arrays rejected** - Would create nested arrays in `data: [...]`
2. **Nested arrays rejected** - e.g., `[[1,2], [3,4]]`
3. **Functions/Symbols rejected** - Not Firestore-compatible
4. **Invalid keys rejected** - Keys containing `.`, `/`, `[`, `]`, or `*`

Returns `false` on validation failure with descriptive error logged.

---

## Edge Cases Handled

1. **No route name** → Log error, return `false`
2. **Array passed as data** → Log error, return `false` (prevents nested arrays)
3. **Invalid Firestore data** → Log error with path info, return `false`
4. **First visit, first call** → Creates `pageData_<route>.visit_0` with one entry
5. **First visit, multiple calls** → Appends to `visit_0.timestamps` and `visit_0.data`
6. **Second visit** → Creates `visit_1` structure, leaves `visit_0` unchanged
7. **No routeOrder entries** → Defaults to `visit_0`
8. **Explicit routeName** → Uses provided name instead of current route
9. **No pageData fields** → Hash falls back to `studyData` for backward compat
10. **Both withdrawn and done** → Withdrawn takes priority (`xx` suffix)

---

## Backward Compatibility

- `computeCompletionCode()` - Hashes all `pageData_*` fields, works with visit-based structure
- `getAllPageData` getter - Returns all `pageData_*` fields regardless of internal structure
- Deprecated methods (`recordForm`, `recordData`) - Continue to work, now recording to visit-based structure

---

## Test Coverage

**33 tests in `useAPI.test.js`** covering:

### recordPageData tests

- Creates correct `visit_0` structure
- Appends to same visit on multiple calls
- Creates new `visit_N` structure on revisit
- Uses explicit routeName parameter
- Logs error when no route name
- Rejects arrays at top level
- Rejects nested arrays
- Rejects functions
- Rejects invalid key names
- Allows valid nested objects with arrays of primitives
- Returns true/false appropriately

### computeCompletionCode tests

- Generates code from pageData fields
- Falls back to studyData
- Appends status suffix (oo/xx)
- Is deterministic
- Different data produces different codes
- Correct code length (20 or 22)
- Handles empty data
- Prefers pageData over studyData
- Includes all pageData fields in hash
- Prioritizes withdrawn over done

### Deprecated method tests

- recordForm logs warning
- recordData logs warning
- Still records to old format for backward compat
