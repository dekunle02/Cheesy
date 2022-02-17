import "./button.style.scss"
import { useState } from 'react'

function BaseButton({ children, handleClick, text, outline, inverse, block, inactive, ...otherProps }) {

    return (
        <button
            className={`base-button ${text ? 'text-button' : ''}  ${inactive ? 'inactive' : ''} ${inverse ? 'inverse' : ''} ${block ? 'block' : ''} ${outline ? 'outline-button' : ''}`} 
            onClick={handleClick} 
            {...otherProps}>
            {children}
        </button>
    )
}


function Button({ children, ...otherProps }) {
    return (
        <BaseButton children={children} {...otherProps} />
    )
}


function TextButton({ children, ...otherProps }) {
    return (
        <BaseButton children={children} text {...otherProps} />
    )
}


function OutlineButton({ children, ...otherProps }) {
    return (
        <BaseButton children={children} outline {...otherProps} />
    )
}


function ButtonGroup({ items, defaultSelectedId, onItemSelected, tab }) {
    // Accept an array of items {id: , text: }
    // And a callBack for when the item is selected. By default, 1st item is selected
    // the id of the preselected button
    const [selectedId, setSelectedId] = useState(defaultSelectedId)
    const handleSelection = (id) => {
        setSelectedId(id)
        onItemSelected(id)
    }

    return (
        <div className={`${tab ? "tab-button-group" : "button-group"}`}>
            {items.map(item => (
                <button key={item.id} onClick={() => handleSelection(item.id)} className={`button-group-btn ${item.id === selectedId ? "active" : ""}`}>
                    {item.text}
                </button>
            ))}
        </div>
    )

}


export { Button, TextButton, OutlineButton, ButtonGroup }