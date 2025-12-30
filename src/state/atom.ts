import { atom } from "recoil"
import type { RecordData } from "../types/pipeline"
import type { AnnotationState } from "../types/annotation"

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

// Auth atoms
export const userAtom = atom<any>({
  key: "userAtom",
  default: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
})

export const isAuthenticatedAtom = atom<boolean>({
  key: "isAuthenticatedAtom",
  default: !!localStorage.getItem('token')
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

export const extractionsAtom = atom<any[]>({
  key: "extractionsAtom",
  default: []
})

export const isAnnotationSubmittedAtom = atom<boolean>({
  key: "isAnnotationSubmittedAtom",
  default: false
})
