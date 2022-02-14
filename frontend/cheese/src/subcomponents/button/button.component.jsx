import "./button.style.scss"
import { useState } from 'react'

function BaseButton({ children, handleClick, text, outline, inverse, block, ...otherProps }) {

    return (
        <button className={`base-button ${text ? 'text-button' : ''} ${inverse ? 'inverse' : ''} ${block ? 'block' : ''} ${outline ? 'outline-button' : ''}`} onClick={handleClick} {...otherProps}>
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


function PeriodButtonGroup({ items, defaultSelectedId, onItemSelected }) {
    // Accept an array of items {id: , text: }
    // And a callBack for when the item is selected. By default, 1st item is selected
    // the id of the preselected button
    const [selectedId, setSelectedId] = useState(defaultSelectedId)
    const handleSelection = (id) => {
        setSelectedId(id)
        onItemSelected(id)
    }

    return (
        <div className="period-button-group">
            {items.map(item => (
                <button key={item.id} onClick={() => handleSelection(item.id)} className={`period-button ${item.id===selectedId ? "active":""}`}>
                    {item.text}</button>
            ))}
        </div>
    )

}


export { Button, TextButton, OutlineButton, PeriodButtonGroup }