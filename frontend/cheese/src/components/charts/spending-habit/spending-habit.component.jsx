import './spending-habit.style.scss'
import Chart from 'react-apexcharts'
import { useState, useEffect } from 'react'
import getApi from '../../../api/api'
import { ButtonGroup } from '../../../subcomponents/button/button.component'
import { useSelector } from 'react-redux'
import { formatMoneyNumber } from '../../../api/utils'

function SpendingHabitChart() {
    const token = useSelector(state => state.user.userData.token)
    const user = useSelector(state => state.user.userData.user)
    const defaultCurrency = user.default_currency
    const [currencyArr, setCurrencyArr] = useState([])

    const [habitArr, setHabitArr] = useState([])
    const [periodId, setPeriodId] = useState(1)
    const periodButtonItems = [
        { id: 1, text: "1W", days: 7 },
        { id: 2, text: "1M", days: 30 },
        { id: 3, text: "1Y", days: 365 },
        { id: 4, text: "ALL", days: 1800 },
    ]

    const onPeriodButtonSelected = id => {
        setPeriodId(id)
    }

    useEffect(() => {
        const api = getApi(token)
        const period = periodButtonItems.find(period => (period.id === periodId))
        api.getSpendingHabitSummary(period.days, defaultCurrency).then(response => {
            if (response.status === api.SUCCESS) {
                setHabitArr(response.data)
            } else {
                alert("Error fetching Spending Habits Array")
            }
        })
    }, [periodId, token, defaultCurrency])

    useEffect(() => {
        const api = getApi(token)
        api.getAllCurrencies().then(response => {
            setCurrencyArr(response.data)
        })
    }, [token])

    const income = () => {
        if (habitArr.length === 0) { return [] }
        return habitArr.summaries.map(s => s.inflow)
    }

    const expense = () => {
        if (habitArr.length === 0) { return [] }
        return habitArr.summaries.map(s => s.outflow)
    }

    const formatLabel = (value) => {
        if (currencyArr.length === 0) { return formatMoneyNumber(value) }
        const currencySymbol = (currencyArr.find(cur => cur.id === defaultCurrency)).symbol
        return currencySymbol + formatMoneyNumber(value)
    }


    const chartConfig = {
        series: [
            { name: "Income", data: income() },
            { name: "Expense", data: expense() },
        ],
        options: {
            chart: {
                type: 'line',
                toolbar: {
                    show: false
                }
            },
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
            stroke: {
                curve: 'smooth',
            },
            legend: {
                show: true,
                position: 'bottom',
                horizontalAlign: 'end',
                floating: false,
                fontSize: '14px',
                fontFamily: 'Helvetica, Arial',
                fontWeight: 400,
                width: undefined,
                height: undefined,
                offsetX: 10,
                offsetY: 10
            },
            dataLabels: {
                enabled: false
            },
            grid: {
                show: false
            },
            xaxis: {
                categories: habitArr.dates,
                type: 'datetime'
            }
        }
    }

    return (
        <div className="spending-habits-container">
            <div className="spending-habits-heading">
                <h4 className="spending-habits-title">Spending Habits</h4>
                <ButtonGroup items={periodButtonItems} defaultSelectedId={periodId} onItemSelected={onPeriodButtonSelected} />
            </div>
            <Chart options={chartConfig.options} series={chartConfig.series} type="line" height="300" width="500" />
        </div>

    )
}

export default SpendingHabitChart