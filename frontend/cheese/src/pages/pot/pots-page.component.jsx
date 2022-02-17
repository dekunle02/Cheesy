import './pots-page.style.scss'
import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import useApi from '../../api/api'
import { Button } from '../../subcomponents/button/button.component'
import PotItem from '../../components/cards/pot-item.component'
import PotBalanceChart from '../../components/charts/pot-balance/pot-balance.component'
import RecentTransactionsCard from '../../components/cards/recent-transactions.component'
import { RecurringTransactionsCard } from '../../components/cards/recurring-transactions.component'
import PotDetailForm from '../../components/forms/pot-detail/pot-detail.component'

function PotsPage() {
    const token = useSelector(state => state.user.userData.token)
    const api = useApi(token)

    const [canShowPotDetailForm, setShowPotDetailForm] = useState(false)
    const [canShowNewPotForm, setShowNewPotForm] = useState(false)

    const [potArr, setPotArr] = useState([])
    const [potId, setPotId] = useState(null)

    useEffect(() => {
        api.getAllPots().then(response => {
            if (response.status === api.SUCCESS) {
                setPotArr(response.data)
                if (response.data.length > 0) {
                    setPotId(response.data[0].id)
                }
            } else {
                alert("Error fetching pots...")
            }
        })
    }, [])

    const handleNewPotClick = () => {
        setShowNewPotForm(true)
    }


    return (
        <div className="pots-page-container">
            
            {canShowNewPotForm && <PotDetailForm canShow={canShowNewPotForm} setCanShow={setShowNewPotForm} />}
            {canShowPotDetailForm && <PotDetailForm canShow={canShowPotDetailForm} setCanShow={setShowPotDetailForm} potId={potId} />}

            <div className="pots-page-heading">
                <h1>Pots 💳</h1>
                <span>Manage all your pots</span>

                <div className='add-btn-container'>
                    <Button inverse handleClick={handleNewPotClick}>
                        <div className='add-btn-content'>
                            <span>Add a new Pot</span>
                            <span className="material-icons">add_circle</span>
                        </div>
                    </Button>
                </div>

            </div>

            <div className="pots-cards-container">
                {
                    potArr.map(pot => <PotItem handleEdit = {() => setShowPotDetailForm(true)} key={pot.id} pot={pot} active={pot.id === potId} handleClick={() => { setPotId(pot.id) }} />)
                }s
            </div>
            <div className="pots-page-row">
                <PotBalanceChart potId={potId} />
                <RecentTransactionsCard potId={potId} />
            </div>
            <RecurringTransactionsCard potId={potId} />
        </div>
    )
}

export default PotsPage