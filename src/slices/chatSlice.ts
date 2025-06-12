import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import * as chatService from '@/services/Chat/chatService';
import type { Chatroom, Message, Participant } from '@/pages/Chat/data';

// Define the shape of the chat state
interface ChatState {
    chatrooms: Chatroom[];
    messages: Message[];
    selectedChatroom: Chatroom | null;
    loading: boolean;
    error: string | null;
    // Call state
    isCallActive: boolean;
    participants: Participant[];
    // We use `any` for MediaStream to avoid issues in non-browser environments.
    localStream: any | null;
    remoteStreams: { [userId: number]: any };
    isVideoEnabled: boolean;
    isScreenSharing: boolean;
}



// Initial state
const initialState: ChatState = {
    chatrooms: [],
    messages: [],
    selectedChatroom: null,
    loading: false,
    error: null,
    // Call state
    isCallActive: false,
    participants: [],
    localStream: null,
    remoteStreams: {},
    isVideoEnabled: false,
    isScreenSharing: false,
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

export const createChatroom = createAsyncThunk('chat/createChatroom', async (data: any) => {
    return await chatService.createChatroom(data);
});

export const findOrCreatePrivateChatroom = createAsyncThunk(
    'chat/findOrCreatePrivateChatroom',
    async (userId: number) => {
        return await chatService.findOrCreatePrivateChatroom(userId);
    }
);

// Chat slice
const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        selectChatroom: (state, action: PayloadAction<Chatroom | null>) => {
            state.selectedChatroom = action.payload;
        },
        addMessage: (state, action: PayloadAction<Message>) => {
            // Avoid adding duplicate messages that might come from the echo
            if (!state.messages.find(m => m.id === action.payload.id)) {
                state.messages.push(action.payload);
            }
        },
        // Call reducers
        startCall: (state) => {
            state.isCallActive = true;
        },
        endCall(state) {
            state.isCallActive = false;
            state.participants = [];
            state.localStream = null;
            state.remoteStreams = {};
            state.isVideoEnabled = false;
            state.isScreenSharing = false;
        },
        toggleVideo(state, action: PayloadAction<boolean>) {
            state.isVideoEnabled = action.payload;
        },
        setScreenSharing(state, action: PayloadAction<boolean>) {
            state.isScreenSharing = action.payload;
        },
        updateParticipantStream(state, action: PayloadAction<{ userId: number; streamType: 'camera' | 'screen' }>) {
            const participant = state.participants.find(p => p.id === action.payload.userId);
            if (participant) {
                participant.streamType = action.payload.streamType;
            }
        },
        setParticipants: (state, action: PayloadAction<Participant[]>) => {
            state.participants = action.payload;
        },
        addParticipant: (state, action: PayloadAction<Participant>) => {
            if (!state.participants.find(p => p.id === action.payload.id)) {
                state.participants.push(action.payload);
            }
        },
        removeParticipant: (state, action: PayloadAction<number>) => { // by user ID
            state.participants = state.participants.filter(p => p.id !== action.payload);
            delete state.remoteStreams[action.payload];
        },
        setLocalStream: (state, action: PayloadAction<any | null>) => {
            state.localStream = action.payload;
        },
        addRemoteStream: (state, action: PayloadAction<{ userId: number; stream: any }>) => {
            state.remoteStreams = {
                ...state.remoteStreams,
                [action.payload.userId]: action.payload.stream,
            };
        },
        removeRemoteStream: (state, action: PayloadAction<number>) => { // by user ID
            delete state.remoteStreams[action.payload];
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
            })
            .addCase(findOrCreatePrivateChatroom.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(findOrCreatePrivateChatroom.fulfilled, (state, action: PayloadAction<Chatroom>) => {
                const existingChatroom = state.chatrooms.find(c => c.id === action.payload.id);
                if (!existingChatroom) {
                    state.chatrooms.push(action.payload);
                }
                state.selectedChatroom = action.payload;
                state.loading = false;
            })
            .addCase(findOrCreatePrivateChatroom.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to find or create private chatroom';
            });
    },
});

export const {
    selectChatroom,
    addMessage,
    startCall,
    endCall,
    toggleVideo,
    setScreenSharing,
    updateParticipantStream,
    setParticipants,
    addParticipant,
    removeParticipant,
    setLocalStream,
    addRemoteStream,
    removeRemoteStream,
} = chatSlice.actions;
export default chatSlice.reducer;
