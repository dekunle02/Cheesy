import "./dropdown.style.scss"

function Dropdown({ title, items, onItemSelected, defaultSelectedId }) {
    let defaultSelectedItem = items.find(item => (item.id === defaultSelectedId))

    const handleChange = event => {
        const selectedItem = items.find(item => item.text === event.target.value)
        onItemSelected(selectedItem.id)
    }

    return (
        <div>
            {
                defaultSelectedItem ?
                    <select className="dropdown" name={title} id={title} onChange={handleChange} defaultValue={defaultSelectedItem.text} >
                        {items.map((item) => <option key={item.id} value={item.text}>{item.text}</option>)}
                    </select>
                    : ""
            }
        </div>
    )
}

export default Dropdown