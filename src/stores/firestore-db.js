import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  addDoc,
  setDoc,
  getDoc,
  Timestamp,
  runTransaction,
  connectFirestoreEmulator,
} from 'firebase/firestore'
import appconfig from '@/config'
import { split } from 'lodash'

// initialize firebase connection
// since this is a module these will run once at the start

const firebaseApp = initializeApp(appconfig.firebaseConfig)
var db

if (appconfig.mode === 'testing') {
  db = getFirestore()
  db._setSettings({ignoreUndefinedProperties: true})
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
  console.warn('WARNING: using local firestore emulator')
} else {
  db = getFirestore(firebaseApp)
  db._setSettings({ignoreUndefinedProperties: true})
}

let mode = 'real'
if (appconfig.mode === 'development' || appconfig.mode === 'testing') {
  mode = 'testing'
}

export const fsnow = () => Timestamp.now()

// create a collection
export const updateSubjectDataRecord = (data, docid) => {
  // is it weird to have a aync method that doesn't return anything?
  try {
    const docRef = doc(db, `${mode}/${appconfig.project_ref}/data/`, docid)
    setDoc(docRef, data, {
      merge: true,
    })
  } catch (e) {
    console.error('Error updating document', e)
  }
}

export const loadDoc = async (docid) => {
  const docRef = doc(db, `${mode}/${appconfig.project_ref}/data/`, docid)
  const docSnap = await getDoc(docRef)
  if (docSnap.exists()) {
    const data = docSnap.data()
    // console.log('Document data:', data)
    return data
  }
  // doc.data() will be undefined in this case
  console.log('No such document!')
  return undefined
}

export const createDoc = async (data, seedid, partnum) => {
  try {
    const expRef = doc(db, mode, appconfig.project_ref)
    await setDoc(
      expRef,
      {
        project_name: appconfig.project_name,
        project_ref: appconfig.project_ref,
        code_name: appconfig.code_name,
        code_name_url: appconfig.code_name_url,
      },
      { merge: true }
    )
    console.log('Document written with ID: ', `${mode}/${appconfig.project_ref}`)

    // Add a new document with a generated id.
    // const docRef = await addDoc(
    //   collection(db, `${mode}/${appconfig.project_ref}/data`),
    //   data
    // )

    // Append the participnt number to the end of the docID -- this should ALWAYS make a unique record
    const fulldocid = `${seedid}-p${partnum}`
    const docRef = doc(db, `${mode}/${appconfig.project_ref}/data`, fulldocid)
    const docSnap = await getDoc(docRef)

    // however, we'll still check to make sure the record doesn't already exist. If it does, we append override, but any additional overrides with same id and participant will overwrite the data
    if (docSnap.exists()) {
      await setDoc(doc(db, `${mode}/${appconfig.project_ref}/data`, `${fulldocid}-override`), data)
      console.log('Document written with ID: ', `${fulldocid}-override`)
      return `${fulldocid}-override`
    }
    // otherwise, we create a document with the specified docID
    await setDoc(doc(db, `${mode}/${appconfig.project_ref}/data`, fulldocid), data)
    console.log('Document written with ID: ', fulldocid)
    return fulldocid
  } catch (e) {
    console.error('Error adding document: ', e)
    return null
  }
}

export const updateExperimentCounter = async (counter) => {
  const docRef = doc(db, `${mode}/${appconfig.project_ref}/counters/`, counter)

  let newCounter = null
  try {
    await runTransaction(db, async (transaction) => {
      const docSnap = await transaction.get(docRef)
      if (!docSnap.exists()) {
        newCounter = 0
      } else {
        newCounter = docSnap.data().n + 1
      }
      transaction.set(docRef, { n: newCounter }, { merge: true })
    })
    console.log('New participant number is: ', newCounter)
  } catch (e) {
    console.log('Transaction failed: ', e)
  }
  return newCounter
}

