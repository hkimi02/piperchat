import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createChatroom, fetchChatrooms, selectChatroom } from '@/slices/chatSlice';
import type { AppDispatch, RootState } from '@/store/store';
import type { Chatroom } from '@/pages/Chat/data';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Hash, Users } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import projectService from '@/services/Projects/projectService';
import { toast } from 'sonner';

interface ChatroomListProps {
  selectedProjectId?: number;
  onChatroomSelected?: () => void;
}

const ChatroomList: React.FC<ChatroomListProps> = ({ selectedProjectId, onChatroomSelected }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { chatrooms, loading, error, selectedChatroom } = useSelector((state: RootState) => state.chat);
    const { user } = useSelector((state: RootState) => state.auth);
    const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
    const [newChatroomName, setNewChatroomName] = useState('');
    const [chatroomType, setChatroomType] = useState<'organisation' | 'project'>('organisation');
    const [projects, setProjects] = useState<{ id: number; name: string }[]>([]);
    const [selectedProject, setSelectedProject] = useState<string>('');

    useEffect(() => {
        dispatch(fetchChatrooms());
        const fetchProjects = async () => {
            try {
                const response = await projectService.getProjects();
                setProjects(response.data);
            } catch (error) {
                console.error('Failed to fetch projects:', error);
                toast.error('Failed to load projects.');
            }
        };
        fetchProjects();
    }, [dispatch]);

    useEffect(() => {
        const relevantChatrooms = selectedProjectId
            ? chatrooms.filter(c => c.type === 'project' && c.project_id === selectedProjectId)
            : chatrooms.filter(c => c.type === 'organisation');

        const isSelectedChatroomRelevant = selectedChatroom && relevantChatrooms.some(c => c.id === selectedChatroom.id);

        if (!isSelectedChatroomRelevant && relevantChatrooms.length > 0) {
            dispatch(selectChatroom(relevantChatrooms[0]));
        }
    }, [selectedProjectId, chatrooms, selectedChatroom, dispatch]);

    const handleSelectChatroom = (chatroom: Chatroom) => {
        dispatch(selectChatroom(chatroom));
        onChatroomSelected?.();
    };

    const handleCreateChatroom = async () => {
        if (!newChatroomName.trim()) {
            toast.error('Chatroom name is required.');
            return;
        }
        if (chatroomType === 'project' && !selectedProject) {
            toast.error('Please select a project.');
            return;
        }

        try {
            await dispatch(
                createChatroom({
                    name: newChatroomName.trim(),
                    type: chatroomType,
                    project_id: chatroomType === 'project' ? Number(selectedProject) : null,
                })
            ).unwrap();
            dispatch(fetchChatrooms());
            setNewChatroomName('');
            setChatroomType('organisation');
            setSelectedProject('');
            setCreateDialogOpen(false);
            toast.success('Chatroom created successfully.');
        } catch (error) {
            toast.error('Failed to create chatroom.');
        }
    };

        const publicChatrooms = chatrooms.filter(c => c.type === 'organisation' || c.type === 'project');
    const privateChatrooms = chatrooms.filter(c => c.type === 'private');

    const getPrivateChatroomDisplayName = (chatroom: Chatroom) => {
        if (chatroom.type !== 'private' || !chatroom.users || !user) return chatroom.name;
        const otherUser = chatroom.users.find(u => u.id !== user.id);
        return otherUser ? otherUser.full_name : chatroom.name;
    };

    const filteredChatrooms = selectedProjectId
        ? publicChatrooms.filter(
            (chatroom) => chatroom.type === 'project' && chatroom.project_id === selectedProjectId
        )
        : publicChatrooms.filter((chatroom) => chatroom.type === 'organisation');

    if (loading) return <div>Loading chatrooms...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="w-full bg-muted/60 p-3 flex flex-col gap-4 border-r h-full">
            <div className="border-b pb-2 mb-2">
                <h1 className="font-bold text-lg">
                    {selectedProjectId ? 'Project Chat' : 'Organisation Chat'}
                </h1>
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-semibold text-sm text-muted-foreground">Text Channels</h2>
                    {user?.role === 'ADMIN' && (
                        <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Create Text Channel</DialogTitle>
                                    <DialogDescription>
                                        Create a new channel for your team. Project channels will include users assigned to tasks in the project.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="name" className="text-right">
                                            Name
                                        </Label>
                                        <Input
                                            id="name"
                                            value={newChatroomName}
                                            onChange={(e) => setNewChatroomName(e.target.value)}
                                            className="col-span-3"
                                            placeholder="e.g., general or sprint-planning"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="type" className="text-right">
                                            Type
                                        </Label>
                                        <Select
                                            value={chatroomType}
                                            onValueChange={(value: 'organisation' | 'project') => {
                                                setChatroomType(value);
                                                setSelectedProject('');
                                            }}
                                        >
                                            <SelectTrigger className="col-span-3">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="organisation">Organisation</SelectItem>
                                                <SelectItem value="project">Project</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {chatroomType === 'project' && (
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="project" className="text-right">
                                                Project
                                            </Label>
                                            <Select value={selectedProject} onValueChange={setSelectedProject}>
                                                <SelectTrigger className="col-span-3">
                                                    <SelectValue placeholder="Select project" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {projects.map((project) => (
                                                        <SelectItem key={project.id} value={String(project.id)}>
                                                            {project.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleCreateChatroom}>Create</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
                <ScrollArea className="h-[calc(100vh-150px)]">
                    <nav className="flex flex-col gap-1">
                        <h3 className="font-semibold text-sm text-muted-foreground px-2 mt-4 mb-2">Channels</h3>
                        {filteredChatrooms.length === 0 ? (
                            <div className="text-sm text-muted-foreground text-center py-4">
                                No channels available
                            </div>
                        ) : (
                            filteredChatrooms.map((chatroom: Chatroom) => (
                                <Button
                                    key={chatroom.id}
                                    variant={selectedChatroom?.id === chatroom.id ? 'secondary' : 'ghost'}
                                    className="w-full justify-start gap-2 text-left"
                                    onClick={() => handleSelectChatroom(chatroom)}
                                    title={chatroom.name}
                                >
                                    <Hash className="h-4 w-4 flex-shrink-0" />
                                    <span className="truncate">{chatroom.name}</span>
                                </Button>
                            ))
                        )}
                        
                        <h3 className="font-semibold text-sm text-muted-foreground px-2 mt-4 mb-2">Direct Messages</h3>
                        {privateChatrooms.length === 0 ? (
                            <div className="text-sm text-muted-foreground text-center py-4">
                                No private messages
                            </div>
                        ) : (
                            privateChatrooms.map((chatroom: Chatroom) => (
                                <Button
                                    key={chatroom.id}
                                    variant={selectedChatroom?.id === chatroom.id ? 'secondary' : 'ghost'}
                                    className="w-full justify-start gap-2 text-left"
                                    onClick={() => handleSelectChatroom(chatroom)}
                                    title={getPrivateChatroomDisplayName(chatroom)}
                                >
                                    <Users className="h-4 w-4 flex-shrink-0" />
                                    <span className="truncate">{getPrivateChatroomDisplayName(chatroom)}</span>
                                </Button>
                            ))
                        )}
                    </nav>
                </ScrollArea>
            </div>
        </div>
    );
};

export default ChatroomList;