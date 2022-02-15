import './spending-habit.style.scss'
import Chart from 'react-apexcharts'
import { useState, useEffect } from 'react'
import useApi from '../../../api/api'
import { useSelector } from 'react-redux'
import {formatMoneyNumber} from '../../../api/utils'

function SpendingHabitChart() {
    const token = useSelector(state => state.user.userData.token)
    const user = useSelector(state => state.user.userData.user)
    const api = useApi(token)
    const [habitArr, setHabitArr] = useState([])
    const [currencyId, setCurrencyId] = useState(user.default_currency)
    const [currencyArr, setCurrencyArr] = useState([])

    useEffect(() => {
        api.getTransactionNet("startDate", "granularity", "currencyId").then((response) => {
            if (response.status === api.SUCCESS) {
                setHabitArr(response.data)
            } else {
                alert('Error fetching spending habits...')
            }
        })
    }, [currencyId])

    useEffect(() => {
        api.getAllCurrencies().then(response => {
            setCurrencyArr(response.data)
        })
    }, [])

    const income = () => {
        if (habitArr.length === 0) { return [] }
        return habitArr.records.in
    }

    const expense = () => {
        if (habitArr.length === 0) { return [] }
        return habitArr.records.out
    }

    const formatLabel = (value) => {
        if (currencyArr.length === 0) {return formatMoneyNumber(value)}
        const currencySymbol =( currencyArr.find(cur => cur.id === currencyId)).symbol
        return currencySymbol + formatMoneyNumber(value)
    }


    const chartConfig = {
        series: [
            { name: "Income", data: income() },
            { name: "Expense", data: expense() },
        ],
        options: {
            plotOptions: {
                bar: {
                    borderRadius: 4,
                    horizontal: false,
                },
                labels: {
                    show: true,
                    value: {
                        formatter: formatLabel
                    }
                }
                
            },
            legend: {
                show: true,
                position: 'top',
                horizontalAlign: 'end', 
                floating: false,
                fontSize: '14px',
                fontFamily: 'Helvetica, Arial',
                fontWeight: 400,
                width: undefined,
                height: undefined,
                offsetX: 0,
                offsetY: 0
            },
            dataLabels: {
                enabled: false
            },
            grid: {
                show: false
            },
            xaxis: {
                categories: habitArr.dates
            }
        }
    }

    return (
        <div className="spending-habits-container">
            <h4 className="spending-habits-title">Spending Habits</h4>
            <Chart options={chartConfig.options} series={chartConfig.series} type="bar" height="300" width="420" />
        </div>

    )
}

export default SpendingHabitChart