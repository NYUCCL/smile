/**
 * Firebase/Firestore database configuration and utility functions.
 * Provides functionality for:
 * - Firebase/Firestore initialization and configuration
 * - Authentication utilities
 * - Database operations (read/write)
 * - Timestamp management
 *
 * This module handles:
 * - Setting up Firebase/Firestore connections
 * - Managing authentication state
 * - Providing database operation utilities
 * - Supporting both production and testing environments
 *
 * @module firestore-db
 * @description Core Firebase/Firestore database functionality for the application
 */

import { initializeApp } from 'firebase/app'
import { getAuth, signInAnonymously } from 'firebase/auth'
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  getDoc,
  Timestamp,
  serverTimestamp,
  connectFirestoreEmulator,
} from 'firebase/firestore'
import appconfig from '@/core/config'
import useLog from '@/core/stores/log'

// Initialize Firebase connection
const firebaseApp = initializeApp(appconfig.firebaseConfig)
const auth = getAuth(firebaseApp)
let db

if (appconfig.mode === 'testing') {
  db = getFirestore()
  db._setSettings({ ignoreUndefinedProperties: true })
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
  console.warn('WARNING: using local firestore emulator')
} else {
  db = getFirestore(firebaseApp)
  db._setSettings({ ignoreUndefinedProperties: true })
}

let mode = 'real'
if (appconfig.mode === 'development' || appconfig.mode === 'testing') {
  mode = 'testing'
}

/**
 * Get current Firestore timestamp
 * @returns {Timestamp} Current Firestore timestamp
 */
export const fsnow = () => Timestamp.now()

/**
 * Authenticate anonymously with Firebase
 * @returns {Promise<Object|null>} Firebase user object if successful, null if failed
 */
export const anonymousAuth = async () => {
  const log = useLog()
  try {
    const userCredential = await signInAnonymously(auth)
    log.log('FIRESTORE-DB: Anonymous auth successful')
    return userCredential.user
  } catch (error) {
    log.error('FIRESTORE-DB: Error in anonymous authentication:', error)
    return null
  }
}

/**
 * Validates data structure for Firestore compatibility
 * @param {*} data - Data to validate
 * @param {string} [path=''] - Current path in object for error reporting
 * @returns {boolean} True if valid
 * @throws {Error} If data structure is invalid for Firestore
 */
const validateFirestoreData = (data, path = '') => {
  // Check if value is null or undefined
  if (data === null || data === undefined) {
    return true
  }

  // Check data type
  if (
    typeof data === 'string' ||
    typeof data === 'number' ||
    typeof data === 'boolean' ||
    data instanceof Date ||
    (typeof data === 'object' && 'seconds' in data && 'nanoseconds' in data) // Check for Timestamp-like object
  ) {
    return true
  }

  // Check arrays
  if (Array.isArray(data)) {
    // Empty arrays are valid
    if (data.length === 0) {
      return true
    }
    for (let i = 0; i < data.length; i++) {
      if (Array.isArray(data[i])) {
        throw new Error(`Nested arrays are not allowed in Firestore at path: ${path}[${i}]`)
      }
      validateFirestoreData(data[i], `${path}[${i}]`)
    }
    return true
  }

  // Check objects
  if (typeof data === 'object') {
    // Empty objects are valid
    if (Object.keys(data).length === 0) {
      return true
    }
    for (const [key, value] of Object.entries(data)) {
      if (/[\.\/\[\]\*]/.test(key)) {
        throw new Error(`Invalid key name "${key}" at path: ${path}. Keys cannot contain ".", "/", "[", "]", or "*"`)
      }

      if (value instanceof Function || value instanceof Symbol) {
        throw new Error(`Unsupported data type for key "${key}" at path: ${path}. Value type: ${typeof value}`)
      }

      validateFirestoreData(value, path ? `${path}.${key}` : key)
    }
    return true
  }

  throw new Error(`Unsupported data type at path: ${path}. Value type: ${typeof data}`)
}

/**
 * Updates a subject's data record
 * @param {Object} data - Data to update
 * @param {string} docid - Document ID
 * @returns {Promise<void>}
 * @throws {Error} If update fails
 */
export const updateSubjectDataRecord = async (data, docid) => {
  const log = useLog()
  try {
    validateFirestoreData(data)
    const docRef = doc(db, `${mode}/${appconfig.projectRef}/data/`, docid)
    await setDoc(docRef, { ...data, lastUpdated: serverTimestamp() }, { merge: true })

    // Also update the parent project document's lastUpdated field
    const projectRef = doc(db, mode, appconfig.projectRef)
    await setDoc(projectRef, { lastUpdated: serverTimestamp() }, { merge: true })
  } catch (e) {
    log.error('FIRESTORE-DB: Error updating document:', e.message)
    throw e // Re-throw to allow caller to handle the error
  }
}

/**
 * Updates a subject's private data record
 * @param {Object} data - Private data to update
 * @param {string} docid - Document ID
 * @returns {Promise<void>}
 * @throws {Error} If update fails
 */
