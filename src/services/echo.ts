import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import apiClient from './apiClient';

declare global {
    interface Window {
        Pusher: typeof Pusher;

    }
}

window.Pusher = Pusher;

const echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true,
    authorizer: (channel: any) => {
        return {
            authorize: (socketId: string, callback: (error: Error | null, authData: any) => void) => {
                apiClient.post(import.meta.env.VITE_BASE_URL + '/broadcasting/auth', {
                    socket_id: socketId,
                    channel_name: channel.name
                })
                .then(response => {
                    callback(null, response.data);
                })
                .catch(error => {
                    console.error('Authorization failed:', error);
                    callback(new Error(`Authorization failed for ${channel.name}`), null);
                });
            }
        };
    },
});

export default echo;
