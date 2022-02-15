import './dashboard.style.scss'
import { useSelector } from 'react-redux'

import NetworthCard from '../../components/charts/networth/networth.component'
import RecentTransactionsCard from '../../components/cards/recent-transactions.component'
import PotSummaryDonut from '../../components/charts/pot-summary/pot-summary-card.component'
import SpendingHabitChart from '../../components/charts/spending-habit/spending-habit.component'

function Dashboard() {
    const user = useSelector(state => state.user.userData.user)
    // const token = useSelector(state => state.user.userData.token)

    return (
        <div>
            <div className="dashboard-heading">
                <h1>Hello {user.username} 👋🏾</h1>
                <span>See your money at a glance</span>
            </div>

            <div className="dashboard-body">
                <div className="dashboard-row">
                    <NetworthCard />
                    <RecentTransactionsCard />
                </div>
                <div className="dashboard-row">
                    <div className='dashboard-summary-donut'>
                        <PotSummaryDonut />
                    </div>
                    <div className='dashboard-spending-habit'>
                        <SpendingHabitChart />
                    </div>
                </div>


            </div>

        </div>
    )
}

export default Dashboard