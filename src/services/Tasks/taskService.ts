import apiClient from '@/services/apiClient';

const taskService = {

    getTasks: (projectId: number) => apiClient.get(`/tasks?project_id=${projectId}`),
    getStatistics: (projectId: number) => apiClient.get(`/tasks/statistics?project_id=${projectId}`),
    createTask: (data: {
        id: number;
        title: string;
        description?: string;
        status: string;
        project_id: number;
        user_id: number;
        priority?: "low" | "medium" | "high" | "urgent";
        due_date?: string;
        tags: any[];
    }) =>
        apiClient.post('/tasks', data),
    updateTask: (id: number, data: {
        status: string;
        title: string;
        description: string | undefined;
        user_id: number | null;
        priority: "low" | "medium" | "high" | "urgent" | undefined;
        due_date: string | undefined;
        tags: Tag[]
    }) =>
        apiClient.put(`/tasks/${id}`, data),
    deleteTask: (id: number) => apiClient.delete(`/tasks/${id}`),
};

export default taskService;