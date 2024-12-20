import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isLoggedIn: false,
    userInfo: {},
    loading: false,
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        // 로그인 성공 처리
        loginSuccess: (state, action) => {
            state.isLoggedIn = true;
            state.userInfo = action.payload;
        },
        // 로그아웃 처리
        logout: (state) => {
            state.isLoggedIn = false;
            state.userInfo = {};
            state.loading = false;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        updateUserStatus(state, action) {
            if (state.userInfo) {
                state.userInfo.status = action.payload;
            }
        },
    },
});

export const { loginSuccess, logout, setLoading, updateUserStatus } = userSlice.actions;
export default userSlice.reducer;

