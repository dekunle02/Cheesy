import { useState } from 'react'
import './dialog.style.scss'

function Dialog({ children, canDismiss, ...otherProps }) {
    const [dialogDismiss, setDialogDismiss] = useState(false)

    return (
        <div className={`${dialogDismiss|canDismiss ? 'invisible' : ''} dialog-container`}>
            <div className="dialog-backdrop" onClick={() => { setDialogDismiss(true) }} >
            </div>
            <div className='dialog-content'>
                {children}
            </div>
        </div>
    )
}

export default Dialog