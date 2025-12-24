import { selector } from "recoil"
import { recordsAtom, annotationsAtom } from "./atom"
import { computeMetrics } from "../logic/metrics"

export const metricsSelector = selector({
  key: "metricsSelector",
  get: ({ get }) => {
    const records = get(recordsAtom)
    const annotations = get(annotationsAtom)
    return computeMetrics(records, annotations)
  }
})
