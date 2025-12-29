import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useRecoilValue } from "recoil"
import { isAuthenticatedAtom } from "../state/atom"
import Login from "../pages/Login"
import Signup from "../pages/Signup"
import Dashboard from "../pages/Dashboard"
import ProtectedRoute from "../components/common/ProtectedRoute"

export default function App() {
  const isAuthenticated = useRecoilValue(isAuthenticatedAtom)

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Signup />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
