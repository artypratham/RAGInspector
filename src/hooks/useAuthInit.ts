import { useEffect } from "react"
import { useSetRecoilState, useRecoilValue } from "recoil"
import { userAtom, isAuthenticatedAtom, authVerifiedAtom } from "../state/atom"
import { api } from "../services/api"

export function useAuthInit() {
  const setUser = useSetRecoilState(userAtom)
  const setIsAuthenticated = useSetRecoilState(isAuthenticatedAtom)
  const setAuthVerified = useSetRecoilState(authVerifiedAtom)
  const authVerified = useRecoilValue(authVerifiedAtom)

  useEffect(() => {
    if (authVerified) return

    const token = localStorage.getItem('token')
    if (!token) {
      setIsAuthenticated(false)
      setUser(null)
      setAuthVerified(true)
      return
    }

    api.getMe().then(response => {
      if (response.data?.user) {
        setUser(response.data.user)
        setIsAuthenticated(true)
      } else {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
        setIsAuthenticated(false)
      }
      setAuthVerified(true)
    })
  }, [authVerified, setAuthVerified, setIsAuthenticated, setUser])
}
