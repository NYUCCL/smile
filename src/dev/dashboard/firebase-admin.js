/**
 * Firebase utilities for dashboard data browsing
 * Uses Firebase SDK with authentication to work within security rules
 */

import { initializeApp } from 'firebase/app'
import { getAuth, signInAnonymously } from 'firebase/auth'
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  query,
  limit,
  orderBy,
  startAfter,
  connectFirestoreEmulator,
} from 'firebase/firestore'
import appconfig from '@/core/config'

// Initialize Firebase connection
const firebaseApp = initializeApp(appconfig.firebaseConfig)
const auth = getAuth(firebaseApp)
let db

if (appconfig.mode === 'testing') {
  db = getFirestore()
  try {
    connectFirestoreEmulator(db, '127.0.0.1', 8080)
    console.warn('WARNING: using local firestore emulator')
  } catch (error) {
    console.log('Emulator already connected or not available')
  }
} else {
  db = getFirestore(firebaseApp)
}

let currentUser = null

/**
 * Ensures user is authenticated with admin privileges
 * @returns {Promise<Object>} Firebase user object
 */
async function ensureAuthenticated() {
  if (!currentUser) {
    try {
      const userCredential = await signInAnonymously(auth)
      currentUser = userCredential.user
      console.log('Dashboard authenticated with UID:', currentUser.uid)
      console.log('Admin access enabled via Firebase rules (development mode)')
    } catch (error) {
      console.error('Authentication failed:', error)
      throw new Error('Failed to authenticate with Firebase')
    }
  }
  return currentUser
}

/**
 * Lists documents in a collection with pagination
 * @param {string} collectionPath - Path to collection
 * @param {number} limitCount - Number of documents to fetch (default 25)
 * @param {Object} lastDoc - Last document for pagination (optional)
 * @returns {Promise<Object>} Object with documents array and pagination info
 */
export async function listDocuments(collectionPath, limitCount = 25, lastDoc = null) {
  try {
    await ensureAuthenticated()
    
    const collectionRef = collection(db, collectionPath)
    
    // Build query with pagination (no ordering to include all documents)
    let q = query(
      collectionRef,
      limit(limitCount)
    )
    
    // Add pagination if lastDoc provided
    if (lastDoc) {
      q = query(
        collectionRef,
        startAfter(lastDoc),
        limit(limitCount)
      )
    }
    
    const querySnapshot = await getDocs(q)
    
    const documents = []
    let lastDocument = null
    
    querySnapshot.forEach((doc) => {
      const docData = {
        id: doc.id,
        data: doc.data(),
        ref: doc.ref,
        docSnapshot: doc // Store for pagination
      }
      documents.push(docData)
      lastDocument = doc // Keep track of last document
    })
    
    // Sort documents client-side by appStartTime (newest first)
    documents.sort((a, b) => {
      const aStartTime = a.data.appStartTime
      const bStartTime = b.data.appStartTime
      
      if (aStartTime && bStartTime) {
        // Both have appStartTime, sort by timestamp (newest first)
        return bStartTime - aStartTime
      } else if (aStartTime && !bStartTime) {
        // a has appStartTime, b doesn't - a comes first
        return -1
      } else if (!aStartTime && bStartTime) {
        // b has appStartTime, a doesn't - b comes first
        return 1
      } else {
        // Neither has appStartTime, sort by document ID
        return b.id.localeCompare(a.id)
      }
    })
    
    console.log(`Fetched ${documents.length} documents from ${collectionPath} (limit: ${limitCount})`)
    
    return {
      documents,
      lastDocument,
      hasMore: documents.length === limitCount, // Assume more if we got full limit
      totalFetched: documents.length
    }
  } catch (error) {
    console.error('Error listing documents:', error)
    return {
      documents: [],
      lastDocument: null,
      hasMore: false,
      totalFetched: 0
    }
  }
}

/**
 * Lists documents with same functionality as listDocuments
 * The cost savings come from limiting to 10 documents instead of 25+
 * @param {string} collectionPath - Path to collection
 * @param {number} limitCount - Number of documents to fetch (default 25)
 * @param {Object} lastDoc - Last document for pagination (optional)
 * @returns {Promise<Object>} Object with documents array and pagination info
 */
export async function listDocumentsMetadata(collectionPath, limitCount = 25, lastDoc = null) {
  // Use the same implementation as listDocuments for now
  // The primary cost savings come from limiting to 10 documents
  return await listDocuments(collectionPath, limitCount, lastDoc)
}

/**
 * Gets total count of documents in a collection (efficient)
 * @param {string} collectionPath - Path to collection
 * @returns {Promise<number>} Document count
 */
export async function getDocumentCount(collectionPath) {
  try {
    await ensureAuthenticated()
    
    const collectionRef = collection(db, collectionPath)
    // Use a minimal query to get count efficiently
    const querySnapshot = await getDocs(query(collectionRef, limit(1000)))
    
    let count = 0
    querySnapshot.forEach(() => count++)
    
    // If we got 1000, there might be more (this is approximate)
    if (count === 1000) {
      console.log(`Document count for ${collectionPath}: 1000+ (approximate)`)
      return '1000+'
    }
    
    console.log(`Document count for ${collectionPath}: ${count}`)
    return count
  } catch (error) {
    console.error('Error getting document count:', error)
    return 0
  }
}

