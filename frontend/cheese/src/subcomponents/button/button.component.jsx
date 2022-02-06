import "./button.style.scss"

function BaseButton({ children, handleClick, text, outline, inverse, block, ...otherProps }) {

    return (
        <button className={`base-button ${text ? 'text-button' : ''} ${inverse ? 'inverse' : ''} ${block ? 'block' : ''} ${outline ? 'outline-button' : ''}`} onClick={handleClick} {...otherProps}>
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
        <BaseButton children={children} text {...otherProps}/>
    )
}


function OutlineButton({children, ...otherProps}) {
    return (
        <BaseButton children={children} outline {...otherProps}/>
    )
}


export {Button, TextButton, OutlineButton}