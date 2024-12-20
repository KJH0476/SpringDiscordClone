import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    unreadCounts: {}
};

const unreadMessagesSlice = createSlice({
    name: 'unreadMessages',
    initialState,
    reducers: {
        incrementUnreadCount(state, action) {
            const roomId = action.payload;
            if (state.unreadCounts[roomId]) {
                state.unreadCounts[roomId] += 1;
            } else {
                state.unreadCounts[roomId] = 1;
            }
        },
        resetUnreadCount(state, action) {
            const roomId = action.payload;
            if (state.unreadCounts[roomId]) {
                state.unreadCounts[roomId] = 0;
            }
        },
    }
});

export const selectUnreadCountByRoomId = (state, roomId) => {
    return state.unreadMessages?.unreadCounts[roomId] || 0;
};

export const { incrementUnreadCount, resetUnreadCount } = unreadMessagesSlice.actions;
export default unreadMessagesSlice.reducer;
