import './form-input.style.scss'

/**
 * 
 * @param {handleChange} 
 * @param {label} 
 * @param {showError} 
 * @param {errorMessage} 
 * @param {otherProps} other attributes of the input tag 
 * @returns 
 */

function FormInput({handleChange, label, showError, errorMessage, ...otherProps}) {    
    
    return (
        <div className='form-input-box'>
            <label className='form-input-label'>{label}</label>
            <input className='form-input' onChange={handleChange} {...otherProps} />
            <h4 className={`form-error ${showError ? '' : 'hidden'}`}>{errorMessage}</h4>
        </div>
    )
}


function IconInput({handleChange, handleIconClick, materialIconName, ...otherProps}) {
    return (
        <div className='icon-input-box'>
            <input className='icon-input' onChange={handleChange}>
               
            </input>
            <label className='icon-label'  onClick={handleIconClick}>
                    <span className="material-icons">
                            {materialIconName}
                    </span>
                </label>
        </div>
    )

}


export {FormInput, IconInput}


    