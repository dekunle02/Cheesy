import './pot-summary-card.style.scss'
import Chart from 'react-apexcharts'
import { FlatCard } from '../../../subcomponents/card/card.component'
import { formatMoneyNumber } from '../../../api/utils'

function PotSummaryDonut() {


    const options = {
        plotOptions: {
          pie: {
            donut: {
              labels: {
                show: true,
                value: {
                  formatter: function(value){ 
                      return formatMoneyNumber(value)}
                }
              }
            }
          },
          
        },
        theme: {
            mode: 'light', 
            palette: 'palette7', 
            monochrome: {
                enabled: false,
                color: '#255aee',
                shadeTo: 'light',
                shadeIntensity: 0.65
            },
        },
        labels: ['Monzo', 'HSBC', 'GTB DOM', 'PAYPAL', 'UBA']
        
      }
    const series = [4400, 5500, 4123, 1700, 1500]


    return (
        <div className="donut-container">
            <FlatCard>
                <div className="donut-content">
                    <div className="donut-title">Pots</div>
                    <Chart options={options} series={series} type="donut" width="380" />
                </div>
            </FlatCard>
        </div>
    )

}

export default PotSummaryDonut