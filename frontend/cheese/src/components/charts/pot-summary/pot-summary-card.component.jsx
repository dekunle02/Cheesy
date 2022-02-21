import './pot-summary-card.style.scss'
import { useState, useEffect } from 'react'
import Chart from 'react-apexcharts'
import { useSelector } from 'react-redux'
import { FlatCard } from '../../../subcomponents/card/card.component'
import Dropdown from '../../../subcomponents/dropdown/dropdown.component'
import { formatMoneyNumber } from '../../../api/utils'
import getApi from '../../../api/api'

function PotSummaryDonut() {
    const user = useSelector(state => state.user.userData.user)
    const token = useSelector(state => state.user.userData.token)

    const [potArr, setPotArr] = useState([])
    const [currencyArr, setCurrencyArr] = useState([])
    const [currencyId, setCurrencyId] = useState(user.default_currency)


    useEffect(() => {
        const api = getApi(token)
        api.getAllCurrencies().then(response => {
            if (response.status === api.SUCCESS) {
                setCurrencyArr(response.data)
            } else {
                alert("Error fetching currencies...")
            }
        })
    }, [token])

    useEffect(() => {
        const api = getApi(token)
        api.getAllPotsInCurrency(currencyId).then(response => {
            if (response.status === api.SUCCESS) {
                setPotArr(response.data)
            } else {
                alert("Error fetching Pots...")
            }
        })
    }, [token, currencyId])

    const currencyDropDownItems = currencyArr.map(currency => ({ id: currency.id, text: currency.code }))
    
    const onCurrencySelected = id => {
        setCurrencyId(id)
    }

    const series = () => {
        return potArr.map(pot => parseFloat(pot.amount))
    }

    const labels = () => {
        return potArr.map(pot => pot.name)
    }

    const colors = () => {
        return potArr.map(pot => pot.color_code)
    }

    const labelFormatter = (value) => {
        if (currencyArr.length > 0) {
            const currency = currencyArr.find(c => c.id === currencyId)
            return `${currency.symbol}${formatMoneyNumber(value)}`
        }
        return formatMoneyNumber(value)
    }

    const chartConfig = {
        options: {
            chart: {
                id: `donut-${Math.random()}` // should be a different one every re-render
              },
            plotOptions: {
                pie: {
                    donut: {
                        labels: {
                            show: true,
                            value: {
                                formatter: labelFormatter
                            }
                        }
                    },
                    expandOnClick: true
                },

            },
            colors:colors(),
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