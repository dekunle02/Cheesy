const formatDate = date => date.toISOString().split('T')[0]

const formatDisplayDate = date => {
    const options = { weekday: 'short', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options)
}

const formatMoneyNumber = number => {
    let numberFormatter = new Intl.NumberFormat('en-NG')
    return numberFormatter.format(number)
}

export { formatDate, formatDisplayDate, formatMoneyNumber }