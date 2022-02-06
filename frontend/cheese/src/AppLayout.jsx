import './AppLayout.scss'
import { useEffect, useState, useRef } from 'react'

import { useSelector } from 'react-redux'
import { Navigate, useLocation, Outlet } from 'react-router-dom'

import useAuth from './api/auth'
import loadStates from './api/loadStates'

import SideNav from './components/sidenav/sidenav.component'

function AppLayout() {
    return (
        <RequireAuth>
            <div className='app-grid'>
                <SideNav />
                <div className='app-content'>
                    <Outlet />
                </div>
            </div>
        </RequireAuth>
    )
}

function RequireAuth({ children }) {
    const _isMounted = useRef(true)
    const [validity, setValidity] = useState({ loadstate: loadStates.LOADING, value: false })
    const token = useSelector(state => state.user.userData.token)
    const auth = useAuth()
    const location = useLocation()

    useEffect(() => {
        if (_isMounted.current) {
            auth.validateToken(token).then(response => {
                setValidity({ loadstate: loadStates.FINISHED, value: response.data })
            })
        }
        return (() => {
            _isMounted.current = false
        })
    }, [auth, token])

    if (validity.loadstate === loadStates.LOADING) { return <div>LOADING</div> }
    if (validity.value === true) { return children }
    if (validity.value === false) { return <Navigate to="/" state={{ from: location }} /> }
}



export default AppLayout
