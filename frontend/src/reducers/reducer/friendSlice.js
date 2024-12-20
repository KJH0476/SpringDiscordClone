import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    friends: [],
    filter: 'ALL',
};

const friendSlice = createSlice({
    name: 'friend',
    initialState,
    reducers: {
        // 친구 목록에 친구 추가
        addFriends(state, action) {
            const newFriends = action.payload.filter(newFriend =>
                !state.friends.some(existingFriend => existingFriend.friendName === newFriend.friendName)
            );
            state.friends.push(...newFriends);
        },
        // 친구 목록에서 친구 제거
        removeFriends(state, action) {
            state.friends = state.friends.filter(friend => friend.friendName !== action.payload);
        },
        // 친구 상태 업데이트
        updateFriendStatus(state, action) {
            state.friends = state.friends.map(friend =>
                friend.friendMemberId.toString() === action.payload.friendMemberId.toString()
                    ? { ...friend, friendStatus: action.payload.friendStatus }
                    : friend
            );
        },
        // 친구 관계 업데이트
        updateFriendRelation(state, action) {
            state.friends = state.friends.map(friend =>
                friend.friendName === action.payload.friendName
                    ? { ...friend, relation: action.payload.relation }
                    : friend
            );
        },
        // 친구 필터 설정
        setFriendFilter(state, action) {
            state.filter = action.payload;
        },
        clearFriends(state) {
            state.friends = [];
            state.filter = 'ALL';
        },
    },
});

export const {
    addFriends,
    removeFriends,
    updateFriendStatus,
    updateFriendRelation,
    setFriendFilter,
    clearFriends
} = friendSlice.actions;

export default friendSlice.reducer;