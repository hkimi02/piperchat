import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import projectService from '@/services/Projects/projectService';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import KanbanBoard from "@/components/kanabanBoard/kanbanBoard.tsx";
import ProjectList from '@/pages/dashboard/ProjectList';
import { ChevronLeft } from 'lucide-react';

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

const KanbanPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedProjectForList, setSelectedProjectForList] = useState<Project | null>(null);

    useEffect(() => {
        const fetchProjectData = async () => {
            if (!projectId) {
                toast.error('Project ID is missing.');
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const projectResponse = await projectService.getProject(parseInt(projectId));
                setProject(projectResponse.data);
                setSelectedProjectForList(projectResponse.data);
            } catch (error) {
                console.error('Failed to fetch project:', error);
                toast.error('Failed to fetch project.');
                setProject(null);
            } finally {
                setLoading(false);
            }
        };

        fetchProjectData();
    }, [projectId]);

    const handleSelectProject = (project: Project | null) => {
        if (project) {
            navigate(`/kanban/${project.id}`);
        } else {
            navigate('/dashboard');
        }
    };

    const handleGoBack = () => {
        if (project) {
            navigate('/dashboard', { state: { selectedProjectId: project.id } });
        } else {
            navigate('/dashboard');
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-full">Loading...</div>;
    }

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <h2 className="text-xl font-semibold">Project Not Found</h2>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/dashboard')}>
                    Back to Dashboard
                </Button>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-3.5rem)] text-foreground bg-background">
            <aside className="hidden md:flex md:flex-col w-20">
                <ProjectList
                    selectedProject={selectedProjectForList}
                    onSelectProject={handleSelectProject}
                />
            </aside>
            <main className="flex-1 flex flex-col">
                <header className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={handleGoBack}>
                            <ChevronLeft className="h-6 w-6" />
                        </Button>
                        <h2 className="text-xl font-semibold">{project.name} - Kanban Board</h2>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-4">
                    <KanbanBoard projectId={project.id} />
                </div>
            </main>
        </div>
    );
};

export default KanbanPage;