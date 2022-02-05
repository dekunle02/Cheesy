const UserActionTypes = {

    SET_USER: 'SET_USER'

}

const setUser = user => ({
    type: UserActionTypes.SET_CURRENT_USER,
    payload: user
})

export  {UserActionTypes, setUser}