import { atom } from "recoil"
import type { RecordData } from "../types/pipeline"
import type { AnnotationState } from "../types/annotation"
import type { User, ExtractionListItem } from "../types/api"

export const recordsAtom = atom<RecordData[]>({
  key: "recordsAtom",
  default: []
})

export const annotationsAtom = atom<AnnotationState>({
  key: "annotationsAtom",
  default: {}
})

export const schemaInputAtom = atom<string>({
  key: "schemaInputAtom",
  default: ""
})

export const outputJsonAtom = atom<string>({
  key: "outputJsonAtom",
  default: ""
})

// Auth atoms — safe initialization with try-catch to prevent app crash on corrupted localStorage
export const userAtom = atom<User | null>({
  key: "userAtom",
  default: (() => {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) as User : null
    } catch {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      return null
    }
  })()
})

export const isAuthenticatedAtom = atom<boolean>({
  key: "isAuthenticatedAtom",
  default: !!localStorage.getItem('token')
})

// Flag to track if auth has been verified against the server
export const authVerifiedAtom = atom<boolean>({
  key: "authVerifiedAtom",
  default: false
})

// UI atoms
export const sidebarOpenAtom = atom<boolean>({
  key: "sidebarOpenAtom",
  default: true
})

export const currentExtractionIdAtom = atom<string | null>({
  key: "currentExtractionIdAtom",
  default: null
})

export const extractionsAtom = atom<ExtractionListItem[]>({
  key: "extractionsAtom",
  default: []
})

export const isAnnotationSubmittedAtom = atom<boolean>({
  key: "isAnnotationSubmittedAtom",
  default: false
})
