import {createSelector, createSlice} from '@reduxjs/toolkit';

const initialState = {
    chatRoom: [],
};

const chatRoomSlice = createSlice({
    name: 'chatRoom',
    initialState,
    reducers: {
        addChatRoom(state, action) {
            const newChatRooms = action.payload.filter(newRoom =>
                !state.chatRoom.some(existingRoom => existingRoom.chatRoomInfo.id === newRoom.chatRoomInfo.id)
            );
            state.chatRoom = [...state.chatRoom, ...newChatRooms]; // 불변성을 유지하면서 새 배열 할당
        },
        removeChatRoom(state, action) {
            state.chatRoom = state.chatRoom.filter(chatRoom => chatRoom.id !== action.payload);
        },
        clearChatRoom(state) {
            state.chatRoom = [];
        },
        addMemberToRoom(state, action) {
            const { roomId, newMember } = action.payload;
            const roomIndex = state.chatRoom.findIndex(room => room.chatRoomInfo.roomId === roomId);
            if (roomIndex !== -1) {
                state.chatRoom[roomIndex].memberList = [...state.chatRoom[roomIndex].memberList, newMember];
            }
        },
        updateRoomName(state, action) {
            const { roomId, newRoomName } = action.payload;
            const roomIndex = state.chatRoom.findIndex(room => room.chatRoomInfo.roomId === roomId);
            if (roomIndex !== -1) {
                state.chatRoom[roomIndex].chatRoomInfo.roomName = newRoomName;
            }
        },
    },
});

export const selectRoomInfoByEmail = createSelector(
    [state => state.chatRoom.chatRoom, (state, friendEmail) => friendEmail],
    (chatRoom, friendEmail) => chatRoom.find(room => room.friendEmail === friendEmail)
);

export const selectRoomInfoByRoomId = createSelector(
    [state => state.chatRoom.chatRoom, (state, roomId) => roomId],
    (chatRooms, roomId) => chatRooms.find(room => room.chatRoomInfo.roomId === roomId)
);


export const { addChatRoom, removeChatRoom, clearChatRoom, addMemberToRoom, updateRoomName} = chatRoomSlice.actions;

export default chatRoomSlice.reducer;