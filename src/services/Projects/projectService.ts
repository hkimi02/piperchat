import apiClient from '@/services/apiClient';

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

const projectService = {
    getProjects: () => apiClient.get<Project[]>('/projects'),
    getProject: (id: number) => apiClient.get<Project>(`/projects/${id}`),
    updateProject: (id: number, data: { name: string; description?: string }) =>
        apiClient.put<Project>(`/projects/${id}`, data),
    createProject: (data: { name: string; description?: string; organisation_id: number }) =>
        apiClient.post<Project>('/projects', data),
    getAllUsers: () => apiClient.get<User[]>('/organisation/users'),
};

export default projectService;