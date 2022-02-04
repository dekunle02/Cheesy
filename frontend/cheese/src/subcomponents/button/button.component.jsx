import "./button.style.scss"

function BaseButton({ children, handleClick, isText, isOutline, ...otherProps }) {

    return (
        <button className={`base-button ${isText ? 'text-button' : ''} ${isOutline ? 'outline-button' : ''}`} onClick={handleClick} {...otherProps}>
            {children}
        </button>
    )
}


function Button({ children, ...otherProps }) {
    return (
        <BaseButton children={children} {...otherProps}/>
    )
}


function TextButton({ children, ...otherProps }) {
    return (
        <BaseButton children={children} isText {...otherProps}/>
    )
}


function OutlineButton({children, ...otherProps}) {
    return (
        <BaseButton children={children} isOutline {...otherProps}/>
    )
}


export {Button, TextButton, OutlineButton}