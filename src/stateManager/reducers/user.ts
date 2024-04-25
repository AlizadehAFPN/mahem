import { createSlice, PayloadAction } from '@reduxjs/toolkit'


interface userState {
    token?: string,
    mobile?: string,
    username?: string,
    cityId?: string,
    sex?: string,
    id?: string,
    city?:string,
    bookmarks:any[]
}

const initialState: userState = {
    token: undefined,
    mobile: undefined,
    id: undefined,
    username: "",
    cityId: '',
    sex:'',
    city:'',
    bookmarks:[]
}

export const userSlice = createSlice({
    name: 'counter',
    initialState,
    reducers: {
        setUser: (state, action) => {
            return (state = { ...state, ...action.payload });
        },
        removeUser: (state) => {
            state.token = undefined,
            state.mobile = ''
            state.username = ''
            state.cityId = ''
        },
        setUserCity: (state, action) => {
            state.cityId = action.payload.cityId;
            state.city = action.payload.city
        },
        setBookmarks: (state, action)=>{
            state.bookmarks = action.payload||[]
        }
    },
})

export const { setUser, removeUser, setUserCity, setBookmarks } = userSlice.actions


export default userSlice.reducer