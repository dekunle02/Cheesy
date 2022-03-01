import './networth.style.scss'
import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import Chart from "react-apexcharts";
import { FlatCard } from '../../../subcomponents/card/card.component'
import { ButtonGroup } from '../../../subcomponents/button/button.component'
import { formatMoneyNumber } from "../../../api/utils"
import Dropdown from '../../../subcomponents/dropdown/dropdown.component'
import getApi from '../../../api/api'

function NetworthCard() {
    const token = useSelector(state => state.user.userData.token)
    const user = useSelector(state => state.user.userData.user)

    const [currencyArr, setCurrencyArr] = useState([])
    const [totalBalanceArr, setTotalBalanceArr] = useState([])

    const [periodId, setPeriodId] = useState(1)
    const [currencyId, setCurrencyId] = useState(user.default_currency)

    const [rangeData, setRangeData] = useState([{ currency: {}, ranges: { dates: [], amounts: [] } }])

    const periodButtonItems = [
        { id: 1, text: "1W", days:7 },
        { id: 2, text: "1M" , days: 30},
        { id: 3, text: "1Y" , days: 365},
        { id: 4, text: "ALL", days: 1800},
    ]

    const onPeriodButtonSelected = id => {
        setPeriodId(id)
    }

    useEffect(() => {
        const api = getApi(token)
        api.getAllCurrencies().then(response => {
            if (response.status === api.SUCCESS) {
                setCurrencyArr(response.data)
                if (user.default_currency) {
                    setCurrencyId(user.default_currency)
                } else{
                    setCurrencyId(response.data[0].id)
                }
            } else {
                alert("Error fetching currencies...")
            }
        })
    }, [token])

    useEffect(() => {
        const api = getApi(token)
        api.getTotalBalance().then(response => {
            if (response.status === api.SUCCESS) {
                setTotalBalanceArr(response.data)
            } else {
                alert("Error fetching currencies...")
            }
        })
    }, [token])

    useEffect(() => {
        const api = getApi(token)
        const period = periodButtonItems.find(period => (period.id === periodId))
        api.getNetworthRange(period.days).then(response => {
            if (response.status === api.SUCCESS) {
                setRangeData(response.data)
            } else {
                alert("Error fetching range...")
            }
        })
    }, [token,periodId])



    const currencyDropDownItems = currencyArr.map(currency => ({ id: currency.id, text: currency.code }))
    const onCurrencySelected = id => {
        setCurrencyId(id)
    }

    const displayedBalance = () => {
        if (totalBalanceArr.length > 0 && currencyId) {
            const balance = totalBalanceArr.find(balance => (balance.currency.id === currencyId))
            return `${balance.currency.symbol} ${formatMoneyNumber(balance.amount)}`
        }
        else return "0"
    }

    const xAxis = () => {
        return rangeData[0].ranges.dates
    }

    const yAxis = () => {
        const range = rangeData.find(d => d.currency.id === currencyId)
        if (range === undefined){
            return []
        }
        return range.ranges.amounts
    }

    function formatChartMoney (value) {
        if (currencyArr.length > 0 && currencyId) {
            const money = formatMoneyNumber(value)
            const selectedCurrency = currencyArr.find(currency => currency.id === currencyId)
            return `${selectedCurrency.symbol}${money}`
        }
        else return value
    }

    const chartConfig = {

        series: [{
            name: 'Balance',
            data: yAxis()
        }
        ],
        options: {
            chart: {
                height: 450,
                type: 'area',
                toolbar: {
                    show: false
                }
            },
            dataLabels: {
                enabled: false
            },
            grid: {
                show: false
            }
            ,
            stroke: {
                curve: 'smooth',
            },
            colors: ['#60ad5e', '#E91E63']
            ,
            xaxis: {
                type: 'datetime',
                categories: xAxis()
            },
            yaxis: {
                labels: {
                    formatter: formatChartMoney
                }
            }
        },

    };

    return (
        <div className="net-card-container">
            <FlatCard block>
                <div className="net-card-content">
                    <div className="net-card-top">
                        <h4 className="net-total-balance">{displayedBalance()}</h4>
                        <ButtonGroup items={periodButtonItems} defaultSelectedId={periodId} onItemSelected={onPeriodButtonSelected} />
                        <Dropdown title='currency' items={currencyDropDownItems} defaultSelectedId={currencyId} onItemSelected={onCurrencySelected} />
                    </div>
                    <Chart options={chartConfig.options} series={chartConfig.series} type="area" height={250} />

                </div>
            </FlatCard>
        </div>
    )
}

export default NetworthCard