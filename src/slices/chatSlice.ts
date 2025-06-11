import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import * as chatService from '@/services/Chat/chatService';
import type { Chatroom, Message } from '@/pages/Chat/data';

// Define the shape of the chat state
interface ChatState {
    chatrooms: Chatroom[];
    messages: Message[];
    selectedChatroom: Chatroom | null;
    loading: boolean;
    error: string | null;
}

// Initial state
const initialState: ChatState = {
    chatrooms: [],
    messages: [],
    selectedChatroom: null,
    loading: false,
    error: null,
};

// Async thunks for chat operations
export const fetchChatrooms = createAsyncThunk('chat/fetchChatrooms', async () => {
    return await chatService.getChatrooms();
});

export const fetchMessages = createAsyncThunk('chat/fetchMessages', async (chatroomId: string) => {
    return await chatService.getMessages(chatroomId);
});

export const postMessage = createAsyncThunk('chat/postMessage', async ({ chatroomId, content }: { chatroomId: string; content: string }) => {
    return await chatService.sendMessage(chatroomId, content);
});

export const createChatroom = createAsyncThunk('chat/createChatroom', async (name: string) => {
    return await chatService.createChatroom(name);
});

// Chat slice
const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        selectChatroom: (state, action: PayloadAction<Chatroom | null>) => {
            state.selectedChatroom = action.payload;
        },
        addMessage: (state, action: PayloadAction<Message>) => {
            state.messages.push(action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchChatrooms.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchChatrooms.fulfilled, (state, action: PayloadAction<Chatroom[]>) => {
                state.chatrooms = action.payload;
                state.loading = false;
            })
            .addCase(fetchChatrooms.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch chatrooms';
            })
            .addCase(fetchMessages.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMessages.fulfilled, (state, action: PayloadAction<Message[]>) => {
                state.messages = action.payload.reverse(); // Show latest messages at the bottom
                state.loading = false;
            })
            .addCase(fetchMessages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch messages';
            })
            .addCase(createChatroom.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createChatroom.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(createChatroom.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to create chatroom';
            });
    },
});

export const { selectChatroom, addMessage } = chatSlice.actions;
export default chatSlice.reducer;
