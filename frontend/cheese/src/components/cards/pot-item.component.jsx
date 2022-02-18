import './pot-item.style.scss'
import { Card, FloatCard } from '../../subcomponents/card/card.component'
import { formatMoneyNumber } from '../../api/utils'
import IconDropdown from '../../subcomponents/dropdown/icon-dropdown.component'

function PotItem({ pot, active, handleClick, handleEdit }) {
    const colors = ["#fcca46", "#2e702f", "#76c893", "#fcca46", "#A300D6", "#2B908F", "#13D8AA"]
    let potColor = pot.color_code

    if (potColor === "") {
        potColor = colors[Math.floor(Math.random() * colors.length)];
    }

    const potAmount = `${pot.currency.symbol} ${formatMoneyNumber(pot.amount)}`

    const potOptions = [{id:1, text:"Edit"}, {id:2, text:"Make a transaction"}, {id:3, text:"Delete"}]
    const onPotOtionSelected = (optionId) => {
        if (optionId === 1) {
            handleEdit()
        }
    }

    return (
        <div className={`${active ? "active" : ""} pot-item-container`}>
            {
                active ?
                    <FloatCard>
                        <div className="pot-item-content" onClick={handleClick}>
                            <div className="pot-item-header">
                                <div className="pot-icon" style={{ backgroundColor: potColor }}></div>
                                <span className="pot-title">{pot.name}</span>
                                {/* <span className="material-icons" style={{ color: potColor }}>more_vert</span> */}
                                <span className="dropdown-icon">
                                    <IconDropdown items={potOptions} iconColor={potColor} onItemSelected={onPotOtionSelected} iconName="more_vert" />
                                </span>
                            </div>
                            <h2 className="pot-amount">{potAmount}</h2>
                        </div>
                    </FloatCard>
                    :
                    <Card>
                        <div className="pot-item-content" onClick={handleClick}>
                            <div className="pot-item-header">
                                <div className={`${active ? "active" : ""} pot-icon`} style={{ backgroundColor: potColor }}></div>
                                <span className="pot-title">{pot.name}</span>
                                <span className="material-icons" style={{ color: potColor }}>more_vert</span>
                            </div>
                            <h2 className="pot-amount">{potAmount}</h2>
                        </div>
                    </Card>
            }
        </div>
    )
}

export default PotItem
