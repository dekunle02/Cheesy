import './delete.style.scss'
import { useEffect, useState } from 'react'
import useApi from '../../../api/api'
import { useSelector } from 'react-redux'
import { Button, OutlineButton } from '../../../subcomponents/button/button.component'
import Dialog from '../../../subcomponents/dialog/dialog.component'
import { FlatCard } from '../../../subcomponents/card/card.component'


function DeleteTransactionCard({ transactionId, ...otherProps }) {
    const token = useSelector(state => state.user.userData.token)
    const api = useApi(token)
    const [transaction, setTransaction] = useState(null)

    useEffect(() => {
        api.getRecurringTransactionById(transactionId).then(response => {
            if (response.status === api.SUCCESS) {
                setTransaction(response.data)
            } else {
                alert("Error fetching Transaction...")
            }
        })
    }, [transactionId])

    const handleDelete = () => {
        api.deleteTransaction(transactionId).then(response => {
            if (response.status === api.SUCCESS) {
                alert("Pot deleted!")
            } else {
                alert("Error deleting Pot...")
            }
            otherProps.setCanShow(false)
        })
    }

    return (

        <Dialog {...otherProps}>
            {transaction &&
                <FlatCard>
                    <div className="delete-container">
                        <h1 className="delete-title">Confirm Delete</h1>
                        <span className="delete-message">Are you sure? Deleting {transaction.title} is irreversible.</span>
                        <div className="delete-buttons-container">
                            <OutlineButton block handleClick={() => otherProps.setCanShow(false)}>Cancel</OutlineButton>
                            <Button block inverse handleClick={handleDelete}>Delete</Button>
                        </div>
                    </div>
                </FlatCard>
            }
        </Dialog>
    )
}

export default DeleteTransactionCard