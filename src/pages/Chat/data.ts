export interface User {
    id: number;
    full_name: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    profile_picture?: string;
    organisation_id?: number;
}

export interface Message {
    id: number;
    content: string;
    user: User;
    created_at: string;
    chatroom_id: number;
}

export interface Chatroom {
    id: number;
    name: string;
    description: string;
    type: 'organisation' | 'project' | 'private';
    project_id?: number;
    users?: User[];
}
