import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import projectService from '@/services/Projects/projectService';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import KanbanBoard from "@/components/kanabanBoard/kanbanBoard.tsx";

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
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProject = async () => {
            if (!projectId) {
                toast.error('Project ID is missing.');
                setLoading(false);
                return;
            }

            try {
                const response = await projectService.getProject(parseInt(projectId));
                setProject(response.data);
            } catch (error) {
                console.error('Failed to fetch project:', error);
                toast.error('Failed to fetch project.');
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [projectId]);

    if (loading) {
        return <div className="p-4">Loading...</div>;
    }

    if (!project) {
        return (
            <div className="p-4">
                <h2 className="text-xl font-semibold">Project Not Found</h2>
                <Link to="/dashboard">
                    <Button variant="outline" className="mt-4">
                        Back to Dashboard
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="p-4 h-[calc(100vh-3.5rem)]">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{project.name} - Kanban Board</h2>
                <Link to="/dashboard">
                    <Button variant="outline">
                        Back to Dashboard
                    </Button>
                </Link>
            </div>
            <KanbanBoard projectId={project.id} />
        </div>
    );
};

export default KanbanPage;