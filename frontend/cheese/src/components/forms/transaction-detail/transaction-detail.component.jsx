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

    const [recurring, setRecurring] = useState(false)
    const [formState, setFormState] = useState(1)
    const [period, setPeriod] = useState(1)
    const [potArr, setPotArr] = useState([])
    const [fromPotId, setFromPotId] = useState("")
    const [toPotId, setToPotId] = useState("")
    const [title, setTitle] = useState("")
    const [amount, setAmount] = useState("")
    const [startDate, setStartDate] = useState("")
    const [periodNumber, setPeriodNumber] = useState(1)
    const [loadState, setLoadState] = useState(loadStates.FINISHED)
    const [formMessage, setFormMessage] = useState("")


    const FormStates = [
        { id: 1, text: "Income", data: "inflow" },
        { id: 2, text: "Expense", data: "outflow" },
        { id: 3, text: "Transfer", data: "transfer" }
    ]
    const onFormItemSelected = id => {
        setRecurring(false)
        setFormState(id)
    }
    const periodOptions = [
        { id: 1, text: 'day' },
        { id: 2, text: 'week' },
        { id: 3, text: 'month' },
        { id: 4, text: 'year' }
    ]
    const onPeriodOptionSelected = id => {
        setPeriod(id)
    }
    const potOptions = potArr.map(pot => ({ id: pot.id, text: pot.name }))
    const onFromPotOptionSelected = id => {
        setFromPotId(id)
    }
    const onToPotOptionSelected = id => {
        setToPotId(id)
    }

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
                setToPotId(pot.id)
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
            case "periodNumber":
                setPeriodNumber(value)
                break
            case "date":
                setStartDate(value)
                break
            default:
                break;
        }
    }

    const handleSubmitTransfer = event => {
        event.preventDefault()
        setLoadState(loadStates.LOADING)
        if (transactionId) {
            api.patchRecurringTransaction(transactionId, {
                title: title,
                amount: amount,
                fromPot: fromPotId,
                toPot: toPotId,
                recurring: recurring,
                startDate: startDate,
                period: (periodOptions.find(p => p.id === period)).text,
                periodNumber: periodNumber,
                kind: (FormStates.find(state => state.id === formState)).data
            }).then(response => {
                if (response.status === api.SUCCESS) {
                    alert("Transaction updated successfully")
                } else {
                    alert("Transaction not updated..")
                }
                otherProps.setCanShow(false)
            })
        }
        else {
            api.postNewTransaction({
                title: title,
                amount: amount,
                fromPot: fromPotId,
                toPot: toPotId,
                recurring: recurring,
                startDate: startDate,
                period: (periodOptions.find(p => p.id === period)).text,
                periodNumber: periodNumber,
                kind: (FormStates.find(state => state.id === formState)).data
            }).then(response => {
                setLoadState(loadStates.FINISHED)
                if (response.status === api.SUCCESS) {
                    alert("Transaction created successfully")
                } else {
                    alert("Transaction not created..")
                }
                otherProps.setCanShow(false)
            })
        }
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
                placeholder="...short description..."
                required
            />

            <FormInput
                type="date"
                name="date"
                label="When should the transaction start?"
                value={startDate}
                handleChange={handleChange}
                placeholder=""
            />

            <div className='trans-form-input-box'>
                <label>Will this be a recurring transaction?</label>
                <input type="checkbox" className="slider" name="recurring" onChange={() => setRecurring(!recurring)} />
            </div>

            {recurring &&
                <div className="period-container">
                    <span>It should repeat every</span>
                    <input type="number" />
                    <Dropdown title='period' items={periodOptions} defaultSelectedId={period} onItemSelected={onPeriodOptionSelected} />
                </div>
            }

            <div className='trans-form-submit-container'>
                <Button block inactive={loadState === loadStates.LOADING} handleClick={handleSubmitTransfer}> SUBMIT </Button>
                <ProgressSpinner canShow={loadState === loadStates.LOADING} />
                <p className='form-message'>{formMessage}</p>
            </div>

        </form>
    )

    const inflowForm = (
        <form className='trans-form'>

            <div className='form-input-box'>
                <label className='form-input-label'>Choose the Pot you are putting money into</label>
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
                placeholder="...short description..."
                required
            />
            <FormInput
                type="date"
                name="date"
                label="When should the transaction start?"
                value={startDate}
                handleChange={handleChange}
            />

            <div className='trans-form-input-box'>
                <label>Will this be a recurring transaction?</label>
                <input type="checkbox" className="slider" name="recurring" onChange={() => setRecurring(!recurring)} />
            </div>

            {recurring &&
                <div className="period-container">
                    <span>It should repeat every</span>
                    <input type="number" />
                    <Dropdown title='period' items={periodOptions} defaultSelectedId={period} onItemSelected={onPeriodOptionSelected} />
                </div>
            }

            <div className='trans-form-submit-container'>
                <Button block inactive={loadState === loadStates.LOADING} handleClick={handleSubmitTransfer}> SUBMIT </Button>
                <ProgressSpinner canShow={loadState === loadStates.LOADING} />
                <p className='form-message'>{formMessage}</p>
            </div>



        </form>
    )

    const outFlowForm = (
        <form className='trans-form'>

            <div className='form-input-box'>
                <label className='form-input-label'>Choose the Pot you are taking money from </label>
                <Dropdown block title='fromPot' items={potOptions} defaultSelectedId={fromPotId} onItemSelected={onFromPotOptionSelected} />
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
                placeholder="...short description..."
                required
            />
            <FormInput
                type="date"
                name="date"
                label="When should the transaction start?"
                value={startDate}
                handleChange={handleChange}
            />
            <div className='trans-form-input-box'>
                <label>Will this be a recurring transaction?</label>
                <input type="checkbox" className="slider" name="recurring" onChange={() => setRecurring(!recurring)} />
            </div>

            {recurring &&
                <div className="period-container">
                    <span>It should repeat every</span>
                    <input type="number" />
                    <Dropdown title='period' items={periodOptions} defaultSelectedId={period} onItemSelected={onPeriodOptionSelected} />
                </div>
            }
            <div className='trans-form-submit-container'>
                <Button block inactive={loadState === loadStates.LOADING} handleClick={handleSubmitTransfer}> SUBMIT </Button>
                <ProgressSpinner canShow={loadState === loadStates.LOADING} />
                <p className='form-message'>{formMessage}</p>
            </div>

        </form>
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