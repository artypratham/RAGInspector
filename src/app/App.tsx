import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useRecoilValue } from "recoil"
import { isAuthenticatedAtom } from "../state/atom"
import { useAuthInit } from "../hooks/useAuthInit"
import ProtectedRoute from "../components/common/ProtectedRoute"
import ErrorBoundary from "../components/common/ErrorBoundary"
import LoadingScreen from "../components/common/LoadingScreen"

const Login = lazy(() => import("../pages/Login"))
const Signup = lazy(() => import("../pages/Signup"))
const Dashboard = lazy(() => import("../pages/Dashboard"))
const History = lazy(() => import("../pages/History"))
const NotFound = lazy(() => import("../pages/NotFound"))

export default function App() {
  const isAuthenticated = useRecoilValue(isAuthenticatedAtom)

  useAuthInit()

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<LoadingScreen />}>
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
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
