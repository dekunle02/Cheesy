import './pot-summary-card.style.scss'
import { useState, useEffect } from 'react'
import Chart from 'react-apexcharts'
import { useSelector } from 'react-redux'
import { FlatCard } from '../../../subcomponents/card/card.component'
import Dropdown from '../../../subcomponents/dropdown/dropdown.component'
import { formatMoneyNumber } from '../../../api/utils'
import useApi from '../../../api/api'

function PotSummaryDonut() {
    const user = useSelector(state => state.user.userData.user)
    const token = useSelector(state => state.user.userData.token)

    const [potArr, setPotArr] = useState([])
    const [currencyArr, setCurrencyArr] = useState([])
    const [currencyId, setCurrencyId] = useState(user.default_currency)

    const api = useApi(token)

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
        api.getAllPotsInCurrency(currencyId).then(response => {
            if (response.status === api.SUCCESS) {
                setPotArr(response.data)
            } else {
                alert("Error fetching Pots...")
            }
        })
    }, [currencyId])

    const currencyDropDownItems = currencyArr.map(currency => ({ id: currency.id, text: currency.code }))
    const onCurrencySelected = id => {
        setCurrencyId(id)
    }

    const series = () => {
        if (potArr.length === 0) { return [] }
        return potArr.map(pot => pot.amount)
    }

    const labels = () => {
        if (potArr.length === 0) { return [] }
        return potArr.map(pot => pot.name)
    }

    const chartConfig = {
        options: {
            plotOptions: {
                pie: {
                    donut: {
                        labels: {
                            show: true,
                            value: {
                                formatter: function (value) {
                                    return formatMoneyNumber(value)
                                }
                            }
                        }
                    }
                },

            },
            labels: labels()
        },
        series: series()
    }


    return (
        <div className="donut-container">
            <FlatCard>
                <div className="donut-content">
                    <div className="donut-heading">
                        <span className="donut-title">Your Pots</span>
                        <Dropdown title='currency' items={currencyDropDownItems} defaultSelectedId={currencyId} onItemSelected={onCurrencySelected} />
                    </div>
                    <Chart options={chartConfig.options} series={chartConfig.series} type="donut" width="360" />
                </div>
            </FlatCard>
        </div>
    )

}

export default PotSummaryDonut