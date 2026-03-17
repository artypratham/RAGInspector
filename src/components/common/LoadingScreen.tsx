import { Activity } from "lucide-react"

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
      <div className="text-center space-y-4">
        <Activity className="w-10 h-10 text-cyan-400 mx-auto animate-pulse" />
        <p className="text-slate-400 text-sm">Loading...</p>
      </div>
    </div>
  )
}
