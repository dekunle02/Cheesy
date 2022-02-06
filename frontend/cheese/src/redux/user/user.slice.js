import { createSlice } from '@reduxjs/toolkit'

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    userData: {user: null, token: null},
  },
  
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload
    },
    setUserToken:(state, action) => {
        state.userData.token = action.payload
    },
    logOutUser: (state) => {
        state.userData = null
    }
  },
})

export const { setUserData, setUserToken, logOutUser } = userSlice.actions
export default userSlice.reducer