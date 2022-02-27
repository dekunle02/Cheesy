import './pot-balance.style.scss'
import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import Chart from "react-apexcharts";
import { FlatCard } from '../../../subcomponents/card/card.component'
import { ButtonGroup } from '../../../subcomponents/button/button.component'
import { formatMoneyNumber } from "../../../api/utils"
import getApi from '../../../api/api'

function PotBalanceChart({ potId }) {
    const token = useSelector(state => state.user.userData.token)
   
    const [pot, setPot] = useState(null)
    const [periodId, setPeriodId] = useState(1)
    const [rangeData, setRangeData] = useState([{ dates: [], amounts: [] }])


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
        api.getPotRange(potId,period.days).then(response => {
            if (response.status === api.SUCCESS) {
                setRangeData(response.data)
            } else {
                alert("Error fetching range...")
            }
        })
    }, [token, periodId, potId])

    useEffect(() => {
        const api = getApi(token)
        api.getPot(potId).then((response) => {
            if (response.status === api.SUCCESS) {
                setPot(response.data)
            } else {
                alert("Error fetching range...")
            }
        })
    }, [potId, token])

    const colors = ["#fcca46", "#2e702f", "#76c893", "#fcca46", "#A300D6", "#2B908F", "#13D8AA"]
    let potColor = ""
    if (pot === null || pot.color_code === "") {
        potColor = colors[Math.floor(Math.random() * colors.length)];
    } else {
        potColor = pot.color_code
    }


    // const potAmount =  `${pot.currency.symbol} ${formatMoneyNumber(pot.amount)}`

    const formatLabel = (value) => {
        if (pot === null) {
            return formatMoneyNumber(value)
        }
        const currencySymbol = pot.currency.symbol
        return currencySymbol + formatMoneyNumber(value)
    }


    const chartConfig = {

        series: [{
            name: 'Balance',
            data: rangeData.amounts
        }],
        options: {
            chart: {
                height: 450,
                type: 'area',
                toolbar: {
                    show: false
                }
            },
            dataLabels: {
                enabled: false,
                formatter: formatLabel
            },
            grid: {
                show: false
            }
            ,
            stroke: {
                curve: 'smooth',
            },
            colors: [potColor, '#E91E63']
            ,
            xaxis: {
                type: 'datetime',
                categories: rangeData.dates
            },
            yaxis: {
                labels: {
                    formatter: formatLabel
                }
            }
        },

    };

    return (
        <div className="pot-balance-container">
            <FlatCard block>
                <div className="pot-balance-content">
                    <div className="pot-balance-top">
                        {pot && <span className="pot-balance-amount">{pot.name}</span>}
                        <ButtonGroup items={periodButtonItems} defaultSelectedId={periodId} onItemSelected={onPeriodButtonSelected} />
                    </div>
                    <Chart options={chartConfig.options} series={chartConfig.series} type="area" height={250} />
                </div>
            </FlatCard>
        </div>
    )
}

export default PotBalanceChart