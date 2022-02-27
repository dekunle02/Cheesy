import './recurring-transactions.style.scss'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { FlatCard } from '../../subcomponents/card/card.component'
import { ButtonGroup } from '../../subcomponents/button/button.component'
import { formatMoneyNumber } from '../../api/utils'
import getApi from '../../api/api'

function TransactionRow({ transaction, handleClick, handleDelete }) {
    // const {id, transaction} = record 

    const { id, title, amount, kind, pot, is_recurring, treat_date, period, period_count } = transaction
    const sign = kind === 'inflow' ? "+" : "-"

    const periodString = is_recurring ? `Every ${period_count} ${period}` : 'Once'
    const connectString = kind === 'inflow' ? 'into' : 'from'

    const descString = periodString + " " + connectString + " " + pot.name

    const kindLogo = () => {
        if (kind === 'inflow') {
            return (<span className="material-icons kind in ">
                north_east
            </span>)
        }
        else {
            return (<span className="material-icons kind out">
                south_west
            </span>)
        }
    }

    const recurringLogo = () => {
        if (is_recurring) {
            return (<span className="material-icons recurring">
                restart_alt
            </span>)
        } else {
            return ""
        }
    }

    return (
        <div className="rec-transaction-row" onClick={() => handleClick(id)}>
            {kindLogo()}
            <h5 className="rec-title">{title}</h5>
            <span className="description">{descString}</span>
            {recurringLogo()}
            <h5 className={`amount ${kind}`}>{`${sign}${pot.currency.symbol}${formatMoneyNumber(amount)}`}</h5>
            <span className="treat-date">{treat_date}</span>
            <span className="material-icons delete" onClick={event => {
                event.stopPropagation()
                handleDelete(id)}}>
                {`${is_recurring ? 'backspace': ""}`}
            </span>

        </div>
    )
}


function RecordRow({ record, handleClick, handleDelete }) {
    const {id, transaction} = record 

    const { title, amount, kind, pot, is_recurring, treat_date, period, period_count } = transaction
    const sign = kind === 'inflow' ? "+" : "-"

    const periodString = is_recurring ? `Every ${period_count} ${period}` : 'Once'
    const connectString = kind === 'inflow' ? 'into' : 'from'

    const descString = periodString + " " + connectString + " " + pot.name

    const kindLogo = () => {
        if (kind === 'inflow') {
            return (<span className="material-icons kind in ">
                north_east
            </span>)
        }
        else {
            return (<span className="material-icons kind out">
                south_west
            </span>)
        }
    }

    const recurringLogo = () => {
        if (is_recurring) {
            return (<span className="material-icons recurring">
                restart_alt
            </span>)
        } else {
            return ""
        }
    }

    return (
        <div className="rec-transaction-row" onClick={() => handleClick(id)}>
            {kindLogo()}
            <h5 className="rec-title">{title}</h5>
            <span className="description">{descString}</span>
            {recurringLogo()}
            <h5 className={`amount ${kind}`}>{`${sign}${pot.currency.symbol}${formatMoneyNumber(amount)}`}</h5>
            <span className="treat-date">{treat_date}</span>
            <span className="material-icons delete" onClick={event => {
                event.stopPropagation()
                handleDelete(id)}}>
                {`${is_recurring ? 'backspace': ""}`}
            </span>

        </div>
    )
}



function RecurringTransactionsCard({ potId, handleItemClick, handleNewTransactionClick }) {
    const token = useSelector(state => state.user.userData.token)
    const [transactionArr, setTransactionArr] = useState([])
    const [sortId, setSortId] = useState(1)

    const sortButtonItems = [
        { id: 1, text: "All", kind: "all" },
        { id: 2, text: "Income", kind: "inflow" },
        { id: 3, text: "Expense", kind: "outflow" },
    ]

    useEffect(() => {
        const api = getApi(token)
        const sort = sortButtonItems.find(s => s.id ===sortId)
        api.getRecurringTransactionsByPot(potId, sort.kind).then(response => {
            if (response.status === api.SUCCESS) {
                setTransactionArr(response.data)
            } else {
                alert("Error fetching recent transactions")
            }
        })
    }, [token, potId, sortId])

    const onSortIdSelected = id => {
        setSortId(id)
    }


    return (
        <div className="recurring-trans-container">
            <FlatCard block>
                <div className="recurring-trans-content">
                    <div className="recurring-title">
                        <span >Recurring Transactions</span>
                        <span className="material-icons" onClick={handleNewTransactionClick}>
                            add_circle
                        </span>
                    </div>

                    <div className="btn-container">
                        <ButtonGroup tab items={sortButtonItems} defaultSelectedId={1} onItemSelected={onSortIdSelected} />
                    </div>
                    {transactionArr.length > 0 ?
                        <div>
                            {transactionArr.map(transaction => (<TransactionRow key={transaction.id} transaction={transaction} handleClick={handleItemClick} />))}
                        </div>
                        :
                        <h2>Nothing to see yet"</h2>
                    }

                </div>
            </FlatCard>
        </div>
    )
}

export { RecurringTransactionsCard, TransactionRow, RecordRow }