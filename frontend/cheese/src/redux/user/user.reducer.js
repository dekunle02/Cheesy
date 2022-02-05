import { UserActionTypes } from "./user.actions";


const INITIAL_USER_STATE = {
    user: null
}

function userReducer(state = INITIAL_USER_STATE, action){
    switch(action.type) {
        case UserActionTypes.SET_USER:
            return {
                ...state,
                user: action.payload
            }
        default:
            return state
    }
}

export default userReducer
