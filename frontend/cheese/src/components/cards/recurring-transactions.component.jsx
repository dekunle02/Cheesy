import './recurring-transactions.style.scss'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { FlatCard } from '../../subcomponents/card/card.component'
import { Button, ButtonGroup } from '../../subcomponents/button/button.component'
import { formatMoneyNumber } from '../../api/utils'
import useApi from '../../api/api'

function TransactionRow({ transaction }) {
    const { title, amount, kind, pot } = transaction
    const sign = kind === 'inflow' ? "+" : "-"

    return (
        <div className="rec-transaction-row">
            <span class="material-icons">
                south_west
            </span>
            
            <span class="material-icons">
                north_east
            </span>

            <h5 className="rec-title">Rent</h5>
            <h5 className={`amount ${kind}`}>{`${sign}${pot.currency.symbol}${formatMoneyNumber(amount)}`}</h5>
        </div>
    )
}


function RecurringTransactionsCard({ potId }) {
    const token = useSelector(state => state.user.userData.token)
    const api = useApi(token)
    const [transactionArr, setTransactionArr] = useState([])
    // const [sortId, setSortId] = useState(1)

    const transactionButtonItems = [
        { id: 1, text: "All" },
        { id: 2, text: "Income" },
        { id: 3, text: "Expense" },
    ]

    useEffect(() => {
        api.getRecurringTransactionsByPot(potId, 'All').then(response => {
            if (response.status === api.SUCCESS) {
                setTransactionArr(response.data)
            } else {
                alert("Error fetching recent transactions")
            }
        })
    }, [])

    const onTransactionIdSelected = id => {
        // setSortId(id)
        console.log(id)
    }

    return (
        <div className="recurring-trans-container">
            <FlatCard block>
                <div className="recurring-trans-content">
                    <div className="recurring-title">
                        <span >Recurring Transactions</span>
                        <span class="material-icons">
                            add_circle
                        </span>
                    </div>

                    <div className="btn-container">
                        <ButtonGroup items={transactionButtonItems} defaultSelectedId={1} onItemSelected={onTransactionIdSelected} />
                    </div>
                    <div>
                        {transactionArr.map(transaction => (<TransactionRow key={transaction.id} transaction={transaction} />))}
                    </div>
                </div>
            </FlatCard>
        </div>
    )
}

export default RecurringTransactionsCard