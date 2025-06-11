import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChatrooms, selectChatroom } from '@/slices/chatSlice';
import type { AppDispatch, RootState } from '@/store/store';
import type { Chatroom } from '@/pages/Chat/data';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Hash } from 'lucide-react';

const ChatroomList = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { chatrooms, loading, error, selectedChatroom } = useSelector((state: RootState) => state.chat);

    useEffect(() => {
        dispatch(fetchChatrooms());
    }, [dispatch]);

    useEffect(() => {
        if (chatrooms.length > 0 && !selectedChatroom) {
            dispatch(selectChatroom(chatrooms[0]));
        }
    }, [chatrooms, selectedChatroom, dispatch]);

    const handleSelectChatroom = (chatroom: Chatroom) => {
        dispatch(selectChatroom(chatroom));
    };

    if (loading) {
        return <div>Loading chatrooms...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="w-full bg-muted/60 p-3 flex flex-col gap-4 border-r h-full">
            <div className="border-b pb-2 mb-2">
                <h1 className="font-bold text-lg">Accueil</h1>
            </div>
            <div>
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-semibold text-sm text-muted-foreground">Salons textuels</h2>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                <ScrollArea className="flex-1">
                    <nav className="flex flex-col gap-1">
                        {chatrooms.map((chatroom: Chatroom) => (
                            <Button
                                key={chatroom.id}
                                variant={selectedChatroom?.id === chatroom.id ? 'secondary' : 'ghost'}
                                className="w-full justify-start gap-2"
                                onClick={() => handleSelectChatroom(chatroom)}
                            >
                                <Hash className="h-4 w-4" />
                                <span className="truncate">{chatroom.name}</span>
                            </Button>
                        ))}
                    </nav>
                </ScrollArea>
            </div>
        </div>
    );
};

export default ChatroomList;
