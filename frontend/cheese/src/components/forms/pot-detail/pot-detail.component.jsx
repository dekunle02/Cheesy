import './pot-detail.style.scss'
import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'

import loadStates from '../../../api/loadStates';
import Dialog from '../../../subcomponents/dialog/dialog.component'
import { FlatCard } from '../../../subcomponents/card/card.component'
import { FormInput } from '../../../subcomponents/form-input/form-input.component'
import { Button } from '../../../subcomponents/button/button.component'
import ProgressSpinner from "../../../subcomponents/progress/progress.component"
import getApi from '../../../api/api'
import Dropdown from '../../../subcomponents/dropdown/dropdown.component';


function PotDetailForm({potId, ...otherProps }) {
    const token = useSelector(state => state.user.userData.token)
    const api = getApi(token)

    const [name, setName] = useState("")
    const [currencyArr, setCurrencyArr] = useState([])
    const [currencyId, setCurrencyId] = useState("")
    const [amount, setAmount] = useState("")
    const [colorCode, setColorCode] = useState("#a72525")
    const [loadState, setLoadState] = useState(loadStates.FINISHED)
    const [formMessage, setFormMessage] = useState("")


    useEffect(() => {
        const api = getApi(token)
        api.getAllCurrencies().then(response => {
            if (response.status === api.SUCCESS) {
                setCurrencyArr(response.data)
                if (!potId && response.data.length > 0) {
                    setCurrencyId(response.data[0].id)
                }
            } else {
                alert("Error fetching currencies...")
            }
        })
    }, [token, potId])

    useEffect(() => {
        if (!potId) {
            return
        }
        const api = getApi(token)
        api.getPot(potId).then(response => {
            if (response.status === api.SUCCESS) {
                const { name, currency, amount, color_code } = response.data
                setName(name)
                setCurrencyId(currency.id)
                setAmount(amount)
                if (color_code !== "") {
                    setColorCode(color_code)
                }
            } else {
                alert("Error fetching Pot")
            }
        })

    }, [potId, token])

    
    const currencyDropDownItems = currencyArr.map(currency => ({ id: currency.id, text: currency.code }))
    const onCurrencySelected = id => {
        setCurrencyId(id)
    }

    const handleChange = event => {
        const { value, name } = event.target
        switch (name) {
            case "name":
                setName(value)
                break
            case "amount":
                setAmount(value)
                break
            case "colorCode":
                setColorCode(value)
                break
            default:
                break;
        }
    }

    const handleSubmitForm = event => {
        event.preventDefault()
        setLoadState(loadStates.LOADING)
        if (potId) {   
            api.patchPot(potId, {
                name: name, currency: currencyId, amount:amount, color_code:colorCode 
            }).then(response => {
                if (response.status === api.SUCCESS) {
                    setFormMessage("Pot updated successfully")
                } else {
                    setFormMessage("Pot not updated..")
                }
            })
        }
        else {
            api.postNewPot( {
                name: name, currency: currencyId, amount:amount, color_code:colorCode 
            }).then(response => {
                if (response.status === api.SUCCESS) {
                    setFormMessage("Pot created successfully")
                } else {
                    setFormMessage("Pot not created..")
                }
            })
        }
        setLoadState(loadStates.FINISHED)
    }


    return (
        <Dialog {...otherProps}>
            <FlatCard>
                <div className="pot-detail-container">
                    <h1 className="pot-detail-title">{potId ? "Edit Pot" : "Create New Pot"}</h1>
                    <form className='pot-form'>
                        <FormInput
                            type="text"
                            name="name"
                            label="Name"
                            value={name}
                            handleChange={handleChange}
                            placeholder="What is the Pot's name?"
                            required />

                        <div className='form-input-box'>
                            <label className='form-input-label'>Currency</label>
                            <Dropdown block title='currency' items={currencyDropDownItems} defaultSelectedId={currencyId} onItemSelected={onCurrencySelected} />
                        </div>

                        <FormInput
                            type="number"
                            name="amount"
                            label="Amount"
                            value={amount}
                            handleChange={handleChange}
                            placeholder="How much are you opening the pot with?"
                            required />

                        <div className='form-input-box'>
                            <label className='form-input-label'>Pot accent color</label>
                            <input className="block dropdown" type="color" name="colorCode" value={colorCode} onChange={handleChange} />
                        </div>

                        <div className='pot-form-submit-container'>
                            <Button block inactive={loadState === loadStates.LOADING} handleClick={handleSubmitForm}> SUBMIT </Button>
                            <ProgressSpinner canShow={loadState === loadStates.LOADING} />
                            <p className='form-message'>{formMessage}</p>
                        </div>

                    </form>
                </div>
            </FlatCard>

        </Dialog>

    )
}

export default PotDetailForm