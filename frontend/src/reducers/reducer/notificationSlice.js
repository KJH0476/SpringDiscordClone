import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // 알림 추가
    addNotification: (state, action) => {
      const maxId = state.notifications.reduce((max, notification) => Math.max(notification.id, max), -1);
      const newNotification = { id: maxId + 1, message: action.payload };
      state.notifications.push(newNotification);
    },
    // 알림 제거
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(notification => notification.id !== action.payload);
    },
  },
});

export const { addNotification, removeNotification} = notificationSlice.actions;

export default notificationSlice.reducer;