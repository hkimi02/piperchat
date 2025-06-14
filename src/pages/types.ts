export interface User {
    id: number;
    first_name: string;
    last_name: string;
}

export interface Task {
    id: number;
    title: string;
    description?: string;
    status: string;
    project_id: number;
    user_id: number | null;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    due_date?: string;
    tags: { name: string; color: string }[];
    user?: User;
    created_at: string;
    is_assigned: boolean;
}

export interface Project {
    id: number;
    name: string;
    description?: string;
    organisation_id: number;
    tasks: Task[];
}

export interface StatisticsData{
    byStatus: { [status: string]: number };
    byPriority: { [priority: string]: number };
    tasks: Task[];
}

export interface RootState {
    auth: { user: { id: number; role: 'ADMIN' | 'USER'; organisation_id: number } | null };
}