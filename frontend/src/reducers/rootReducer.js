import {combineReducers} from "redux";
import userReducer from "./reducer/userSlice";
import friendReducer from "./reducer/friendSlice";
import notificationReducer from "./reducer/notificationSlice";
import chatRoomSlice from "./reducer/chatRoomSlice";
import videoCallSlice from "./reducer/videoCallSlice";
import unreadMessagesSlice from "./reducer/unreadMessagesSlice";

const rootReducer = combineReducers({
    user: userReducer,
    notification: notificationReducer,
    friend: friendReducer,
    chatRoom: chatRoomSlice,
    videoCall: videoCallSlice,
    unreadMessages: unreadMessagesSlice,
    // 다른 리듀서들...
});

export default rootReducer;