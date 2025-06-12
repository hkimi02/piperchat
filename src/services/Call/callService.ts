import apiClient from '../apiClient';

const callService = {
    /**
     * Sends a signaling message to the backend to be broadcast to other call participants.
     * @param chatroomId The ID of the chatroom where the call is taking place.
     * @param payload The WebRTC signaling payload (e.g., offer, answer, ICE candidate).
     */
    sendSignal: (chatroomId: string, payload: any): Promise<any> => {
        return apiClient.post(`/calls/signal/${chatroomId}`, { payload });
    },
};

export default callService;
