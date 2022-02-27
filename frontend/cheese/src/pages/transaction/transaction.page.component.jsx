import './transaction.page.style.scss'
import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import getApi from '../../api/api'
import { Button } from '../../subcomponents/button/button.component'
import { ButtonGroup } from '../../subcomponents/button/button.component'
import { IconInput } from '../../subcomponents/form-input/form-input.component'
import { RecordRow } from '../../components/cards/recurring-transactions.component'

import TransactionDetailForm from '../../components/forms/transaction-detail/transaction-detail.component'
import DeleteTransactionCard from '../../components/dialogs/delete/delete-transaction.component'

function TransactionsPage() {
    const token = useSelector(state => state.user.userData.token)

    const [canShowNewTrans, setCanShowNewTrans] = useState(false)
    const [canShowEditTrans, setCanShowEditTrans] = useState(false)
    const [canShowDeleteTrans, setCanShowDeleteTrans] = useState(false)

    const [selectedTrans, setSelectedTrans] = useState("")

    const [transactionsArr, setTransactionsArr] = useState([])
    const [sortId, setSortId] = useState(1)
  
    const sortButtonItems = [
        { id: 1, text: "All", kind: "all" },
        { id: 2, text: "Income", kind: "inflow" },
        { id: 3, text: "Expense", kind: "outflow" },
    ]

    const onSortIdSelected = id => {
        setSortId(id)
    }

    useEffect(() => {
        const api = getApi(token)
        const sort = sortButtonItems.find(s => s.id ===sortId)
        api.getAllTransactionRecords(sort.kind, "query").then(response => {
            if (response.status === api.SUCCESS) {
                setTransactionsArr(response.data)
            } else {
                alert("Error fetching transactions...")
            }
        })
    }, [token, sortId])

    const onSearchFieldChange = text => {
        console.log(text)
    }
    const onSearchIconClick = text => {
        console.log(text)
    }

    const onTransactionItemClick = id => {
        setSelectedTrans(id)
        setCanShowEditTrans(true)
    }


    return (
        <div className="transactions-page-container">
            {canShowNewTrans && <TransactionDetailForm canShow={canShowNewTrans} setCanShow={setCanShowNewTrans} />}
            {canShowEditTrans && <TransactionDetailForm transactionId={selectedTrans} canShow={canShowEditTrans} setCanShow={setCanShowEditTrans} />}
            {canShowDeleteTrans && <DeleteTransactionCard transactionId={selectedTrans} canShow={canShowDeleteTrans} setCanShow={setCanShowDeleteTrans} />}
            
            <div className="transactions-page-heading">
                <h1>Transactions 💸</h1>
                <span>See all your transaction records here</span>

                <div className='new-trans-btn-container'>
                    <Button inverse onClick={() => setCanShowNewTrans(true)}>
                        <div className='new-trans-btn-content'>
                            <span>New Transaction</span>
                            <span className="material-icons">rocket_launch</span>
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
                    { transactionsArr.map(t => <RecordRow key={t.id} record={t} handleClick={onTransactionItemClick} handleDelete={() => setCanShowDeleteTrans(true)}/>)}
                </div>

            </div>

        </div>
    )
}
export default TransactionsPage