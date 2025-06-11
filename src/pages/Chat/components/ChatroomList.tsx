import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createChatroom, fetchChatrooms, selectChatroom } from '@/slices/chatSlice';
import type { AppDispatch, RootState } from '@/store/store';
import type { Chatroom } from '@/pages/Chat/data';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Hash } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ChatroomList = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { chatrooms, loading, error, selectedChatroom } = useSelector((state: RootState) => state.chat);
    const { user } = useSelector((state: RootState) => state.auth);

    const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
    const [newChatroomName, setNewChatroomName] = useState("");

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

    const handleCreateChatroom = async () => {
        if (newChatroomName.trim()) {
            await dispatch(createChatroom(newChatroomName.trim()));
            dispatch(fetchChatrooms());
            setNewChatroomName("");
            setCreateDialogOpen(false);
        }
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
                    {user?.role === 'ADMIN' && (
                        <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Créer un salon textuel</DialogTitle>
                                    <DialogDescription>
                                        Donnez un nom à votre nouveau salon.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="name" className="text-right">
                                            Nom
                                        </Label>
                                        <Input
                                            id="name"
                                            value={newChatroomName}
                                            onChange={(e) => setNewChatroomName(e.target.value)}
                                            className="col-span-3"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleCreateChatroom}>Créer</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
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
