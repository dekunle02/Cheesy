import './form-input.style.scss'
import { useState } from 'react'

/**
 * 
 * @param {handleChange} 
 * @param {label} 
 * @param {showError} 
 * @param {errorMessage} 
 * @param {otherProps} other attributes of the input tag 
 * @returns 
 */

function FormInput({ handleChange, label, showError, errorMessage, ...otherProps }) {

    return (
        <div className='form-input-box'>
            <label className='form-input-label'>{label}</label>
            <input className='form-input' onChange={handleChange} {...otherProps} />
            <h4 className={`form-error ${showError ? '' : 'hidden'}`}>{errorMessage}</h4>
        </div>
    )
}


function IconInput({ handleChange, handleIconClick, materialIconName, ...otherProps }) {
    const [currentText, setCurrentText] = useState("")

    const updateText = event => {
        const { value } = event.target
        setCurrentText(value)
        handleChange(value)
    }

    const iconClick = () => {
        handleIconClick(currentText)
    }

    return (
        <div className='icon-input-box'>
            <input className='icon-input' onChange={updateText} {...otherProps}/>
            <label className='icon-label' onClick={iconClick}>
                <span className="material-icons">
                    {materialIconName}
                </span>
            </label>
        </div>
    )

}


export { FormInput, IconInput }


