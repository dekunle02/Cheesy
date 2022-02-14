function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

class AuthClient {
    // constructor(token) {
    //     this.token = token
    // }

    SUCCESS = 'success'
    FAILURE = 'failure'

    randomPicUrl = "https://static.wikia.nocookie.net/marvelcinematicuniverse/images/0/0e/Warrior_Thanos.jpg"

    
    /**
     * response expected 
     * user: {id, email,username, photo_url, default_currency}
     * token: {access: , refresh: }
     */
    async signUp(username, email, password) {
        await sleep(0);
        return {
            status: this.SUCCESS,
            data: {
                user: {
                    id: 1,
                    email: "dekunle.py@gmail.com",
                    username: "Samad",
                    photo_url: this.randomPicUrl,
                    default_currency: 1
                },
                token: { refresh: 1, access: 1 }
            }
        }

    }

    async signIn(email, password) {
        await sleep(0);
        return {
            status: this.SUCCESS,
            data: {
                user: {
                    id: 1,
                    email: "dekunle.py@gmail.com",
                    username: "Samad",
                    photo_url: this.randomPicUrl,
                    default_currency: 1
                },
                token: { refresh: 1, access: 1 }
            }
        }
    }

    async validateToken(token) {
        // token = {access:, refresh: ,}
        await sleep(0);
        return {
            status: this.SUCCESS,
            data: true
        }
    }
}

const useAuth = () => new AuthClient()
export default useAuth