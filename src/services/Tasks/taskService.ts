import apiClient from '@/services/apiClient';

const taskService = {
    getTasks: (projectId: number) => apiClient.get(`/tasks?project_id=${projectId}`),
    createTask: (data: { title: string; description?: string; status: string; project_id: number }) =>
        apiClient.post('/tasks', data),
    updateTask: (id: number, data: { title: string; description?: string; status: string }) =>
        apiClient.put(`/tasks/${id}`, data),
    deleteTask: (id: number) => apiClient.delete(`/tasks/${id}`),
};

export default taskService;