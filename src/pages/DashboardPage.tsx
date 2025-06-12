import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {Kanban, Pencil} from 'lucide-react';
import projectService from '@/services/Projects/projectService';
import { Button } from '@/components/ui/button';
import ProjectList from '@/pages/dashboard/ProjectList';
import ChatLayout from '@/pages/Chat/components/ChatLayout';
import MemberList from '@/pages/dashboard/MemberList';
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

    useEffect(() => {
        if (selectedProject) {
            setProjectForm({ name: selectedProject.name, description: selectedProject.description || '' });
        }
    }, [selectedProject]);

    const handleUpdateProject = async () => {
        if (!selectedProject) return;

        try {
            const response = await projectService.updateProject(selectedProject.id, projectForm);
            setSelectedProject({ ...selectedProject, ...response.data });
            setEditOpen(false);
            toast.success('Project updated successfully.');
        } catch (error) {
            console.error('Failed to update project:', error);
            toast.error('Failed to update project.');
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-3.5rem)]">
            <div className="bg-background border-b p-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                    {selectedProject ? selectedProject.name : 'No Project Selected'}
                </h2>
                {selectedProject && (
                    <div className="flex gap-2">
                        {currentUser?.role === 'ADMIN' && (
                            <Dialog open={isEditOpen} onOpenChange={setEditOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline">
                                        <Pencil className="mr-2 h-4 w-4" /> Edit Project
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Edit Project</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Name</Label>
                                            <Input
                                                id="name"
                                                value={projectForm.name}
                                                onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={projectForm.description}
                                                onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleUpdateProject}>Save</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                        <Link to={`/kanban/${selectedProject.id}`}>
                            <Button variant="outline">
                                <Kanban className="mr-2 h-4 w-4" /> Kanban Board
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
            <div className="flex flex-1 overflow-hidden">
                <ProjectList onSelectProject={setSelectedProject} />
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex-1 h-full">
                        <ChatLayout selectedProjectId={selectedProject?.id} />
                    </div>
                    {selectedProject && (
                        <div className="p-4 border-t h-48 overflow-y-auto bg-background">
                            <h3 className="font-semibold mb-2">Tasks</h3>
                            {selectedProject.tasks.length > 0 ? (
                                <ul className="space-y-2">
                                    {selectedProject.tasks.map((task) => (
                                        <li
                                            key={task.id}
                                            className={`p-2 rounded ${task.is_assigned ? 'bg-green-100' : 'bg-gray-100'}`}
                                        >
                                            <span className="font-medium">{task.title}</span> ({task.status})
                                            {task.is_assigned && <span className="ml-2 text-green-600">Assigned to you</span>}
                                            {task.user && (
                                                <span className="text-sm text-gray-500 ml-2">
                                                    Assigned to {task.user.first_name} {task.user.last_name}
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground">No tasks for this project.</p>
                            )}
                        </div>
                    )}
                </div>
                <MemberList />
            </div>
        </div>
    );
};

export default DashboardPage;