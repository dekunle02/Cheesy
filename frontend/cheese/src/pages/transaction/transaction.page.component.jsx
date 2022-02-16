import './transaction.page.style.scss'
import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import useApi from '../../api/api'
import { Button } from '../../subcomponents/button/button.component'
import { ButtonGroup } from '../../subcomponents/button/button.component'
import { IconInput } from '../../subcomponents/form-input/form-input.component'
import { TransactionRow } from '../../components/cards/recurring-transactions.component'

function TransactionsPage() {
    const token = useSelector(state => state.user.userData.token)
    const api = useApi(token)
    const [transactionsArr, setTransactionsArr] = useState([])
    // const [sortId, setSortId] = useState(1)
  
    useEffect(() => {
        api.getAllTransactionRecords("starDate", "kind", "query").then(response => {
            if (response.status === api.SUCCESS) {
                setTransactionsArr(response.data)
            } else {
                alert("Error fetching transactions...")
            }
        })
    }, [])

    const sortButtonItems = [
        { id: 1, text: "All" },
        { id: 2, text: "Income" },
        { id: 3, text: "Expense" },
    ]
    const onSortIdSelected = id => {
        // setSortId(id)
        console.log(id)
    }

    const onSearchFieldChange = text => {
        console.log(text)
    }
    const onSearchIconClick = text => {
        console.log(text)
    }

    const onTransactionItemClick = id => {
        console.log(id)
    }

    return (
        <div className="transactions-page-container">
            <div className="transactions-page-heading">
                <h1>Transactions 💸</h1>
                <span>See all your transaction records here</span>

                <div className='new-trans-btn-container'>
                    <Button inverse >
                        <div className='new-trans-btn-content'>
                            <span>New Transaction</span>
                            <span className="material-icons">add_box</span>
                        </div>
                    </Button>
                </div>

            </div>

            <div className="transactions-page-content">

                <div className="transaction-search">
                    <div className="search-container">
                        <IconInput
                            placeholder="search transactions by name, date or pot..."
                            materialIconName="search"
                            handleChange={onSearchFieldChange}
                            handleIconClick={onSearchIconClick}
                        />
                    </div>
                    <ButtonGroup tab items={sortButtonItems} defaultSelectedId={1} onItemSelected={onSortIdSelected} />
                </div>

                <div className="transactions-container">
                    { transactionsArr.map(t => <TransactionRow key={t.id} transaction={t} handleClick={onTransactionItemClick}/>)}
                </div>

            </div>

        </div>
    )
}
export default TransactionsPage