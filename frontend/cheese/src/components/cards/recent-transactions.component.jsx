import './recent-transactions.style.scss'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { FlatCard } from '../../subcomponents/card/card.component'
import { ButtonGroup } from '../../subcomponents/button/button.component'
import { formatMoneyNumber } from '../../api/utils'
import getApi from '../../api/api'

function TransactionRow({ record }) {
    const {date, transaction} = record
    const {title, amount, kind, pot} = transaction
    const sign = kind === 'inflow' ? "+" : "-" 
    
    return (
        <div className="transaction-row">
            <h5 className="title">{title}</h5>
            <h5 className={`amount ${kind}`}>{`${sign}${pot.currency.symbol}${formatMoneyNumber(amount)}`}</h5>
            <h5 className="date">{date} {pot.name}</h5>
        </div>
    )
}


function RecentTransactionsCard({potId}) {
    const token = useSelector(state => state.user.userData.token)
    const [transactionArr, setTransactionArr] = useState([])
    const [sortId, setSortId] = useState(1)

    const transactionButtonItems = [
        { id: 1, text: "All", kind:"all"},
        { id: 2, text: "Income", kind:"inflow"},
        { id: 3, text: "Expense", kind:"outflow" },
    ]

    useEffect(() => {
        let promise = null
        const api = getApi(token)
        const sort = transactionButtonItems.find(t => (t.id === sortId))
        if (potId) {
            promise = api.getRecentTransactionsByPot(potId, sort.kind)
        } else {
            promise = api.getRecentTransactions(sort.kind)
        }
        promise.then(response => {
            if (response.status === api.SUCCESS) {
                setTransactionArr(response.data)
            } else {
                // alert("Error fetching recent transactions")
            }
        })
    }, [token, potId, sortId])

    const onTransactionIdSelected = id => {
        setSortId(id)
    }

    return (
        <div className="recent-trans-container">
            <FlatCard block>
                <div className="recent-trans-content">
                    <h4 className="recent-title">Recent Transactions</h4>
                    <div className="btn-container">
                        <ButtonGroup items={transactionButtonItems} defaultSelectedId={1} onItemSelected={onTransactionIdSelected} />
                    </div>
                    <div className="recent-trans-rows-container">
                        {transactionArr.map(record => (<TransactionRow key={record.id} record={record} />))}
                    </div>
                </div>
            </FlatCard>
        </div>
    )
}

export default RecentTransactionsCard