/**
 * Gets a specific document
 * @param {string} documentPath - Full path to document
 * @returns {Promise<Object|null>} Document data or null if not found
 */
export async function getDocument(documentPath) {
  try {
    await ensureAuthenticated()
    
    const docRef = doc(db, documentPath)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        data: docSnap.data(),
        ref: docSnap.ref
      }
    }
    return null
  } catch (error) {
    console.error('Error getting document:', error)
    return null
  }
}

/**
 * Gets the current project's data collection info
 * @returns {Promise<Array>} Array with current project collection info
 */
export async function listStudyCollections() {
  try {
    await ensureAuthenticated()
    
    const mode = appconfig.mode === 'production' ? 'real' : 'testing'
    const projectRef = appconfig.projectRef
    
    // Check if the project document exists
    const projectDocPath = `${mode}/${projectRef}`
    const projectDoc = await getDocument(projectDocPath)
    
    if (projectDoc) {
      console.log(`Found current project: ${projectRef} in ${mode} mode`)
      return [{
        id: projectRef,
        path: projectDocPath,
        name: projectDoc.data.projectName || projectRef,
        type: 'current-project',
        data: projectDoc.data,
        dataPath: `${projectDocPath}/data`
      }]
    } else {
      console.log(`Project ${projectRef} not found, creating placeholder`)
      // Return placeholder for current project even if document doesn't exist yet
      return [{
        id: projectRef,
        path: projectDocPath,
        name: appconfig.projectName || projectRef,
        type: 'current-project',
        data: {
          projectName: appconfig.projectName,
          projectRef: projectRef,
          codeName: appconfig.codeName
        },
        dataPath: `${projectDocPath}/data`
      }]
    }
  } catch (error) {
    console.error('Error getting current project info:', error)
    return []
  }
}

/**
 * Lists ALL data documents in the current project (admin access)
 * @param {string} projectId - Project ID (should match current project)
 * @returns {Promise<Array>} Array of all data documents
 */
export async function listAllDataDocuments(projectId = null) {
  try {
    await ensureAuthenticated()
    const mode = appconfig.mode === 'production' ? 'real' : 'testing'
    const projectRef = projectId || appconfig.projectRef
    
    // Use the same path structure as the main app: mode/projectRef/data
    const dataCollectionPath = `${mode}/${projectRef}/data`
    const documents = await listDocuments(dataCollectionPath)
    
    console.log(`Found ${documents.length} total documents in ${dataCollectionPath}`)
    return documents
  } catch (error) {
    console.error('Error listing all data documents:', error)
    return []
  }
}

/**
 * Gets admin dashboard information for the current project
 * @returns {Promise<Object>} Admin info and data summary
 */
export async function getAdminInfo() {
  try {
    const user = await ensureAuthenticated()
    const mode = appconfig.mode === 'production' ? 'real' : 'testing'
    const projectRef = appconfig.projectRef
    
    // Get current project info
    const projectInfo = await listStudyCollections()
    const currentProject = projectInfo[0] // Should only be one project
    
    if (currentProject) {
      // Get ALL data documents for current project (admin access)
      const allDocs = await listAllDataDocuments()
      
      // Group documents by user
      const userGroups = {}
      allDocs.forEach(doc => {
        const uid = doc.data.firebaseAnonAuthID || 'unknown'
        if (!userGroups[uid]) {
          userGroups[uid] = []
        }
        userGroups[uid].push(doc)
      })
      
      const projectWithData = {
        ...currentProject,
        totalDataCount: allDocs.length,
        uniqueUsers: Object.keys(userGroups).length,
        userGroups: userGroups,
        hasData: allDocs.length > 0
      }
      
      return {
        user: {
          uid: user.uid,
          isAnonymous: user.isAnonymous,
          isAdmin: true
        },
        mode: mode,
        projectRef: projectRef,
        currentProject: projectWithData,
        studies: [projectWithData], // Keep studies array for compatibility
        totalStudies: 1,
        studiesWithData: projectWithData.hasData ? 1 : 0,
        totalDocuments: allDocs.length,
        totalUsers: Object.keys(userGroups).length
      }
    } else {
      return {
        user: {
          uid: user.uid,
          isAnonymous: user.isAnonymous,
          isAdmin: true
        },
        mode: mode,
        projectRef: projectRef,
        currentProject: null,
        studies: [],
        totalStudies: 0,
        studiesWithData: 0,
        totalDocuments: 0,
        totalUsers: 0
      }
    }
  } catch (error) {
    console.error('Error getting admin info:', error)
    return null
  }
}

/**
 * Lists subcollections of a document (limited functionality with SDK)
 * @param {string} documentPath - Path to parent document
 * @returns {Promise<Array>} Array of known subcollection names
 */
