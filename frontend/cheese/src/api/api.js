import axios from "axios";
import dayjs from "dayjs";
import { changeDateToString, changeStringToDate } from './utils'

class ApiClient {
    constructor(token) {
        this.axiosInstance = axios.create({
            baseURL: 'http://127.0.0.1:8000/api/v1/',
            headers: {
                "Content-Type": 'application/json',
                'Authorization': `Bearer ${token.access}`
            }
        })
    }
    SUCCESS = 'success'
    FAILURE = 'failure'

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async getTotalBalance() {
        return await this.axiosInstance.get('pots/networth/').then(response => ({
            status: this.SUCCESS,
            data: response.data
        })).catch(error => ({
            status: this.FAILURE,
            data: error.response.data
        }))
    }

    async getAllCurrencies() {
        return await this.axiosInstance.get('currencies/').then(response => ({
            status: this.SUCCESS,
            data: response.data
        })).catch(error => ({
            status: this.FAILURE,
            data: error.response.data
        }))
    }

    async getNetworthRange(days) {
        let granularity = 'day'
        let fromDate = dayjs().subtract(days, 'days')
        if (days < 31) {
            granularity = 'day'
        }
        else if (days > 30 && days < 366) {
            granularity = 'month'
        } else {
            granularity = 'year'
            fromDate = dayjs().subtract(5, 'years')
        }
        return await this.axiosInstance.get(
            'pots/networthrange',
            { params: { from: changeDateToString(fromDate), granularity: granularity } }
        ).then(response => ({
            status: this.SUCCESS,
            data: response.data
        })).catch(error => ({
            status: this.FAILURE,
            data: error.response.data
        }))
    }


    async getPotRange(potId, days) {
        let granularity = 'day'
        let fromDate = dayjs().subtract(days, 'days')
        if (days < 31) {
            granularity = 'day'
        }
        else if (days > 30 && days < 366) {
            granularity = 'month'
        } else {
            granularity = 'year'
            fromDate = dayjs().subtract(5, 'years')
        }
        return await this.axiosInstance.get(
            `pots/${potId}/range/`,
            { params: { from: changeDateToString(fromDate), granularity: granularity } }
        ).then(response => ({
            status: this.SUCCESS,
            data: response.data
        })).catch(error => ({
            status: this.FAILURE,
            data: error.response.data
        }))
    }


    async getRecentTransactions(kind) {
        return await this.axiosInstance.get(
            'records/',
            { params: { limit: 20, kind: kind } }
        ).then(response => ({
            status: this.SUCCESS,
            data: response.data
        })).catch(error => ({
            status: this.FAILURE,
            data: error.response.data
        }))
    }

    async getRecentTransactionsByPot(potId, kind) {
        return await this.axiosInstance.get(
            'records/',
            { params: { limit: 20, kind: kind, pot: potId } }
        ).then(response => ({
            status: this.SUCCESS,
            data: response.data
        })).catch(error => ({
            status: this.FAILURE,
            data: error.response.data
        }))
    }

    async getRecurringTransactionsByPot(potId, kind) {
        return await this.axiosInstance.get(
            'transactions/',
            { params: { is_recurring: true, pot: potId, kind: kind } }
        ).then(response => ({
            status: this.SUCCESS,
            data: response.data
        })).catch(error => ({
            status: this.FAILURE,
            data: error.response.data
        }))
    }

    async getSpendingHabitSummary(days, currencyId) {
        let granularity = 'day'
        let fromDate = dayjs().subtract(days, 'days')
        if (days < 31) {
            granularity = 'day'
        }
        else if (days > 30 && days < 366) {
            granularity = 'month'
        } else {
            granularity = 'year'
            fromDate = dayjs().subtract(5, 'years')
        }
        return await this.axiosInstance.get('records/range', {
            params: { from: changeDateToString(fromDate), granularity: granularity, currency: currencyId }
        }).then(response => ({
            status: this.SUCCESS,
            data: response.data
        })).catch(error => ({
            status: this.FAILURE,
            data: error.response.data
        }))
    }

