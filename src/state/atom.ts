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

export const rawInputAtom = atom<string>({
  key: "rawInputAtom",
  default: ""
})
