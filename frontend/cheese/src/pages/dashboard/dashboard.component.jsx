import './dashboard.style.scss'
import { useSelector } from 'react-redux'

import NetworthCard from '../../components/charts/networth/networth.component'

function Dashboard() {
    const user = useSelector(state => state.user.userData.user)
    const token = useSelector(state => state.user.userData.token)

    return (
        <div>
            <div className="dashboard-heading">
                <h1>Hello {user.username} 👋🏾</h1>
                <span>See your money at a glance</span>
            </div>

            <div className="dashboard-body">
                <NetworthCard />
            </div>
            
        </div>
    )
}

export default Dashboard