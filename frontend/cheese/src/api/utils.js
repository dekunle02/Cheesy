import dayjs from 'dayjs'

const formatMoneyNumber = number => {
    let numberFormatter = new Intl.NumberFormat('en-NG')
    return numberFormatter.format(number)
}

function changeStringToDate(str){
    return dayjs(str)
}

function changeDateToString(d){
    return d.format('YYYY-MM-DD')
}

export {formatMoneyNumber, changeStringToDate, changeDateToString }