export const updatePrivateSubjectDataRecord = async (data, docid) => {
  const log = useLog()
  // is it weird to have a aync method that doesn't return anything?
  try {
    const docRef = doc(db, `${mode}/${appconfig.projectRef}/data/${docid}/private/`, 'private_data')
    await setDoc(docRef, { ...data, lastUpdated: serverTimestamp() }, {
      merge: true,
    })

    // Also update the parent project document's lastUpdated field
    const projectRef = doc(db, mode, appconfig.projectRef)
    await setDoc(projectRef, { lastUpdated: serverTimestamp() }, { merge: true })
  } catch (e) {
    log.error('FIRESTORE-DB: Error updating private document', e)
    throw e
  }
}

/**
 * Loads a document by ID
 * @param {string} docid - Document ID to load
 * @returns {Promise<Object|undefined>} Document data if found and authorized, undefined otherwise
 */
export const loadDoc = async (docid) => {
  const log = useLog()

  try {
    const user = await anonymousAuth()
    if (!user) throw new Error('Authentication failed')

    const docRef = doc(db, `${mode}/${appconfig.projectRef}/data/`, docid)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const data = docSnap.data()
      // console.log('Document data:', data)
      if (data.firebaseAnonAuthID === user.uid) {
        return data
      } else {
        log.error('FIRESTORE-DB: User does not have access to this document')
        return undefined
      }
    }
    log.error('FIRESTORE-DB: No such document!')
    return undefined
  } catch (e) {
    log.error('FIRESTORE-DB: Error updating document', e)
    return undefined
  }
}

/**
 * Creates a new document
 * @param {Object} data - Data to store in new document
 * @returns {Promise<string|null>} Document ID if created successfully, null if failed
 */
export const createDoc = async (data) => {
  const log = useLog()
  try {
    const user = await anonymousAuth()
    if (!user) throw new Error('Authentication failed')

    validateFirestoreData(data)

    log.log(`FIRESTORE-DB: trying to create a main document.`, appconfig.projectRef)

    const expRef = doc(db, mode, appconfig.projectRef)
    // Check if document exists first
    const docSnap = await getDoc(expRef)
    if (!docSnap.exists()) {
      await setDoc(expRef, {
        projectName: appconfig.projectName,
        projectRef: appconfig.projectRef,
        codeName: appconfig.codeName,
        codeNameURL: appconfig.codeNameURL,
        lastUpdated: serverTimestamp(),
      })
      log.log('FIRESTORE-DB: New experiment registered with ID: ', `${mode}/${appconfig.projectRef}`)
    }

    log.log(`FIRESTORE-DB: trying to create a main document.`, appconfig.projectRef)

    // Add a new document with a generated id.
    const docRef = await addDoc(collection(db, `${mode}/${appconfig.projectRef}/data`), {
      ...data,
      firebaseAnonAuthID: user.uid,
      lastUpdated: serverTimestamp(),
    })

    // Update the document with its own ID
    await updateDoc(docRef, {
      firebaseDocID: docRef.id,
      lastUpdated: serverTimestamp(),
    })

    data.firebaseAnonAuthID = user.uid
    log.log(`FIRESTORE-DB: New document written with ID: ${docRef.id} for user ${user.uid})`)
    return docRef.id
  } catch (e) {
    log.error('FIRESTORE-DB: Error creating document:', e.message)
    return null
  }
}

/**
 * Creates a private document
 * @param {Object} data - Private data to store
 * @param {string} docId - Parent document ID
 * @returns {Promise<string|null>} Document ID if created successfully, null if failed
 */
export const createPrivateDoc = async (data, docId) => {
  const log = useLog()
  log.log(`FIRESTORE-DB: trying to create a private document in ${docId}`)
  try {
    const user = await anonymousAuth()
    if (!user) throw new Error('Authentication failed')

    validateFirestoreData(data)
    // Add a new document with a generated id.
    const docRef = doc(db, `${mode}/${appconfig.projectRef}/data/${docId}/private/`, 'private_data')
    await setDoc(docRef, {
      ...data,
      firebaseAnonAuthID: user.uid,
      lastUpdated: serverTimestamp(),
    })

    // Also update the parent project document's lastUpdated field
    const projectRef = doc(db, mode, appconfig.projectRef)
    await setDoc(projectRef, { lastUpdated: serverTimestamp() }, { merge: true })

    log.log(`FIRESTORE-DB: Private document written with ID: `, docRef.id)
    return docRef.id
  } catch (e) {
    log.error('FIRESTORE-DB: Error adding private document: ', e)
    return null
  }
}

export default db

// const db_type = collection(db, mode) // or should this be collection?

// first get mode (development or live)
// next try to see if a document exists in that collection or not
// if not create one with the name of the experiment
// add code name to the document as well

// setDoc - write if document doesn't exist, or replace if there is one at that name
// updateDoc - only overwrite fields you specify but error if doesn't exist
// setDoc(,,{merge: true}) - create document if doesn't exist, or update if it does
// each as async away or .then()
// addDoc gives you a random reference
// getDoc to read in with document snamshop
//   async function readASingleDocument() {
//     const mySnapshot = await getDoc(specialofthedata)
//     if (mydoc.exists()) {  // if it exists
//         const mydata = mydown.data() // method
//     }
// }