export async function listSubcollections(documentPath) {
  try {
    await ensureAuthenticated()
    
    // Since Firebase client SDK doesn't support listing subcollections,
    // we return known subcollection patterns based on your app structure
    const knownSubcollections = []
    
    // Check if this is a data document that might have private subcollection
    if (documentPath.includes('/data/')) {
      knownSubcollections.push('private')
    }
    
    console.log(`Known subcollections for ${documentPath}:`, knownSubcollections)
    return knownSubcollections
  } catch (error) {
    console.error('Error listing subcollections:', error)
    return []
  }
}

/**
 * Parses Firestore document data (already parsed by SDK)
 * @param {Object} data - Document data
 * @returns {Object} The same data (for compatibility)
 */
export function parseFirestoreFields(data) {
  // Firebase SDK already parses the data, so just return it
  return data || {}
}

// Keep the old function name for backwards compatibility
export const listUserDataDocuments = listAllDataDocuments
export const getUserInfo = getAdminInfo

// For backwards compatibility, alias the main function
export const getRootCollections = listStudyCollections

/**
 * Saves notes and tags for a document
 * @param {string} documentPath - Path to the original document
 * @param {Array} tags - Array of tag strings
 * @param {string} notes - Notes text
 * @returns {Promise<boolean>} Success status
 */
export async function saveDocumentNotes(documentPath, tags = [], notes = '') {
  try {
    await ensureAuthenticated()
    
    console.log('🔍 Attempting to save notes:', {
      documentPath,
      tags,
      notes,
      currentUserUID: currentUser?.uid
    })
    
    // Create notes document path - store in a 'notes' subcollection
    const notesPath = `${documentPath}/notes/annotations`
    const notesDocRef = doc(db, notesPath)
    
    console.log('🔍 Saving to path:', notesPath)
    
    const notesData = {
      tags: tags,
      notes: notes,
      lastModified: new Date(),
      modifiedBy: currentUser?.uid || 'anonymous'
    }
    
    await setDoc(notesDocRef, notesData)
    console.log('Saved notes to:', notesPath, notesData)
    return true
  } catch (error) {
    console.error('Error saving notes to:', notesPath)
    console.error('Error details:', error)
    console.error('Current user UID:', currentUser?.uid)
    console.error('Notes data:', notesData)
    
    // Help identify the admin UID for the rules
    if (error.code === 'permission-denied') {
      console.error('🔥 PERMISSION DENIED - Add this UID to Firebase rules as admin:')
      console.error(`🔥 "${currentUser?.uid}"`)
      console.error('🔥 Update firebase/firebase.rules and replace "YOUR_ADMIN_UID_HERE" with the UID above')
      console.error('🔥 Failed path:', notesPath)
    }
    
    return false
  }
}

/**
 * Loads notes and tags for a document
 * @param {string} documentPath - Path to the original document
 * @returns {Promise<Object>} Object with tags and notes
 */
export async function loadDocumentNotes(documentPath) {
  try {
    await ensureAuthenticated()
    
    // Load notes document from 'notes' subcollection
    const notesPath = `${documentPath}/notes/annotations`
    const notesDocRef = doc(db, notesPath)
    const notesSnap = await getDoc(notesDocRef)
    
    if (notesSnap.exists()) {
      const data = notesSnap.data()
      return {
        tags: data.tags || [],
        notes: data.notes || '',
        lastModified: data.lastModified,
        modifiedBy: data.modifiedBy
      }
    } else {
      return {
        tags: [],
        notes: '',
        lastModified: null,
        modifiedBy: null
      }
    }
  } catch (error) {
    console.error('Error loading notes:', error)
    return {
      tags: [],
      notes: '',
      lastModified: null,
      modifiedBy: null
    }
  }
}

/**
 * Loads IP addresses for all documents in a collection to check for duplicates
 * @param {string} mode - 'testing' or 'real'
 * @param {string} projectRef - Project reference
 * @returns {Promise<Map>} Map of documentId -> IP address
 */
export async function loadAllIpAddresses(mode, projectRef) {
  try {
    await ensureAuthenticated()
    
    // Get all documents in the collection
    const dataCollectionPath = `${mode}/${projectRef}/data`
    const allDocs = await listDocuments(dataCollectionPath)
    
    console.log(`Loading IP addresses for ${allDocs.length} documents`)
    
    const ipMap = new Map()
    
    // Load private data for each document to get IP addresses
    const loadPromises = allDocs.map(async (docData) => {
      try {
        const privateDataPath = `${dataCollectionPath}/${docData.id}/private/private_data`
        const privateDoc = await getDocument(privateDataPath)
        
        if (privateDoc && privateDoc.data && privateDoc.data.browserFingerprint && privateDoc.data.browserFingerprint.ip) {
          const parsedPrivateData = parseFirestoreFields(privateDoc.data)
          const ip = parsedPrivateData.browserFingerprint?.ip
          if (ip) {
            ipMap.set(docData.id, ip)
          }
        }
      } catch (error) {
        // Silently handle missing private data - not all documents may have it
        console.debug(`No private data for ${docData.id}:`, error.message)
      }
    })
    
    await Promise.all(loadPromises)
    console.log(`Loaded IP addresses for ${ipMap.size} documents`)
    return ipMap
    
  } catch (error) {
    console.error('Error loading IP addresses:', error)
    return new Map()
  }
}