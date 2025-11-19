import { describe, it, expect, vi, beforeEach } from 'vitest'

const VERBOSE = false
// Mock Firebase modules
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({
    // Mock firebase app instance
  })),
}))

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({
    // Mock auth instance
  })),
  signInAnonymously: vi.fn(),
}))

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({
    _setSettings: vi.fn(),
  })),
  collection: vi.fn(),
  doc: vi.fn(),
  addDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  getDoc: vi.fn(),
  Timestamp: {
    now: vi.fn(() => ({ seconds: 1234567890, nanoseconds: 123456789 })),
  },
  serverTimestamp: vi.fn(() => ({ seconds: 1234567890, nanoseconds: 123456789 })),
  connectFirestoreEmulator: vi.fn(),
}))

vi.mock('@/core/config', () => ({
  default: {
    mode: 'production',
    projectRef: 'test-project',
    projectName: 'Test Project',
    codeName: 'test-code',
    codeNameURL: 'test-url',
    firebaseConfig: {
      // Mock firebase config
    },
  },
}))

vi.mock('@/core/stores/log', () => ({
  default: () => ({
    log: (...args) => {
      if (VERBOSE) console.log('LOG:', ...args)
      return vi.fn()
    },
    error: (...args) => {
      if (VERBOSE) console.error('ERROR:', ...args)
      return vi.fn()
    },
  }),
}))

import {
  anonymousAuth,
  createDoc,
  createPrivateDoc,
  loadDoc,
  updateSubjectDataRecord,
  updatePrivateSubjectDataRecord,
  fsnow,
} from '@/core/stores/firestore-db'

import { signInAnonymously } from 'firebase/auth'

import { getDoc, addDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore'

describe('firestore-db', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks()
  })

  describe('anonymousAuth', () => {
    it('should successfully authenticate anonymously', async () => {
      const mockUser = {
        uid: 'test-uid',
        emailVerified: false,
        isAnonymous: true,
        metadata: {},
        providerData: [],
      }
      const mockCredential = {
        user: mockUser,
        providerId: 'anonymous',
        operationType: 'signIn',
      }
      vi.mocked(signInAnonymously).mockResolvedValueOnce(mockCredential)

      const result = await anonymousAuth()
      expect(result).toEqual(mockUser)
      expect(signInAnonymously).toHaveBeenCalled()
    })

    it('should handle authentication failure', async () => {
      vi.mocked(signInAnonymously).mockRejectedValueOnce(new Error('Auth failed'))

      const result = await anonymousAuth()
      expect(result).toBeNull()
    })
  })

  describe('createDoc', () => {
    it('should create a new document successfully', async () => {
      const mockUser = {
        uid: 'test-uid',
        emailVerified: false,
        isAnonymous: true,
        metadata: {},
        providerData: [],
      }
      const mockCredential = {
        user: mockUser,
        providerId: 'anonymous',
        operationType: 'signIn',
      }
      const mockDocId = 'test-doc-id'
      const mockData = { field: 'value' }

      vi.mocked(signInAnonymously).mockResolvedValueOnce(mockCredential)

      const mockMetadata = {
        hasPendingWrites: false,
        fromCache: false,
        isEqual: () => false,
      }

      const mockDocSnapshot = {
        exists: () => false,
        metadata: mockMetadata,
        ref: {},
        id: mockDocId,
        get: () => undefined,
      }

      vi.mocked(getDoc).mockResolvedValueOnce(mockDocSnapshot)

      const mockDocRef = {
        id: mockDocId,
        path: `test/${mockDocId}`,
      }
      vi.mocked(addDoc).mockResolvedValueOnce(mockDocRef)

      const result = await createDoc(mockData)

      expect(result).toBe(mockDocId)
      expect(addDoc).toHaveBeenCalled()
      expect(updateDoc).toHaveBeenCalled()
    })
  })

  describe('loadDoc', () => {
    it('should load an existing document for authorized user', async () => {
      const mockUser = {
        uid: 'test-uid',
        emailVerified: false,
        isAnonymous: true,
        metadata: {},
        providerData: [],
      }
      const mockCredential = {
        user: mockUser,
        providerId: 'anonymous',
        operationType: 'signIn',
      }
      const mockData = {
        field: 'value',
        firebaseAnonAuthID: 'test-uid',
      }

      vi.mocked(signInAnonymously).mockResolvedValueOnce(mockCredential)

      const mockMetadata = {
        hasPendingWrites: false,
        fromCache: false,
        isEqual: () => false,
      }

      const mockDocSnapshot = {
        exists: () => true,
        data: () => mockData,
        metadata: mockMetadata,
        ref: {},
        id: 'test-doc-id',
        get: () => mockData,
      }

      vi.mocked(getDoc).mockResolvedValueOnce(mockDocSnapshot)

      const result = await loadDoc('test-doc-id')
      expect(result).toEqual(mockData)
    })

    it('should return undefined for unauthorized user', async () => {
      const mockUser = {
        uid: 'test-uid',
        emailVerified: false,
        isAnonymous: true,
        metadata: {},
        providerData: [],
      }
      const mockCredential = {
        user: mockUser,
        providerId: 'anonymous',
        operationType: 'signIn',
      }
      const mockData = {
        field: 'value',
        firebaseAnonAuthID: 'different-uid',
      }

      vi.mocked(signInAnonymously).mockResolvedValueOnce(mockCredential)

      const mockMetadata = {
        hasPendingWrites: false,
        fromCache: false,
        isEqual: () => false,
      }

      const mockDocSnapshot = {
        exists: () => true,
        data: () => mockData,
        metadata: mockMetadata,
        ref: {},
        id: 'test-doc-id',
        get: () => mockData,
      }

      vi.mocked(getDoc).mockResolvedValueOnce(mockDocSnapshot)

      const result = await loadDoc('test-doc-id')
      expect(result).toBeUndefined()
    })
  })

  describe('updateSubjectDataRecord', () => {
    it('should update document successfully', async () => {
      const mockData = { field: 'value' }
      await updateSubjectDataRecord(mockData, 'test-doc-id')
      expect(setDoc).toHaveBeenCalled()
    })
  })

  describe('updatePrivateSubjectDataRecord', () => {
    it('should update private document successfully', async () => {
      const mockData = { field: 'value' }
      await updatePrivateSubjectDataRecord(mockData, 'test-doc-id')
      expect(setDoc).toHaveBeenCalled()
    })
  })

  describe('createPrivateDoc', () => {
    it('should create a private document successfully', async () => {
      const mockUser = {
        uid: 'test-uid',
        emailVerified: false,
        isAnonymous: true,
        metadata: {},
        providerData: [],
      }
      const mockCredential = {
        user: mockUser,
        providerId: 'anonymous',
        operationType: 'signIn',
      }
      const mockData = { field: 'value' }

      vi.mocked(signInAnonymously).mockResolvedValueOnce(mockCredential)
      vi.mocked(setDoc).mockResolvedValueOnce()

      const result = await createPrivateDoc(mockData, 'test-doc-id')
      expect(setDoc).toHaveBeenCalled()
      expect(result).toBeDefined()
    })
  })

  describe('fsnow', () => {
    it('should return a Firebase timestamp', () => {
      const timestamp = fsnow()
      expect(Timestamp.now).toHaveBeenCalled()
      expect(timestamp).toEqual({ seconds: 1234567890, nanoseconds: 123456789 })
    })
  })
})
