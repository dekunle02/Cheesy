import './card.style.scss'

function BaseCard({children, isFlat, isFloat, block,  ...otherProps}) {
    return (
        <div className={`base-card ${isFlat ? 'flat-card' : ''} ${block ? 'block' : ''} ${isFloat ? 'float-card' : ''}`} {...otherProps}>
            {children}
        </div>
    )
}

function Card({children, ...otherProps}) {
    return(
        <BaseCard children={children} {...otherProps}/>
    )
}

function FlatCard({children, ...otherProps}) {
    return(
        <BaseCard children={children} isFlat {...otherProps}/>
    )
}

function FloatCard({children, ...otherProps}) {
    return (
        <BaseCard children={children} isFloat {...otherProps}/>
    )
}


export {Card, FlatCard, FloatCard}