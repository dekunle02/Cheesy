import './dialog.style.scss'

function Dialog({ children, canShow, setCanShow, ...otherProps }) {

    return (
        <div className={`${canShow ? '' : 'invisible'} dialog-container`}>
            <div className="dialog-backdrop" onClick={() => {
                setCanShow(false)
            }} >
            </div>
            <div className='dialog-content'>
                {children}
            </div>
        </div>
    )
}

export default Dialog