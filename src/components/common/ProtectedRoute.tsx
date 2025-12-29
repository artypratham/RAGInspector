import { Navigate } from "react-router-dom"
import { useRecoilValue } from "recoil"
import { isAuthenticatedAtom } from "../../state/atom"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useRecoilValue(isAuthenticatedAtom)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
