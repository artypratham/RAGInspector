import { Navigate } from "react-router-dom"
import { useRecoilValue } from "recoil"
import { isAuthenticatedAtom, authVerifiedAtom } from "../../state/atom"
import LoadingScreen from "./LoadingScreen"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useRecoilValue(isAuthenticatedAtom)
  const authVerified = useRecoilValue(authVerifiedAtom)

  if (!authVerified) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
