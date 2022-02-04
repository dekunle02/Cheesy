import { useState } from 'react'

import "./dropdown.style.scss"
import { FlatCard } from '../card/card.component'

/*
Drop down receives items that are an array of item objects

Item object->  {text: "", id: "" }
handleSelect -> {(selectedId) => {}}, this handles what happens when each item is selected and closes the dropdown

*/

function DropdownItem({ item, selected, handleClick, ...otherProps }) {

    return (
        <div className={`${selected ? 'selected' : ''} dropdown-item`} onClick={() => handleClick(item)}>
            <span>{item.text}</span>
        </div>
    )
}


function Dropdown({ items, handleSelect, ...otherProps }) {
    const [isCollapsed, setIsCollapsed] = useState(true)
    const [selectedItem, setSelectedItem] = useState(items[0])

    const handleItemCick = item => {
        setSelectedItem(item)
        setIsCollapsed(true)
        handleSelect(item.id)
    }

    return (
        <div className="dropdown-box">

            <div className="dropdown-selected-item-container">
                <DropdownItem selected item={selectedItem} handleClick={(selectedItem) => setIsCollapsed(!isCollapsed)} />
                <span className="material-icons" onClick={() => setIsCollapsed(!isCollapsed)}>
                    expand_more
                </span>
            </div>

            <div className={`${isCollapsed ? 'hidden' : ''} dropdown-menu-items`}>
                <FlatCard>
                    {
                        items.map(item => (
                            <DropdownItem key={item.id} item={item} handleClick={handleItemCick} />
                        ))
                    }
                </FlatCard>
            </div>

        </div>

    )
}

export default Dropdown