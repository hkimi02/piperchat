import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/store/store';
import echo from '@/services/echo';
import { setCallStatus } from '@/slices/chatSlice';

export const useCallStatus = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { chatrooms } = useSelector((state: RootState) => state.chat);

    useEffect(() => {
        if (chatrooms.length === 0) {
            return;
        }

        const channels = chatrooms.map(cr => {
            const channel = echo.join(`presence-call.${cr.id}`);
            
            channel.here((users: any[]) => {
                // A call is considered active if more than one person is present.
                dispatch(setCallStatus({ chatroomId: cr.id, isActive: users.length > 1 }));
            });

            channel.joining((_: any) => {
                // When someone joins, check the member count to update status.
                // The `here` event will have already fired, so we rely on the channel's internal member list.
                const memberCount = (channel.subscription.members as any)?.count || 0;
                dispatch(setCallStatus({ chatroomId: cr.id, isActive: memberCount > 1 }));
            });

            channel.leaving((_: any) => {
                // When someone leaves, check the member count.
                const memberCount = (channel.subscription.members as any)?.count || 0;
                // Use > 1 because the leaving user is still counted until they fully depart.
                dispatch(setCallStatus({ chatroomId: cr.id, isActive: memberCount > 1 }));
            });

            return channel;
        });

        // Cleanup on unmount
        return () => {
            channels.forEach((_, index) => {
                const chatroomId = chatrooms[index].id;
                echo.leave(`presence-call.${chatroomId}`);
            });
        };
    }, [chatrooms, dispatch]);
};
