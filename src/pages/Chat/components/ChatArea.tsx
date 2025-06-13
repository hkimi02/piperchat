import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages, postMessage, addMessage, startCall, uploadFile } from '@/slices/chatSlice';
import type { AppDispatch, RootState } from '@/store/store';
import type { Message } from '@/pages/Chat/data';
import echo from '@/services/echo';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Phone, Paperclip, File, FileText, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';
import CallView from './CallView';

const ChatArea = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { selectedChatroom, messages, loading, isCallActive, activeCalls } = useSelector((state: RootState) => state.chat);
    const { user: currentUser } = useSelector((state: RootState) => state.auth);
    const [newMessage, setNewMessage] = useState('');
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && chatroomId) {
            dispatch(uploadFile({
                chatroomId: String(chatroomId),
                file: file,
            }));
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleAttachmentClick = () => {
        fileInputRef.current?.click();
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
                                    {renderMessageContent(message, isCurrentUser)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>
            <div className="p-4 border-t">
                                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <Button type="button" size="icon" variant="ghost" onClick={handleAttachmentClick} disabled={loading}>
                        <Paperclip className="h-5 w-5" />
                    </Button>
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Taper un message..."
                        className="flex-1"
                        disabled={loading}
                    />
                    <Button type="submit" size="icon" variant="ghost" disabled={!newMessage.trim() || loading}>
                        <Send className="h-5 w-5" />
                    </Button>
                </form>
            </div>
        </div>
    );
};

const renderMessageContent = (message: Message, isCurrentUser: boolean) => {
    try {
        const content = JSON.parse(message.content);
        if (content.type === 'file' && content.data) {
            const file = content.data;

            // Render image previews
            if (file.type.startsWith('image/')) {
                return (
                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="mt-2 block">
                        <img src={file.url} alt={file.name} className="max-w-xs rounded-lg" />
                    </a>
                );
            }

            // Render other file types with icons
            const getFileIcon = (fileName: string) => {
                const extension = fileName.split('.').pop()?.toLowerCase() || '';
                if (extension === 'pdf') return <FileText className="h-8 w-8 text-red-500" />;
                if (['doc', 'docx'].includes(extension)) return <FileText className="h-8 w-8 text-blue-500" />;
                if (['zip', 'rar', '7z'].includes(extension)) return <Archive className="h-8 w-8 text-yellow-500" />;
                return <File className="h-8 w-8 text-gray-500" />;
            };

            return (
                <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 flex items-center gap-3 rounded-md border p-2 transition-colors hover:bg-muted/50"
                >
                    {getFileIcon(file.name)}
                    <div className="flex flex-col">
                        <span className="font-medium leading-none">{file.name}</span>
                        <span className="text-sm text-muted-foreground">
                            {file.size > 1024 * 1024
                                ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                                : `${(file.size / 1024).toFixed(2)} KB`}
                        </span>
                    </div>
                </a>
            );
        }
    } catch (e) {
        // Not a file object, treat as plain text.
    }

    // Fallback for plain text messages.
    return <p className={cn('text-foreground/90', isCurrentUser && 'text-right')}>{message.content}</p>;
};

export default ChatArea;
