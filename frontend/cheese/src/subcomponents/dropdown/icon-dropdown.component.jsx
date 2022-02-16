import './dropdown.style.scss'


function IconDropdown({ items, onItemSelected, iconName, iconColor }) {

    return (
        <div className="icon-dropdown">
            <span className="material-icons" style={{ color: iconColor }}>
                {iconName}
            </span>
            <div className="dropdown-content">
                {items.map(item => (
                    <div key={item.id} className="item" onClick={() => onItemSelected(item.id)}>
                        <h5>{item.text}</h5>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default IconDropdown