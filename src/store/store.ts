import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/slices/authSlice';
import chatReducer from '@/slices/chatSlice'; // Adjust path as needed


const store = configureStore({
    reducer: {
        auth: authReducer,
        chat: chatReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types
                ignoredActions: ['chat/setLocalStream', 'chat/addRemoteStream'],
                // Ignore these paths in the state
                ignoredPaths: ['chat.localStream', 'chat.remoteStreams'],
            },
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;