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
                toast.error('Projet non trouvé.');
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const projectResponse = await projectService.getProject(parseInt(projectId));
                setProject(projectResponse.data);
                setSelectedProjectForList(projectResponse.data);
            } catch (error) {
                console.error('Échec du chargement du projet:', error);
                toast.error('Projet non trouvé.');
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
        return <div className="flex items-center justify-center h-full">Chargement...</div>;
    }

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <h2 className="text-lg font-semibold">Projet non trouvé</h2>
                <Button variant="outline" className="mt-3" onClick={() => navigate('/dashboard')}>
                    Retour au tableau de bord
                </Button>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-3rem)] text-foreground bg-background">
            <aside className="hidden md:flex md:flex-col w-16 bg-gray-50 border-r">
                <ProjectList
                    selectedProject={selectedProjectForList}
                    onSelectProject={handleSelectProject}
                />
            </aside>
            <main className="flex-1 flex flex-col">
                <header className="flex items-center justify-between p-3 border-b bg-background">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={handleGoBack}>
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <h2 className="text-lg font-semibold">{project.name} - Tableau Kanban</h2>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto">
                    <KanbanBoard projectId={project.id} />
                </div>
            </main>
        </div>
    );
};

export default KanbanPage;