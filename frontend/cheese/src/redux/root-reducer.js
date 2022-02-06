import { combineReducers } from 'redux'
import { persistReducer } from 'redux-persist'
import sessionStorage from 'redux-persist/lib/storage/session'
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

import userReducer from './user/user.slice'

const persistConfig = {
    key: 'root',
    storage: sessionStorage,
    whilelist: ['user'],
    stateReconciler: autoMergeLevel2
}

const rootReducer = combineReducers({
    user: userReducer
})

export default persistReducer(persistConfig, rootReducer)

