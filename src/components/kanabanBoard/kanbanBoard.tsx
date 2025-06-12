import React, { useState } from 'react';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { MoreVertical, Plus, Calendar, Edit, Trash2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    initials: string;
    color: string;
}

interface Tag {
    name: string;
    color: string;
}

interface Task {
    id: string;
    title: string;
    description: string;
    status: string;
    projectId: string;
    assigneeId: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    dueDate?: string;
    tags: Tag[];
}

interface Column {
    id: string;
    title: string;
    color: string;
    limit?: number;
}

interface Project {
    id: string;
    name: string;
    color: string;
}

interface HistoryItem {
    action: 'delete' | 'edit';
    task: Task;
    previousState?: Task;
}

// Mock data
const mockUsers: User[] = [
    { id: 'user-1', name: 'Alice Johnson', email: 'alice@company.com', initials: 'AJ', color: 'bg-blue-500' },
    { id: 'user-2', name: 'Bob Smith', email: 'bob@company.com', initials: 'BS', color: 'bg-green-500' },
    { id: 'user-3', name: 'Carol Davis', email: 'carol@company.com', initials: 'CD', color: 'bg-purple-500' },
    { id: 'user-4', name: 'David Wilson', email: 'david@company.com', initials: 'DW', color: 'bg-orange-500' },
];

const mockProjects: Project[] = [
    { id: 'proj-1', name: 'Website Redesign', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { id: 'proj-2', name: 'Mobile App', color: 'bg-green-100 text-green-800 border-green-200' },
    { id: 'proj-3', name: 'API Development', color: 'bg-purple-100 text-purple-800 border-purple-200' },
];

const initialTasks: Task[] = [
    {
        id: 'task-1',
        title: 'Design System Components',
        description: 'Create a comprehensive design system with reusable components for the dashboard interface',
        status: 'todo',
        projectId: 'proj-1',
        assigneeId: 'user-1',
        priority: 'high',
        dueDate: '2025-06-20',
        tags: [{ name: 'Design', color: 'bg-blue-200' }, { name: 'UI/UX', color: 'bg-purple-200' }]
    },
    {
        id: 'task-2',
        title: 'API Authentication Integration',
        description: 'Implement OAuth 2.0 authentication flow and integrate with existing login system',
        status: 'in-progress',
        projectId: 'proj-2',
        assigneeId: 'user-2',
        priority: 'urgent',
        dueDate: '2025-06-15',
        tags: [{ name: 'Backend', color: 'bg-green-200' }, { name: 'Security', color: 'bg-red-200' }]
    },
    {
        id: 'task-3',
        title: 'User Acceptance Testing',
        description: 'Conduct comprehensive testing of authentication flows and verify token refresh mechanisms',
        status: 'review',
        projectId: 'proj-1',
        assigneeId: 'user-3',
        priority: 'medium',
        dueDate: '2025-06-25',
        tags: [{ name: 'Testing', color: 'bg-yellow-200' }, { name: 'QA', color: 'bg-orange-200' }]
    },
    {
        id: 'task-4',
        title: 'Production Deployment',
        description: 'Deploy backend services to production environment with proper monitoring and logging',
        status: 'done',
        projectId: 'proj-3',
        assigneeId: 'user-4',
        priority: 'high',
        tags: [{ name: 'DevOps', color: 'bg-indigo-200' }, { name: 'Deployment', color: 'bg-teal-200' }]
    },
];

const columns: Column[] = [
    { id: 'todo', title: 'To Do', color: 'border-l-slate-500', limit: 8 },
    { id: 'in-progress', title: 'In Progress', color: 'border-l-blue-500', limit: 3 },
    { id: 'review', title: 'In Review', color: 'border-l-yellow-500', limit: 5 },
    { id: 'done', title: 'Completed', color: 'border-l-green-500' },
];

const priorityConfig = {
    low: { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: '🔵' },
    medium: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: '🟡' },
    high: { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: '🟠' },
    urgent: { color: 'bg-red-100 text-red-700 border-red-200', icon: '🔴' },
};

