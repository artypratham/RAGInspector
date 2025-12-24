import { useRecoilValue } from "recoil"
import { recordsAtom } from "../state/atom"
import { metricsSelector } from "../state/selector"
import MetricsDashboard from "../components/metrics/MetricsDashboard"
import RecordList from "../components/records/RecordList"
import UploadPanel from "../components/common/UploadPanel"

const MetricsDashboardAny = MetricsDashboard as any

export default function App() {
  const records = useRecoilValue(recordsAtom)
  const metrics = useRecoilValue(metricsSelector)

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {!records.length ? (
        <UploadPanel />
      ) : (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          <MetricsDashboardAny metrics={metrics} />
          <RecordList />
        </div>
      )}
    </div>
  )
}
