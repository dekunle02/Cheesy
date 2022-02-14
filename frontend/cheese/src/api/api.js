class ApiClient {

    constructor(token) {
        this.token = token
    }

    SUCCESS = 'success'
    FAILURE = 'failure'

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async getTotalBalance() {
        this.sleep(0)
        return ({
            status: this.SUCCESS,
            data: [
                {
                    currency: { id: 1, code: "USD", symbol: "$", rate: 1 },
                    amount: 5200.48
                },
                {
                    currency: { id: 2, code: "GBP", symbol: "£", rate: 0.7 },
                    amount: 4850.44
                },
                {
                    currency: { id: 3, code: "EUR", symbol: "€", rate: 1.1 },
                    amount: 5070.81
                },
            ]
        })
    }

    async getAllCurrencies() {
        this.sleep(0)
        return ({
            status: this.SUCCESS,
            data: [
                { id: 1, code: "USD", symbol: "$", rate: 1 },
                { id: 2, code: "GBP", symbol: "£", rate: 0.7 },
                { id: 3, code: "EUR", symbol: "€", rate: 1.1 },
            ]
        })
    }


    async getNetworthRange(startDate, granularity) {
        this.sleep(0)

        let ranges = null
        if (startDate === "1W") {
            ranges = {
                dates: ["07-02-2022", "08-02-2022", "09-02-2022", "10-02-2022", "11-02-2022", "12-02-2022", "13-02-2022"],
                amounts: [5045.50, 3049.23, 6000.22, 1024.21, 7400.23, 4495.22, 4005.61]
            }
        } else if (startDate === "1M") {
            ranges = {
                dates: ["01-02-2022", "02-02-2022", "03-02-2022", "04-02-2022", "05-02-2022", "06-02-2022", "07-0ma2-2022", "08-02-2022", "09-02-2022", "10-02-2022", "11-02-2022", "12-02-2022", "13-02-2022"],
                amounts: [5045.50, 3049.23, 6000.22, 1024.21, 7400.23, 4495.22, 4405.61, 3445.20, 7033.32, 4556.33, 6000.27, 5578.67, 10345.33]
            }
        } else if (startDate === "1Y") {
            ranges = {
                dates: ["1", "2", "3", "4", "5", "6"],
                amounts: [5045.50, 3049.23, 6000.22, 1024.21, 7400.23, 4495.22]
            }
        } else {
            ranges = {
                dates: ["2015", "2016", "2017", "2018", "2019", "2020", "2021"],
                amounts: [5045.50, 3049.23, 6000.22, 1024.21, 7400.23, 4495.22, 4405.61]
            }
        }


        return ({
            status: this.SUCCESS,
            data: [
                {
                    currency: { id: 1, code: "USD", symbol: "$", rate: 1 },
                    ranges: ranges
                },
                {
                    currency: { id: 2, code: "GBP", symbol: "£", rate: 0.7 },
                    ranges: ranges
                },
                {
                    currency: { id: 3, code: "EUR", symbol: "€", rate: 1.1 },
                    ranges: ranges
                }
            ]
        })

    }


}

const useApi = token => new ApiClient(token)

export default useApi
