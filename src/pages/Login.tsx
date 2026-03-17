import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSetRecoilState } from "recoil"
import { userAtom, isAuthenticatedAtom } from "../state/atom"
import { api } from "../services/api"
import { Activity, LogIn, AlertCircle } from "lucide-react"

export default function Login() {
  const navigate = useNavigate()
  const setUser = useSetRecoilState(userAtom)
  const setIsAuthenticated = useSetRecoilState(isAuthenticatedAtom)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await api.login(email, password)

      if (response.error) {
        setError(response.error)
        setLoading(false)
        return
      }

      if (response.data) {
        setUser(response.data.user)
        setIsAuthenticated(true)
        navigate("/")
      }
    } catch {
      setError("An unexpected error occurred")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-xl">
            <Activity className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white">Welcome Back</h1>
          <p className="text-lg text-slate-400">
            Sign in to access your RAG Pipeline diagnostics
          </p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/signup")}
                className="text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
