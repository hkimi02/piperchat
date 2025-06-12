import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages, postMessage, addMessage, startCall } from '@/slices/chatSlice';
import type { AppDispatch, RootState } from '@/store/store';
import type { Message } from '@/pages/Chat/data';
import echo from '@/services/echo';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import CallView from './CallView';

const ChatArea = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { selectedChatroom, messages, loading, isCallActive, activeCalls } = useSelector((state: RootState) => state.chat);
    const { user: currentUser } = useSelector((state: RootState) => state.auth);
    const [newMessage, setNewMessage] = useState('');
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const chatroomId = selectedChatroom?.id;

    useEffect(() => {
        if (chatroomId) {
            dispatch(fetchMessages(String(chatroomId)));

            const channel = echo.private(`chat.${chatroomId}`);
            channel.listen('.MessageSent', (data: { message: Message }) => {
                if (data.message.chatroom_id === chatroomId) {
                    dispatch(addMessage(data.message));
                }
            });

            return () => {
                channel.stopListening('.MessageSent');
                echo.leave(`chat.${chatroomId}`);
            };
        }
    }, [chatroomId, dispatch]);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
        }
        }, [messages]);

    const handleStartCall = () => {
        if (selectedChatroom) {
            dispatch(startCall());
        }
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() && selectedChatroom) {
            dispatch(postMessage({ chatroomId: String(selectedChatroom.id), content: newMessage }));
            setNewMessage('');
        }
    };

    if (!selectedChatroom) {
        return <div className="flex items-center justify-center h-full">Select a chatroom to start messaging.</div>;
    }

    if (loading && messages.length === 0) {
        return <div className="flex items-center justify-center h-full">Loading messages...</div>;
    }

        const isCallOngoingInRoom = selectedChatroom && activeCalls[selectedChatroom.id];

    return (
        <div className="relative flex flex-col h-full">
            {isCallActive && <CallView />}
            <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">{selectedChatroom.name}</h2>
                {!isCallActive && (
                    isCallOngoingInRoom ? (
                        <Button onClick={handleStartCall}>
                            <Phone className="mr-2 h-4 w-4" /> Join Call
                        </Button>
                    ) : (
                        <Button onClick={handleStartCall} size="icon" variant="outline">
                            <Phone className="h-5 w-5" />
                        </Button>
                    )
                )}
            </div>
            <ScrollArea className="flex-1 h-0 p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                    {messages.map((message) => {
                        const isCurrentUser = message.user.id === currentUser?.id;
                        return (
                            <div
                                key={message.id}
                                className={cn('flex items-start gap-3', isCurrentUser && 'flex-row-reverse')}
                            >
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={message.user.profile_picture || ''} />
                                    <AvatarFallback>{message.user.full_name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div
                                    className={cn(
                                        'flex flex-col rounded-lg px-3 py-2',
                                        isCurrentUser ? 'bg-primary/10' : 'bg-muted',
                                    )}
                                >
                                    <div className={cn('flex items-center gap-2', isCurrentUser && 'justify-end')}>
                                        <p className="font-bold">{isCurrentUser ? 'Vous' : message.user.full_name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(message.created_at).toLocaleTimeString()}
                                        </p>
                                    </div>
                                    <p className={cn('text-foreground/90', isCurrentUser && 'text-right')}>{message.content}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>
            <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1"
                    />
                    <Button type="submit" size="icon" variant="ghost">
                        <Send className="h-5 w-5" />
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ChatArea;
