import './pots-page.style.scss'
import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import useApi from '../../api/api'
import { Button } from '../../subcomponents/button/button.component'
import PotItem from '../../components/cards/pot-item.component'
import PotBalanceChart from '../../components/charts/pot-balance/pot-balance.component'


function PotsPage() {
    const token = useSelector(state => state.user.userData.token)
    const api = useApi(token)
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
        console.log("New Pot clicked")
    }


    return (
        <div className="pots-page-container">
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
                    potArr.map(pot => <div key={pot.id} onClick={() => { setPotId(pot.id) }} className="pot-item-wrapper"><PotItem pot={pot} active={pot.id === potId} /></div>)
                }
            </div>
            <PotBalanceChart potId={potId} />
        </div>
    )
}

export default PotsPage