import apiClient from '../apiClient';

// Fetch all chatrooms for the user's organisation
export const getChatrooms = async () => {
    const response = await apiClient.get('/chatrooms');
    return response.data;
};

// Fetch all messages for a specific chatroom
export const getMessages = async (chatroomId: string) => {
    const response = await apiClient.get(`/chatrooms/${chatroomId}/messages`);
    return response.data;
};

// Send a new message to a specific chatroom
export const sendMessage = async (chatroomId: string, content: string) => {
    const response = await apiClient.post(`/chatrooms/${chatroomId}/messages`, { content });
    return response.data;
};

// Create a new chatroom
export const createChatroom = async (data: any) => {
    const response = await apiClient.post('/chatrooms',data);
    return response.data;
};