export const balancedAssignConditions = async (conditionDict, currentConditions) => {
  if (currentConditions.length === 0 && appconfig.mode === 'development') {
    // if there are current conditions and we're in developer mode, we won't assign new ones
    console.log('conditions already set, not assigning new ones in dev mode')
    return currentConditions
  }

  // if the conditionDict is empty, we'll just return an empty list
  if (Object.keys(conditionDict).length === 0) {
    console.log('no conditions to assign')
    return {}
  }

  // function for all possible combinations of N arrays (from https://stackoverflow.com/questions/8936610/how-can-i-create-every-combination-possible-for-the-contents-of-two-arrays)
  const combine = ([head, ...[headTail, ...tailTail]]) => {
    if (!headTail) return head
    const combined = headTail.reduce((acc, x) => acc.concat(head.map((h) => `${h}~${x}`)), [])
    return combine([combined, ...tailTail])
  }

  // Append between-subjects conditions
  const conditionCombos = combine(Object.values(conditionDict))

  // get a docRef for the conditions counter
  const docRef = doc(db, `${mode}/${appconfig.project_ref}/counters/conditions`)

  // make a list of docRefs for each key in keys
  // const docRefs = keys.map((keyCond) => doc(db, `${mode}/${appconfig.project_ref}/counters/`, keyCond))

  try {
    const selectedConditions = await runTransaction(db, async (transaction) => {
      // for docRef, get the data
      const docSnap = await transaction.get(docRef)
      // const docSnaps = await Promise.all(docRefs.map((docRef) => transaction.get(docRef)))

      // see if it exists.
      // If it doesn't, choose a random condition from the list of conditions for that key
      let output

      if (!docSnap.exists()) {
        const newCondCounter = {}
        const conditions = conditionCombos
        const randomIndex = Math.floor(Math.random() * conditions.length)
        const minCondition = conditions[randomIndex]
        // make incremented counter
        conditions.forEach((condition) => {
          newCondCounter[condition] = 0
        })
        newCondCounter[minCondition] += 1
        // return selected condition and new incremented counter
        output = { condName: docSnap.id, selectedCond: minCondition, newCounter: newCondCounter }
      } else {
        //  otherwise, choose the condition with the lowest count
        const conditions = conditionCombos
        const oldCondCounter = docSnap.data()

        // check if the current counter data has all the conditions
        // if there are any missing, we're going to start over everything at zero and choose at random
        const missingConditions = conditions.filter((cond) => !Object.keys(oldCondCounter).includes(cond))
        if (missingConditions.length > 0) {
          const newCondCounter = {}
          const randomIndex = Math.floor(Math.random() * conditions.length)
          const minCondition = conditions[randomIndex]
          // make incremented counter
          conditions.forEach((condition) => {
            newCondCounter[condition] = 0
          })
          newCondCounter[minCondition] += 1
          // return selected condition and new incremented counter
          output = { condName: docSnap.id, selectedCond: minCondition, newCounter: newCondCounter }
        }

        // otherwise, we'll just choose the condition with the lowest count
        else {
          const counts = conditions.map((cond) => oldCondCounter[cond])
          const min = Math.min(...Object.values(counts))
          const matchMinConds = Object.keys(oldCondCounter).filter((key) => oldCondCounter[key] === min)
          // (if there are more than one, pick one at random)
          const minCondition = matchMinConds[Math.floor(Math.random() * matchMinConds.length)]
          oldCondCounter[minCondition] += 1
          output = { condName: docSnap.id, selectedCond: minCondition, newCounter: oldCondCounter }
        }
      }

      // for each entry in output, update firestore with the newCounter and add selected cond to output dict
      const transactionOut = {}
      // no merge, because if any of the conditions change we just want to reset everything
      transaction.set(doc(db, `${mode}/${appconfig.project_ref}/counters/`, output.condName), output.newCounter)
      transactionOut[output.condName] = output.selectedCond

      return transactionOut
    })
    // Split back up into dictionary
    // get keys from conditionDict
    const keys = Object.keys(conditionDict)
    // split condition string based on dash
    const splitConditions = selectedConditions.conditions.split('~')
    // zip keys and splitConditions
    const selectedConditionsDict = Object.fromEntries(keys.map((key, i) => [key, splitConditions[i]]))

    console.log('Conditions set to ', selectedConditionsDict)

    return selectedConditionsDict
  } catch (e) {
    console.error(e)
  }
  return null
}

// export default createDoc
export default db

// const db_type = collection(db, mode) // or should this be collection?

// first get mode (development or live)
// next try to see if a document exists in that collection or not
// if not create one with the name of the experiment
// add code name to the document as well

// setDoc - write if document doesn’t exist, or replace if there is one at that name
// updateDoc - only overwrite fields you specify but error if doesn’t exist
// setDoc(,,{merge: true}) - create document if doesn’t exist, or update if it does
// each as async away or .then()
// addDoc gives you a random reference
// getDoc to read in with document snamshop
//   async function readASingleDocument() {
//     const mySnapshot = await getDoc(specialofthedata)
//     if (mydoc.exists()) {  // if it exists
//         const mydata = mydown.data() // method
//     }
// }
