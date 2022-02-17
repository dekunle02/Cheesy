import './transaction-detail.style.scss'

import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'

import loadStates from '../../../api/loadStates';
import Dialog from '../../../subcomponents/dialog/dialog.component'
import { FlatCard } from '../../../subcomponents/card/card.component'
import { FormInput } from '../../../subcomponents/form-input/form-input.component'
import { Button, ButtonGroup } from '../../../subcomponents/button/button.component'
import ProgressSpinner from "../../../subcomponents/progress/progress.component"
import useApi from '../../../api/api'
import Dropdown from '../../../subcomponents/dropdown/dropdown.component';


function TransactionDetailForm({ transactionId, ...otherProps }) {
    const token = useSelector(state => state.user.userData.token)
    const api = useApi(token)

    const FormStates = [
        { id: 1, text: "Income", data: "inflow" },
        { id: 2, text: "Expense", data: "outflow" },
        { id: 3, text: "Transfer", data: "transfer" }
    ]
    const [formState, setFormState] = useState(1)
    const onFormItemSelected = id => {
        setFormState(id)
    }

    const periodOptions = [
        { id: 1, text: 'day' },
        { id: 2, text: 'week' },
        { id: 3, text: 'month' },
        { id: 4, text: 'year' }
    ]
    const [period, setPeriod] = useState(1)
    const onPeriodOptionSelected = id => {
        setPeriod(id)
    }

    const [potArr, setPotArr] = useState([])
    useEffect(() => {
        api.getAllPots().then(response => {
            if (response.status === api.SUCCESS) {
                setPotArr(response.data)
                if (!transactionId && response.data.length > 0) {
                    setFromPotId(response.data[0].id)
                    setToPotId(response.data[0].id)
                }
            } else {
                alert("Error fetching pots...")
            }
        })
    }, [token])
    const [fromPotId, setFromPotId] = useState("")
    const [toPotId, setToPotId] = useState("")
    const potOptions = potArr.map(pot => ({ id: pot.id, text: pot.name }))
    const onFromPotOptionSelected = id => {
        setFromPotId(id)
    }
    const onToPotOptionSelected = id => {
        setToPotId(id)
    }


    //Form Fields
    const [title, setTitle] = useState("")

    const [amount, setAmount] = useState("")
    const [recurring, setRecurring] = useState(false)
    const [startDate, setStartDate] = useState(false)
    const [periodNumber, setPeriodNumber] = useState(1)

    const [loadState, setLoadState] = useState(loadStates.FINISHED)
    const [formMessage, setFormMessage] = useState("")


    useEffect(() => {
        if (!transactionId) {
            return
        }
        api.getRecurringTransactionById(transactionId).then(response => {
            if (response.status === api.SUCCESS) {
                const { title, amount, is_recurring, treat_date, pot } = response.data
                setTitle(title)
                setAmount(amount)
                setRecurring(is_recurring)
                setFromPotId(pot.id)
                setStartDate(treat_date)
            } else {
                alert("Error fetching Pot")
            }
        })

    }, [transactionId])


    // Form field changes
    const handleChange = event => {
        const { value, name } = event.target
        switch (name) {
            case "title":
                setTitle(value)
                break
            case "amount":
                setAmount(value)
                break
            case "recurring":
                setRecurring(value)
                break
            case "periodNumber":
                setPeriodNumber(value)
                break
            default:
                break;
        }
    }

    const handleSubmitTransfer = event => {
        event.preventDefault()
        console.log("SubmitPressed")
        setLoadState(loadStates.LOADING)
        if (transactionId) {
            // api.patchPot(potId, {
            //     name: name, currency: currencyId, amount: amount, color_code: colorCode
            // }).then(response => {
            //     if (response.status === api.SUCCESS) {
            //         setFormMessage("Pot updated successfully")
            //     } else {
            //         setFormMessage("Pot not updated..")
            //     }
            // })
        }
        else {
            // api.postNewPot({
            //     name: name, currency: currencyId, amount: amount, color_code: colorCode
            // }).then(response => {
            //     if (response.status === api.SUCCESS) {
            //         setFormMessage("Pot created successfully")
            //     } else {
            //         setFormMessage("Pot not created..")
            //     }
            // })
        }
        setLoadState(loadStates.FINISHED)
    }

    const transferForm = (
        <form className='trans-form'>

            <div className='form-input-box'>
                <label className='form-input-label'>Choose the Pot you are transfering from </label>
                <Dropdown block title='fromPot' items={potOptions} defaultSelectedId={fromPotId} onItemSelected={onFromPotOptionSelected} />
            </div>

            <div className='form-input-box'>
                <label className='form-input-label'>Choose the Pot you are transfering into </label>
                <Dropdown block title='toPot' items={potOptions} defaultSelectedId={toPotId} onItemSelected={onToPotOptionSelected} />
            </div>

            <FormInput
                type="number"
                name="amount"
                label="Amount"
                value={amount}
                handleChange={handleChange}
                placeholder="How much are you transfering?"
                required />
            <FormInput
                type="text"
                name="title"
                label="Remarks"
                value={title}
                handleChange={handleChange}
                placeholder="a word or two about the nature of the transaction"
                required
            />



            <div className='trans-form-submit-container'>
                <Button block inactive={loadState === loadStates.LOADING} handleClick={handleSubmitTransfer}> SUBMIT </Button>
                <ProgressSpinner canShow={loadState === loadStates.LOADING} />
                <p className='form-message'>{formMessage}</p>
            </div>

        </form>
    )

    const inflowForm = (
        <div>Hello World</div>
    )

    const outFlowForm = (
        <div>Hello World</div>
    )

    return (
        <Dialog {...otherProps}>
            <FlatCard>
                <div className="trans-detail-container">
                    <h1 className="trans-detail-title">{transactionId ? "Edit Transaction" : "Make a Transaction"}</h1>

                    <div className="trans-btn-grp-container">
                        <ButtonGroup tab items={FormStates} defaultSelectedId={formState} onItemSelected={onFormItemSelected} />
                    </div>

                    {formState === 1 && inflowForm}
                    {formState === 2 && outFlowForm}
                    {formState === 3 && transferForm}

                </div>
            </FlatCard>

        </Dialog>

    )
}

export default TransactionDetailForm