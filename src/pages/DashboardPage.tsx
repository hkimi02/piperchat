import React, { useCallback, useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Kanban, Pencil, Users, Menu, MoreVertical } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import projectService from '@/services/Projects/projectService';
import { Button } from '@/components/ui/button';
import ProjectList from '@/pages/dashboard/ProjectList';
import MemberList from '@/pages/dashboard/MemberList';
import ChatroomList from '@/pages/Chat/components/ChatroomList';
import ChatArea from '@/pages/Chat/components/ChatArea';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface User {
    id: number;
    first_name: string;
    last_name: string;
}

interface Task {
    id: number;
    title: string;
    description?: string;
    status: string;
    project_id: number;
    user_id: number | null;
    is_assigned: boolean;
    user?: User;
}

interface Project {
    id: number;
    name: string;
    description?: string;
    organisation_id: number;
    tasks: Task[];
}

interface RootState {
    auth: { user: { id: number; role: 'ADMIN' | 'USER'; organisation_id: number } | null };
}

const DashboardPage: React.FC = () => {
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isEditOpen, setEditOpen] = useState(false);
    const [projectForm, setProjectForm] = useState({ name: '', description: '' });
    const currentUser = useSelector((state: RootState) => state.auth.user);

    // State for mobile sidebars
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMemberListOpen, setMemberListOpen] = useState(false);

    useEffect(() => {
        if (selectedProject) {
            setProjectForm({ name: selectedProject.name, description: selectedProject.description || '' });
        } else {
            setProjectForm({ name: '', description: '' });
        }
    }, [selectedProject]);

    const handleUpdateProject = async () => {
        if (!selectedProject) return;
        try {
            const response = await projectService.updateProject(selectedProject.id, projectForm);
            const updatedProject = { ...selectedProject, ...response.data };
            setSelectedProject(updatedProject);
            setEditOpen(false);
            toast.success('Project updated successfully.');
        } catch (error) {
            console.error('Failed to update project:', error);
            toast.error('Failed to update project.');
        }
    };

    const handleSelectProject = useCallback((project: Project | null) => {
        setSelectedProject(project);
    }, []);

    const handleChatroomSelected = useCallback(() => {
        // Close mobile menu only after a channel is selected
        if (window.innerWidth < 768) {
            setMobileMenuOpen(false);
        }
    }, []);

    return (
        <div className="flex h-[calc(100vh-3.5rem)] text-foreground bg-background">
            {/* --- Mobile: Combined Sidebar (Projects + Channels) --- */}
            <aside className={`fixed top-0 left-0 h-screen z-50 flex transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex h-full">
                    <ProjectList
                        selectedProject={selectedProject}
                        onSelectProject={handleSelectProject}
                    />
                    <div className="w-64 bg-background border-r">
                        <ChatroomList selectedProjectId={selectedProject?.id} onChatroomSelected={handleChatroomSelected} />
                    </div>
                </div>
            </aside>

            {/* --- Desktop: Separated Layout --- */}
            <div className="hidden md:flex">
                <ProjectList
                    selectedProject={selectedProject}
                    onSelectProject={handleSelectProject}
                />
            </div>
            <aside className="hidden md:flex w-64 flex-col flex-shrink-0 border-r bg-background">
                <ChatroomList selectedProjectId={selectedProject?.id} onChatroomSelected={handleChatroomSelected} />
            </aside>

            {/* --- Main Content Area (Chat + Member List) --- */}
            <div className="flex-1 flex min-w-0 relative">
                <main className="flex-1 flex flex-col min-w-0">
                    <header className={`flex items-center justify-between p-3 border-b flex-shrink-0 ${!selectedProject ? 'md:hidden' : ''}`}>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
                                <Menu className="h-6 w-6" />
                            </Button>
                            {selectedProject && (
                                <h2 className="font-semibold text-lg truncate">
                                    {selectedProject.name}
                                </h2>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {selectedProject && (
                                <>
                                    {/* Desktop Buttons */}
                                    <div className="hidden md:flex items-center gap-2">
                                        {currentUser?.role === 'ADMIN' && (
                                            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                                                <Pencil className="h-4 w-4 mr-2" />Edit
                                            </Button>
                                        )}
                                        <Link to={`/kanban/${selectedProject.id}`}>
                                            <Button variant="outline" size="sm">
                                                <Kanban className="h-4 w-4 mr-2" />Board
                                            </Button>
                                        </Link>
                                    </div>

                                    {/* Mobile Dropdown */}
                                    <div className="md:hidden">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {currentUser?.role === 'ADMIN' && (
                                                    <DropdownMenuItem onSelect={() => setEditOpen(true)}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        <span>Edit</span>
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem asChild>
                                                    <Link to={`/kanban/${selectedProject.id}`} className="flex items-center w-full">
                                                        <Kanban className="mr-2 h-4 w-4" />
                                                        <span>Board</span>
                                                    </Link>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </>
                            )}
                            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMemberListOpen(true)}>
                                <Users className="h-6 w-6" />
                            </Button>
                        </div>
                    </header>
                    <div className="flex-1 overflow-y-auto">
                        <ChatArea />
                    </div>
                </main>

                <aside className={`fixed md:static top-0 right-0 h-screen z-50 w-64 bg-background border-l transition-transform duration-300 ease-in-out md:flex flex-col flex-shrink-0 ${isMemberListOpen ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0`}>
                    <MemberList />
                </aside>
            </div>

            {/* Overlay for mobile sidebars */}
            {(isMobileMenuOpen || isMemberListOpen) && (
                <div
                    className="fixed md:hidden inset-0 bg-black/50 z-40"
                    onClick={() => {
                        setMobileMenuOpen(false);
                        setMemberListOpen(false);
                    }}
                />
            )}

            {/* Edit Project Dialog */}
            {selectedProject && currentUser?.role === 'ADMIN' && (
                <Dialog open={isEditOpen} onOpenChange={setEditOpen}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Edit Project</DialogTitle></DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" value={projectForm.name} onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} />
                            </div>
                        </div>
                        <DialogFooter><Button onClick={handleUpdateProject}>Save Changes</Button></DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default DashboardPage;