    async getAllTransactionRecords(kind, query) {
        return await this.axiosInstance.get("records/", {params: {kind: kind}}).then(response => ({
            status: this.SUCCESS,
            data: response.data
        })).catch(error => ({
            status: this.FAILURE,
            data: error.response.data
        }))
    }


    async getRecurringTransactionById(transactionId) {
        return await this.axiosInstance.get(`transactions/${transactionId}`).then(response => ({
            status: this.SUCCESS,
            data: response.data
        })).catch(error => ({
            status: this.FAILURE,
            data: error.response.data
        }))
    }

    async postNewTransaction(transactionData) {
        if (transactionData.kind === 'transfer'){
            return await this.axiosInstance.post('transfers/', transactionData).then(response => ({
                status: this.SUCCESS,
                data: response.data
            })).catch(error => ({
                status: this.FAILURE,
                data: error.response.data
            }))
        }

        if (transactionData.kind === 'inflow') {
            transactionData = {pot:transactionData.fromPot, ...transactionData}
        } else if (transactionData.kind === 'outflow') {
            transactionData = {pot:transactionData.toPot, ...transactionData}
        }
        return await this.axiosInstance.post(`transactions/`, transactionData).then(response => ({
            status: this.SUCCESS,
            data: response.data
        })).catch(error => ({
            status: this.FAILURE,
            data: error.response.data
        }))
    }

    async deleteTransaction(transactionId) {
        return await this.axiosInstance.delete(`transactions/${transactionId}/`).then(response => ({
            status: this.SUCCESS,
            data:response.data
        })).catch(error => ({
            status: this.FAILURE,
            data: error.response.data
        }))
    }

    async patchRecurringTransaction(transactionId, transactionData) {
        if (transactionData.kind === 'inflow') {
            transactionData = {pot:transactionData.fromPot, ...transactionData}
        } else if (transactionData.kind === 'outflow') {
            transactionData = {pot:transactionData.toPot, ...transactionData}
        }

        return await this.axiosInstance.patch(`transactions/${transactionId}/`, transactionData).then(response => ({
            status: this.SUCCESS,
            data:response.data
        })).catch(error => ({
            status: this.FAILURE,
            data: error.response.data
        }))
    }



    async getAllPots() {
        return await this.axiosInstance.get('pots/')
            .then(response => ({ status: this.SUCCESS, data: response.data }))
            .catch(error => ({ status: this.FAILURE, data: error.response.data }))
    }

    async getAllPotsInCurrency(currencyId) {
        return await this.axiosInstance.get(
            'pots/',
            { params: { currency: currencyId } })
            .then(response => ({ status: this.SUCCESS, data: response.data }))
            .catch(error => ({ status: this.FAILURE, data: error.response.data }))
    }

    async getPot(potId) {
        return await this.axiosInstance.get(`/pots/${potId}`)
            .then(response => ({
                status: this.SUCCESS,
                data: response.data
            })).catch(error => ({
                status: this.FAILURE,
                data: error.response.data
            }))
    }

    async postNewPot(potData) {
        return await this.axiosInstance.post(`/pots/`, potData).then(response => ({
            status: this.SUCCESS,
            data: response.data
        })).catch(error => ({
            status: this.FAILURE,
            data: error.response.data
        }))
    }

    async patchPot(potId, potData) {
        return await this.axiosInstance.patch(`/pots/${potId}/`, potData).then(response => ({
            status: this.SUCCESS,
            data: response.data
        })).catch(error => ({
            status: this.FAILURE,
            data: error.response.data
        }))
    }

    async deletePot(potId) {
        return await this.axiosInstance.delete(`/pots/${potId}/`).then(response => ({
            status: this.SUCCESS,
        })).catch(error => ({
            status: this.FAILURE,
            data: error.response.data
        }))
    }

}

const getApi = token => new ApiClient(token)

export default getApi
