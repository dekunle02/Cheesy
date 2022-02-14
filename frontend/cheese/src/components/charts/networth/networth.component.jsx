import './networth.style.scss'
import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import Chart from "react-apexcharts";
import { FloatCard } from '../../../subcomponents/card/card.component'
import { PeriodButtonGroup } from '../../../subcomponents/button/button.component'
import { formatMoneyNumber } from "../../../api/utils"
import Dropdown from '../../../subcomponents/dropdown/dropdown.component'
import useApi from '../../../api/api'

function NetworthCard() {
    const token = useSelector(state => state.user.userData.token)
    const user = useSelector(state => state.user.userData.user)
    const api = useApi(token)

    const [currencyArr, setCurrencyArr] = useState([])
    const [totalBalanceArr, setTotalBalanceArr] = useState([])

    const [periodId, setPeriodId] = useState(1)
    const [currencyId, setCurrencyId] = useState(user.default_currency)

    const [rangeData, setRangeData] = useState([{ currency: {}, ranges: { dates: [], amounts: [] } }])

    const periodButtonItems = [
        { id: 1, text: "1W" },
        { id: 2, text: "1M" },
        { id: 3, text: "1Y" },
        { id: 4, text: "ALL" },
    ]

    const onPeriodButtonSelected = id => {
        setPeriodId(id)
    }

    useEffect(() => {
        api.getAllCurrencies().then(response => {
            if (response.status === api.SUCCESS) {
                setCurrencyArr(response.data)
            } else {
                alert("Error fetching currencies...")
            }
        })
    }, [token])

    useEffect(() => {
        api.getTotalBalance().then(response => {
            if (response.status === api.SUCCESS) {
                setTotalBalanceArr(response.data)
            } else {
                alert("Error fetching currencies...")
            }
        })
    }, [token])

    useEffect(() => {
        const period = periodButtonItems.find(period => (period.id === periodId))
        api.getNetworthRange(period.text, "granularity").then(response => {
            if (response.status === api.SUCCESS) {
                setRangeData(response.data)
            } else {
                alert("Error fetching range...")
            }
        })
        console.log("fetched")
    }, [periodId])



    const currencyDropDownItems = currencyArr.map(currency => ({ id: currency.id, text: currency.code }))
    const onCurrencySelected = id => {
        setCurrencyId(id)
    }

    const displayedBalance = () => {
        if (totalBalanceArr.length > 0) {
            const balance = totalBalanceArr.find(balance => balance.currency.id === currencyId)
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

    console.log("xAxis", xAxis())
    console.log("yAxis", yAxis())


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
                curve: 'stepline',
            },
            colors: ['#60ad5e', '#E91E63']
            ,
            xaxis: {
                type: 'string',
                categories: xAxis()
            },
            // tooltip: {
            //     x: {
            //         format: 'dd-MM-yy'
            //     },
            // },
        },

    };

    return (
        <div className="net-card-container">
            <FloatCard block>
                <div className="net-card-content">
                    <div className="net-card-top">
                        <h4 className="net-total-balance">{displayedBalance()}</h4>
                        <PeriodButtonGroup items={periodButtonItems} defaultSelectedId={periodId} onItemSelected={onPeriodButtonSelected} />
                        <Dropdown title='currency' items={currencyDropDownItems} defaultSelectedId={currencyId} onItemSelected={onCurrencySelected} />
                    </div>
                    <Chart options={chartConfig.options} series={chartConfig.series} type="area" height={250} />

                </div>
            </FloatCard>
        </div>
    )
}

export default NetworthCard