const tagColors = [
    'bg-blue-200', 'bg-green-200', 'bg-red-200', 'bg-yellow-200',
    'bg-purple-200', 'bg-orange-200', 'bg-indigo-200', 'bg-teal-200'
];

// Sortable task component
const SortableTask: React.FC<{
    task: Task;
    columnId: string;
    onDelete: (taskId: string) => void;
    onEdit: (task: Task) => void;
}> = ({ task, onDelete, onEdit }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: task.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const assignee = mockUsers.find(user => user.id === task.assigneeId);
    const project = mockProjects.find(proj => proj.id === task.projectId);
    const priority = priorityConfig[task.priority];

    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
                'mb-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing',
                isDragging && 'opacity-75 shadow-lg rotate-2 scale-105',
                isOverdue && 'ring-2 ring-red-200 border-red-300'
            )}
        >
            <div className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1 line-clamp-2">
                            {task.title}
                        </h3>
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                            {task.description}
                        </p>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-gray-600">
                                <MoreVertical className="h-3 w-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => onEdit(task)}>
                                <Edit className="h-3 w-3 mr-2" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-red-600">
                                <Trash2 className="h-3 w-3 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {task.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} className={cn("text-xs px-2 py-0.5", tag.color)}>
                                {tag.name}
                            </Badge>
                        ))}
                        {task.tags.length > 2 && (
                            <Badge className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700">
                                +{task.tags.length - 2}
                            </Badge>
                        )}
                    </div>
                )}

                {project && (
                    <Badge className={cn("text-xs font-medium border", project.color)}>
                        {project.name}
                    </Badge>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                        <Badge className={cn("text-xs border px-2 py-0.5", priority.color)}>
                            <span className="mr-1">{priority.icon}</span>
                            {task.priority}
                        </Badge>

                        {task.dueDate && (
                            <div className={cn(
                                "flex items-center text-xs",
                                isOverdue ? "text-red-600" : "text-gray-500"
                            )}>
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                        )}
                    </div>

                    {assignee && (
                        <div className="flex items-center space-x-1">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={assignee.avatar} alt={assignee.name} />
                                <AvatarFallback className={cn("text-xs font-medium text-white", assignee.color)}>
                                    {assignee.initials}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

const KanbanBoard: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [selectedProject, setSelectedProject] = useState<string>('all');
    const [selectedUser, setSelectedUser] = useState<string>('all');
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [newTaskAssignee, setNewTaskAssignee] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
    const [newTaskDueDate, setNewTaskDueDate] = useState<Date | undefined>();
    const [newTaskTags, setNewTaskTags] = useState<Tag[]>([]);
    const [newTagName, setNewTagName] = useState('');
    const [newTagColor, setNewTagColor] = useState(tagColors[0]);
    const [editTask, setEditTask] = useState<Task | null>(null);
    const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);

    // Filter tasks by user and project
    const filteredTasks = tasks.filter((task) => {
        const isInSelectedProject = selectedProject === 'all' || task.projectId === selectedProject;
        const isAssignedToSelectedUser = selectedUser === 'all' || task.assigneeId === selectedUser;
        return isInSelectedProject && isAssignedToSelectedUser;
    });

    // Handle drag end
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) return;

        const activeTaskId = active.id as string;
        const overId = over.id as string;

        const activeTask = tasks.find((task) => task.id === activeTaskId);
        if (!activeTask) return;

        setTasks((prevTasks) => {
            const newTasks = [...prevTasks];
            const activeIndex = newTasks.findIndex((task) => task.id === activeTaskId);

            // If dropped on a column
            if (columns.some((col) => col.id === overId)) {
                newTasks[activeIndex] = { ...activeTask, status: overId };
                return newTasks;
            }

            // If dropped on another task
            const overIndex = newTasks.findIndex((task) => task.id === overId);
            if (overIndex === -1) return prevTasks;

            const overTask = newTasks[overIndex];
            newTasks[activeIndex] = { ...activeTask, status: overTask.status };
            return arrayMove(newTasks, activeIndex, overIndex);
        });
    };

    // Add new task
    const addTask = (columnId: string) => {
        if (!newTaskTitle.trim() || !newTaskAssignee) return;

        const newTask: Task = {
            id: `task-${Date.now()}`,
            title: newTaskTitle,
            description: newTaskDescription,
            status: columnId,
            projectId: selectedProject === 'all' ? mockProjects[0].id : selectedProject,
            assigneeId: newTaskAssignee,
            priority: newTaskPriority,
            dueDate: newTaskDueDate ? newTaskDueDate.toISOString() : undefined,
            tags: newTaskTags,
        };

        setTasks([...tasks, newTask]);
        resetForm();
        toast("Task Created", {
            description: `${newTask.title} has been added.`,
        });
    };

    // Edit task
    const handleEditTask = () => {
        if (!editTask || !editTask.title.trim() || !editTask.assigneeId) return;

        const previousTask = tasks.find((task) => task.id === editTask.id);
        setTasks(tasks.map((task) => (task.id === editTask.id ? editTask : task)));
        setHistory([...history, { action: 'edit', task: editTask, previousState: previousTask }]);
        setEditTask(null);
        toast("Task Updated",{
            description: `${editTask.title} has been updated.`,
            action: (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => undoLastAction()}
                >
                    Undo
                </Button>
            ),
        });
    };

    // Delete task with confirmation
    const confirmDeleteTask = (taskId: string) => {
        setDeleteTaskId(taskId);
    };

    const handleDeleteTask = () => {
        if (!deleteTaskId) return;
        const taskToDelete = tasks.find((task) => task.id === deleteTaskId);
        if (taskToDelete) {
            setTasks(tasks.filter((task) => task.id !== deleteTaskId));
            setHistory([...history, { action: 'delete', task: taskToDelete }]);
            toast("Task Deleted",{
                description: `${taskToDelete.title} has been deleted.`,
                action: (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => undoLastAction()}
                    >
                        Undo
                    </Button>
                ),
            });
        }
        setDeleteTaskId(null);
    };

    // Undo last action
    const undoLastAction = () => {
        if (history.length === 0) return;

        const lastAction = history[history.length - 1];
        if (lastAction.action === 'delete') {
            setTasks([...tasks, lastAction.task]);
        } else if (lastAction.action === 'edit' && lastAction.previousState) {
            setTasks(tasks.map((task) => (task.id === lastAction.task.id ? lastAction.previousState : task)));
        }
        setHistory(history.slice(0, -1));
        toast({
            title: "Action Undone",
            description: `Last action has been undone.`,
        });
    };

    // Add tag
    const addTag = () => {
        if (!newTagName.trim()) return;
        setNewTaskTags([...newTaskTags, { name: newTagName, color: newTagColor }]);
        setNewTagName('');
        setNewTagColor(tagColors[0]);
    };

    // Remove tag
    const removeTag = (tagName: string, isEdit = false) => {
        if (isEdit && editTask) {
            setEditTask({ ...editTask, tags: editTask.tags.filter(tag => tag.name !== tagName) });
        } else {
            setNewTaskTags(newTaskTags.filter(tag => tag.name !== tagName));
        }
    };

    // Reset form
    const resetForm = () => {
        setNewTaskTitle('');
        setNewTaskDescription('');
        setNewTaskAssignee('');
        setNewTaskPriority('medium');
        setNewTaskDueDate(undefined);
        setNewTaskTags([]);
        setNewTagName('');
        setNewTagColor(tagColors[0]);
    };

    // Get column task count
    const getColumnTaskCount = (columnId: string) => {
        return filteredTasks.filter(task => task.status === columnId).length;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Project Board</h1>
                            <p className="text-sm text-gray-600 mt-1">Manage tasks and track progress across projects</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            <Select value={selectedProject} onValueChange={setSelectedProject}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="All Projects" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Projects</SelectItem>
                                    {mockProjects.map((project) => (
                                        <SelectItem key={project.id} value={project.id}>
                                            {project.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={selectedUser} onValueChange={setSelectedUser}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="All Users" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Users</SelectItem>
                                    {mockUsers.map((user) => (
                                        <SelectItem key={user.id} value={user.id}>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-5 w-5">
                                                    <AvatarFallback className={cn("text-xs text-white", user.color)}>
                                                        {user.initials}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {user.name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Task Modal */}
            {editTask && (
                <Dialog open={!!editTask} onOpenChange={() => setEditTask(null)}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Edit Task</DialogTitle>
                            <DialogDescription>Update the task details below.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <Input
                                placeholder="Task title"
                                value={editTask.title}
                                onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                            />
                            <Input
                                placeholder="Description"
                                value={editTask.description}
                                onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                            />
                            <Select
                                value={editTask.assigneeId}
                                onValueChange={(value) => setEditTask({ ...editTask, assigneeId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Assign to..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {mockUsers.map((user) => (
                                        <SelectItem key={user.id} value={user.id}>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-5 w-5">
                                                    <AvatarFallback className={cn("text-xs text-white", user.color)}>
                                                        {user.initials}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {user.name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={editTask.priority}
                                onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => setEditTask({ ...editTask, priority: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">🔵 Low Priority</SelectItem>
                                    <SelectItem value="medium">🟡 Medium Priority</SelectItem>
                                    <SelectItem value="high">🟠 High Priority</SelectItem>
                                    <SelectItem value="urgent">🔴 Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                value={editTask.projectId}
                                onValueChange={(value) => setEditTask({ ...editTask, projectId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select project..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {mockProjects.map((project) => (
                                        <SelectItem key={project.id} value={project.id}>
                                            {project.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !editTask.dueDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {editTask.dueDate ? format(new Date(editTask.dueDate), "PPP") : <span>Pick a due date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <CalendarPicker
                                        mode="single"
                                        selected={editTask.dueDate ? new Date(editTask.dueDate) : undefined}
                                        onSelect={(date) => setEditTask({ ...editTask, dueDate: date?.toISOString() })}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <div className="space-y-2">
                                <div className="font-medium text-xs text-gray-700">Tags</div>
                                <div className="flex flex-wrap gap-1 mb-2">
                                    {editTask.tags.map((tag) => (
                                        <Badge
                                            key={tag.name}
                                            className={cn("text-xs cursor-pointer", tag.color)}
                                            onClick={() => removeTag(tag.name, true)}
                                        >
                                            {tag.name} ✕
                                        </Badge>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="New tag"
                                        value={newTagName}
                                        onChange={(e) => setNewTagName(e.target.value)}
                                    />
                                    <Select value={newTagColor} onValueChange={setNewTagColor}>
                                        <SelectTrigger className="w-[100px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {tagColors.map((color) => (
                                                <SelectItem key={color} value={color}>
                                                    <div className={cn("w-4 h-4 rounded-full", color)} />
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        if (!newTagName.trim()) return;
                                        setEditTask({ ...editTask, tags: [...editTask.tags, { name: newTagName, color: newTagColor }] });
                                        setNewTagName('');
                                        setNewTagColor(tagColors[0]);
                                    }}
                                    disabled={!newTagName.trim()}
                                    className="w-full"
                                >
                                    Add Tag
                                </Button>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditTask(null)}>
                                Cancel
                            </Button>
                            <Button onClick={handleEditTask} disabled={!editTask.title.trim() || !editTask.assigneeId}>
                                Save
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Delete Confirmation Modal */}
            <Dialog open={!!deleteTaskId} onOpenChange={() => setDeleteTaskId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Delete</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this task? This action can be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTaskId(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteTask}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Board */}
            <div className="p-6">
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <div className="flex gap-6 overflow-x-auto pb-4 min-h-[calc(100vh-200px)]">
                        {columns.map((column) => {
                            const columnTasks = filteredTasks.filter((task) => task.status === column.id);
                            const isOverLimit = column.limit && columnTasks.length >= column.limit;

                            return (
                                <Card
                                    key={column.id}
                                    className={cn(
                                        "flex-shrink-0 w-80 bg-white border-l-4 shadow-sm",
                                        column.color
                                    )}
                                >
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-gray-700">
                                                    {column.title}
                                                </span>
                                                <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                                                    {columnTasks.length}
                                                    {column.limit && `/${column.limit}`}
                                                </Badge>
                                            </div>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="w-80" align="end">
                                                    <div className="p-4 space-y-3">
                                                        <div className="font-medium text-sm text-gray-900">Add New Task</div>
                                                        <Input
                                                            placeholder="Task title"
                                                            value={newTaskTitle}
                                                            onChange={(e) => setNewTaskTitle(e.target.value)}
                                                        />
                                                        <Input
                                                            placeholder="Description"
                                                            value={newTaskDescription}
                                                            onChange={(e) => setNewTaskDescription(e.target.value)}
                                                        />
                                                        <Select value={newTaskAssignee} onValueChange={setNewTaskAssignee}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Assign to..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {mockUsers.map((user) => (
                                                                    <SelectItem key={user.id} value={user.id}>
                                                                        <div className="flex items-center gap-2">
                                                                            <Avatar className="h-5 w-5">
                                                                                <AvatarFallback className={cn("text-xs text-white", user.color)}>
                                                                                    {user.initials}
                                                                                </AvatarFallback>
                                                                            </Avatar>
                                                                            {user.name}
                                                                        </div>
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <Select value={newTaskPriority} onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => setNewTaskPriority(value)}>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="low">🔵 Low Priority</SelectItem>
                                                                <SelectItem value="medium">🟡 Medium Priority</SelectItem>
                                                                <SelectItem value="high">🟠 High Priority</SelectItem>
                                                                <SelectItem value="urgent">🔴 Urgent</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <Select value={selectedProject} onValueChange={setSelectedProject}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select project..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {mockProjects.map((project) => (
                                                                    <SelectItem key={project.id} value={project.id}>
                                                                        {project.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    className={cn(
                                                                        "w-full justify-start text-left font-normal",
                                                                        !newTaskDueDate && "text-muted-foreground"
                                                                    )}
                                                                >
                                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                                    {newTaskDueDate ? format(newTaskDueDate, "PPP") : <span>Pick a due date</span>}
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0">
                                                                <CalendarPicker
                                                                    mode="single"
                                                                    selected={newTaskDueDate}
                                                                    onSelect={setNewTaskDueDate}
                                                                    initialFocus
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                        <div className="space-y-2">
                                                            <div className="font-medium text-xs text-gray-700">Tags</div>
                                                            <div className="flex flex-wrap gap-1 mb-2">
                                                                {newTaskTags.map((tag) => (
                                                                    <Badge
                                                                        key={tag.name}
                                                                        className={cn("text-xs cursor-pointer", tag.color)}
                                                                        onClick={() => removeTag(tag.name)}
                                                                    >
                                                                        {tag.name} ✕
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <Input
                                                                    placeholder="New tag"
                                                                    value={newTagName}
                                                                    onChange={(e) => setNewTagName(e.target.value)}
                                                                />
                                                                <Select value={newTagColor} onValueChange={setNewTagColor}>
                                                                    <SelectTrigger className="w-[100px]">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {tagColors.map((color) => (
                                                                            <SelectItem key={color} value={color}>
                                                                                <div className={cn("w-4 h-4 rounded-full", color)} />
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={addTag}
                                                                disabled={!newTagName.trim()}
                                                                className="w-full"
                                                            >
                                                                Add Tag
                                                            </Button>
                                                        </div>
                                                        <Button
                                                            onClick={() => addTask(column.id)}
                                                            className="w-full"
                                                            disabled={!newTaskTitle.trim() || !newTaskAssignee || isOverLimit}
                                                        >
                                                            {isOverLimit ? 'Column Limit Reached' : 'Add Task'}
                                                        </Button>
                                                    </div>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <SortableContext
                                            items={columnTasks.map((task) => task.id)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            <div className="space-y-2 min-h-[400px]">
                                                {columnTasks.map((task) => (
                                                    <SortableTask
                                                        key={task.id}
                                                        task={task}
                                                        columnId={column.id}
                                                        onDelete={confirmDeleteTask}
                                                        onEdit={setEditTask}
                                                    />
                                                ))}
                                                {columnTasks.length === 0 && (
                                                    <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                                                        <div className="text-2xl mb-2">📋</div>
                                                        <p className="text-sm">No tasks yet</p>
                                                    </div>
                                                )}
                                            </div>
                                        </SortableContext>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </DndContext>
            </div>
        </div>
    );
};

export default KanbanBoard;