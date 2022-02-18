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
        await this.sleep(0)
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

    async getRecentTransactions() {
        return {
            status: this.SUCCESS,
            data: [
                { id: 1, date: "2022-02-14", transaction: { title: "Commission", amount: 200, kind: 'inflow', pot: { name: "Monzo", currency: { symbol: "£" } } } },
                { id: 2, date: "2022-02-14", transaction: { title: "Taxi", amount: 20, kind: 'outflow', pot: { name: "HSBC", currency: { symbol: "£" } } } },
                { id: 3, date: "2022-02-12", transaction: { title: "Remittance", amount: 64, kind: 'inflow', pot: { name: "Credit", currency: { symbol: "£" } } } },
                { id: 4, date: "2022-02-12", transaction: { title: "Gift", amount: 50, kind: 'inflow', pot: { name: "GTB", currency: { symbol: "€" } } } },
                { id: 5, date: "2022-02-11", transaction: { title: "Royalties", amount: 60, kind: 'inflow', pot: { name: "Monzo", currency: { symbol: "£" } } } },
            ]
        }
    }

    async getRecentTransactionsByPot(potId) {
        return {
            status: this.SUCCESS,
            data: [
                { id: 1, date: "2022-02-14", transaction: { title: "Commission", amount: 200, kind: 'inflow', pot: { name: "Monzo", currency: { symbol: "£" } } } },
                { id: 2, date: "2022-02-14", transaction: { title: "Taxi", amount: 20, kind: 'outflow', pot: { name: "HSBC", currency: { symbol: "£" } } } },
                { id: 3, date: "2022-02-12", transaction: { title: "Remittance", amount: 64, kind: 'inflow', pot: { name: "Credit", currency: { symbol: "£" } } } },
                { id: 4, date: "2022-02-12", transaction: { title: "Gift", amount: 50, kind: 'inflow', pot: { name: "GTB", currency: { symbol: "€" } } } },
                { id: 5, date: "2022-02-11", transaction: { title: "Royalties", amount: 60, kind: 'inflow', pot: { name: "Monzo", currency: { symbol: "£" } } } },
            ]
        }
    }

    async getRecurringTransactionsByPot(potId, kind) {
        return {
            status: this.SUCCESS,
            data: [
                { id: 1, title: "Royalties", amount: 250, kind: 'inflow', period:"month", period_count:3, pot: { name: "GTB Dom", currency: { symbol: "$" } },is_recurring:true, treat_date:'06-01-2022' },
                { id: 2, title: "Rent", amount: 650, kind: 'outflow', period:"month", period_count:1,pot: { name: "HSBC", currency: { symbol: "£" } },is_recurring:true, treat_date:'04-05-2021' },
                { id: 3, title: "Train", amount: 250, kind: 'outflow', period:"week", period_count:1, pot: { name: "Monzo", currency: { symbol: "£" } },is_recurring:true, treat_date:'03-02-2022' },
                { id: 4, title: "Salary", amount: 2100, kind: 'inflow', period:"month", period_count:1, pot: { name: "HSBC", currency: { symbol: "£" } },is_recurring:true, treat_date:'15-01-2022' },
                { id: 5, title: "Internet", amount: 200, kind: 'outflow', period:"month", period_count:1, pot: { name: "Monzo", currency: { symbol: "£" } },is_recurring:true, treat_date:'5-02-2022' },
                { id: 6, title: "Photoshop", amount: 200, kind: 'outflow', period:"month", period_count:1, pot: { name: "Paypal", currency: { symbol: "£" } }, is_recurring:true, treat_date:'04-02-2022' },
            ]
        }
    }

    async getTransactionNet(startDate, granularity, currencyId) {
        return {
            status: this.SUCCESS,
            data: {
                dates: ["14-02-2022", "13-02-2022", "12-02-2022", "11-02-2022", "10-02-2022", "09-02-2022"],
                records: {
                    in: [100, 10, 50, 0, 0, 20],
                    out: [10, 60, 20, 0, 5, 12]
                }
            }
        }
    }

    async getAllTransactionRecords(startDate, kind, query){
        return {
            status: this.SUCCESS,
            data: [
                { id: 1, title: "Royalties", amount: 250, kind: 'inflow', period:"month", period_count:3, pot: { name: "GTB Dom", currency: { symbol: "$" } },is_recurring:true, treat_date:'06-01-2022' },
                { id: 2, title: "Rent", amount: 650, kind: 'outflow', period:"month", period_count:1,pot: { name: "HSBC", currency: { symbol: "£" } },is_recurring:true, treat_date:'04-05-2021' },
                { id: 3, title: "Train", amount: 250, kind: 'outflow', period:"week", period_count:1, pot: { name: "Monzo", currency: { symbol: "£" } },is_recurring:true, treat_date:'03-02-2022' },
                { id: 4, title: "Salary", amount: 2100, kind: 'inflow', period:"month", period_count:1, pot: { name: "HSBC", currency: { symbol: "£" } },is_recurring:true, treat_date:'15-01-2022' },
                { id: 5, title: "Internet", amount: 200, kind: 'outflow', period:"month", period_count:1, pot: { name: "Monzo", currency: { symbol: "£" } },is_recurring:true, treat_date:'5-02-2022' },
                { id: 6, title: "Photoshop", amount: 200, kind: 'outflow', period:"month", period_count:1, pot: { name: "Paypal", currency: { symbol: "£" } }, is_recurring:true, treat_date:'04-02-2022' },
                { id: 7, title: "Royalties", amount: 250, kind: 'inflow', period:"month", period_count:3, pot: { name: "GTB Dom", currency: { symbol: "$" } },is_recurring:true, treat_date:'06-01-2022' },
                { id: 8, title: "Rent", amount: 650, kind: 'outflow', period:"month", period_count:1,pot: { name: "HSBC", currency: { symbol: "£" } },is_recurring:true, treat_date:'04-05-2021' },
                { id: 9, title: "Train", amount: 250, kind: 'outflow', period:"week", period_count:1, pot: { name: "Monzo", currency: { symbol: "£" } },is_recurring:true, treat_date:'03-02-2022' },
                { id: 10, title: "Salary", amount: 2100, kind: 'inflow', period:"month", period_count:1, pot: { name: "HSBC", currency: { symbol: "£" } },is_recurring:true, treat_date:'15-01-2022' },
                { id: 11, title: "Internet", amount: 200, kind: 'outflow', period:"month", period_count:1, pot: { name: "Monzo", currency: { symbol: "£" } },is_recurring:true, treat_date:'5-02-2022' },
                { id: 12, title: "Photoshop", amount: 200, kind: 'outflow', period:"month", period_count:1, pot: { name: "Paypal", currency: { symbol: "£" } }, is_recurring:true, treat_date:'04-02-2022' },
            ]
        }
    }

    async getRecurringTransactionById(transactionId){
        return {
            status: this.SUCCESS,
            data: { id: 1, title: "Royalties", amount: 250, kind: 'inflow', period:"month", period_count:3, pot: { id: 2, name: "GTB Dom", currency: { symbol: "$" } },is_recurring:true, treat_date:'2022-01-06' },
        }
    }

    async postNewTransaction(transactionData) {
        return {
            status: this.SUCCESS
        }
    }

    async patchRecurringTransaction(transactionId, transactionData) {
        console.log(transactionData)
        await this.sleep(2000)

        return{
            status: this.SUCCESS
        }
    }



    async getAllPots() {

        return {
            status: this.SUCCESS,
            data: [
                { id: 1, name: "Monzo", currency: { id: 2, code: "GBP", symbol: "£", rate: 0.7 }, amount: 230, color_code: "#0000ff" },
                { id: 2, name: "Paypal", currency: { id: 2, code: "GBP", symbol: "£", rate: 0.7 }, amount: 550, color_code: "" },
                { id: 3, name: "HSBC", currency: { id: 2, code: "GBP", symbol: "£", rate: 0.7 }, amount: 2300, color_code: "#2fffa1" },
                { id: 4, name: "GTB Dom", currency: { id: 1, code: "USD", symbol: "$", rate: 1 }, amount: 1300, color_code: "#ffaf17" }
            ]
        }

    }

    async getPot(potId) {
        let data = {}
        switch (potId) {
            case 1:
                data = { id: 1, name: "Monzo", currency: { id: 2, code: "GBP", symbol: "£", rate: 0.7 }, amount: 230, color_code: "#0000ff" }
                break
            case 2:
                data = { id: 2, name: "Paypal", currency: { id: 2, code: "GBP", symbol: "£", rate: 0.7 }, amount: 550, color_code: "" }
                break
            case 3:
                data = { id: 3, name: "HSBC", currency: { id: 2, code: "GBP", symbol: "£", rate: 0.7 }, amount: 2300, color_code: "#2fffa1" }
                break
            default:
                data = { id: 4, name: "GTB Dom", currency: { id: 1, code: "USD", symbol: "$", rate: 1 }, amount: 1300, color_code: "#ffaf17" }
                break
        }
        return {
            status: this.SUCCESS,
            data: data
        }
    }

    async postNewPot(potData) {
        this.sleep(2000)
        console.log("postNewPot", potData)

        return {
            status: this.SUCCESS,
            data:{ id: Math.floor(Math.random() * 50), ...potData }
        }
    }
    async patchPot(potId, potData){
        this.sleep(2000)
        console.log("patchPot", potData)

        return {
            status: this.SUCCESS,
            data:{potData}
        }
    }

    async deletePot(potId){
        this.sleep(2000)
        return {
            status: this.SUCCESS,
        }
    }



    async getPotRange(potId, startDate, granularity) {
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
                dates: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
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
            data: ranges
        })
    }

    async getAllPotsInCurrency(currencyId) {
        return {
            status: this.SUCCESS,
            data: [
                { id: 1, name: "Monzo", amount: 230 },
                { id: 1, name: "Paypal", amount: 550 },
                { id: 1, name: "HSBC", amount: 2300 },
                { id: 1, name: "GTB Dom", amount: 1300 }
            ]
        }
    }

    


}

const useApi = token => new ApiClient(token)

export default useApi
