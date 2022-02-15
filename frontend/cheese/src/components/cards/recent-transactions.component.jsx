import './recent-transactions.style.scss'
import { useEffect, useState } from 'react'
import { FlatCard } from '../../subcomponents/card/card.component'
import { ButtonGroup } from '../../subcomponents/button/button.component'
import { formatMoneyNumber } from '../../api/utils'
import useApi from '../../api/api'

function TransactionRow({ record }) {
    const {date, transaction} = record
    const {title, amount, kind, pot} = transaction
    
    return (
        <div className="transaction-row">
            <h5 className="title">{title}</h5>
            <h5 className={`amount ${kind}`}>{`${pot.currency.symbol}${formatMoneyNumber(amount)}`}</h5>
            <h5 className="date">{date} {pot.name}</h5>
        </div>
    )
}


function RecentTransactionsCard() {
    const api = useApi()
    const [transactionArr, setTransactionArr] = useState([])
    // const [sortId, setSortId] = useState(1)

    const transactionButtonItems = [
        { id: 1, text: "All" },
        { id: 2, text: "Income" },
        { id: 3, text: "Expense" },
    ]

    useEffect(() => {
        api.getRecentTransactions().then(response => {
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
        <div className="recent-trans-container">
            <FlatCard block>
                <div className="recent-trans-content">
                    <h4 className="recent-title">Recent Transactions</h4>
                    <div className="btn-container">
                        <ButtonGroup items={transactionButtonItems} defaultSelectedId={1} onItemSelected={onTransactionIdSelected} />
                    </div>
                    <div>
                        {transactionArr.map(record => (<TransactionRow key={record.id} record={record} />))}
                    </div>
                </div>
            </FlatCard>
        </div>
    )
}

export default RecentTransactionsCard