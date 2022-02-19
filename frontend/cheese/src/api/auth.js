import axios from 'axios'


class AuthClient {
    SUCCESS = 'success'
    FAILURE = 'failure'
    axiosInstance = axios.create({ baseURL: 'http://127.0.0.1:8000/api/v1/' })


    async signUp(username, email, password) {
        return await this.axiosInstance.post('signup/', {
            username: username,
            email: email,
            password: password
        }).then(response => (
            {
                status: this.SUCCESS,
                data: response.data
            }
        )).catch(error => ({
            status: this.FAILURE,
            data: error.response.data
        }))
    }

    async signIn(email, password) {
        return await this.axiosInstance.post('signin/', {
            email: email,
            password: password
        }).then(response => (
            {
                status: this.SUCCESS,
                data: response.data
            }
        )).catch(error => ({
            status: this.FAILURE,
            data: error.response.data
        }))

    }

    async validateToken(token) {
        const data = { token: token.access }
        return await this.axiosInstance.post('token/verify/', data).then(response => ({
            status: this.SUCCESS,
            data: true
        })).catch(error => ({
            status: this.FAILURE,
            data: false
        }))
    }
}

const useAuth = () => new AuthClient()
export default useAuth