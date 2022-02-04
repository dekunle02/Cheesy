import { useState } from 'react'
import './dialog.style.scss'

function Dialog({ children, canDismiss, ...otherProps }) {
    const [dialogVisibility, setDialogVisibility] = useState(true)

    if (canDismiss) {
        setDialogVisibility(false)
    }

    return (
        <div className={`${dialogVisibility ? '' : 'invisible'} dialog-container`}>
            <div className="dialog-backdrop" onClick={() => { setDialogVisibility(false) }} >
            </div>
            <div className='dialog-content'>
                {children}
            </div>
        </div>
    )
}

export default Dialog