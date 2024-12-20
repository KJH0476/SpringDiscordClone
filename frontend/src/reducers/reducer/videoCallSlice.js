import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    videoCall: false,
    senderEmail: '',
    roomId: ''
};

const videoCallSlice = createSlice({
    name: 'videoCall',
    initialState,
    reducers: {
        setVideo: (state, action) => {
            state.videoCall = action.payload;
            state.senderEmail = action.payload ? action.payload.senderEmail : '';
            state.roomId = action.payload ? action.payload.roomId : '';
        },
    },
});

export const { setVideo } = videoCallSlice.actions;
export default videoCallSlice.reducer;