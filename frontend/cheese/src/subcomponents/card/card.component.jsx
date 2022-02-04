import './card.style.scss'

function BaseCard({children, isFlat, isFloat, ...otherProps}) {
    return (
        <div className={`base-card ${isFlat ? 'flat-card' : ''} ${isFloat ? 'float-card' : ''}`} {...otherProps}>
            {children}
        </div>
    )
}

function Card({children, ...otherProps}) {
    return(
        <BaseCard children={children}/>
    )
}

function FlatCard({children, ...otherProps}) {
    return(
        <BaseCard children={children} isFlat/>
    )
}

function FloatCard({children, ...otherProps}) {
    return (
        <BaseCard children={children} isFloat/>
    )
}


export {Card, FlatCard, FloatCard}