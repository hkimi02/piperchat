import React, { useState, useEffect, useMemo } from 'react';
import { DndContext, closestCenter, useDroppable, type DragEndEvent } from '@dnd-kit/core';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import taskService from '@/services/Tasks/taskService';
import projectService from '@/services/Projects/projectService';
import { useSelector } from 'react-redux';

interface User {
    id: number;
    first_name: string;
    last_name: string;
    initials: string;
}

interface Tag {
    name: string;
    color: string;
}

interface Task {
    id: number;
    title: string;
    description?: string;
    status: string;
    project_id: number;
    user_id: number | null;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    due_date?: string;
    tags: Tag[];
    user?: User;
}

interface Column {
    id: string;
    title: string;
    color: string;
    limit?: number;
}

interface HistoryItem {
    action: 'delete' | 'edit';
    task: Task;
    previousState?: Task;
}

interface RootState {
    auth: { user: { id: number; role: 'ADMIN' | 'USER'; organisation_id: number } | null };
}

interface KanbanBoardProps {
    projectId: number;
}

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
    'bg-purple-200', 'bg-orange-200', 'bg-indigo-200', 'bg-teal-200',
];

const SortableTask: React.FC<{
    task: Task;
    columnId: string;
    onDelete: (taskId: number) => void;
    onEdit: (task: Task) => void;
}> = ({ task, onDelete, onEdit }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: task.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const assignee = task.user;
    const priority = task.priority ? priorityConfig[task.priority] : priorityConfig.medium;
    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';

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
                            {task.description || 'No description'}
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

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                        <Badge className={cn("text-xs border px-2 py-0.5", priority.color)}>
                            <span className="mr-1">{priority.icon}</span>
                            {task.priority || 'Medium'}
                        </Badge>

                        {task.due_date && (
                            <div className={cn(
                                "flex items-center text-xs",
                                isOverdue ? "text-red-600" : "text-gray-500"
                            )}>
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                        )}
                    </div>

                    {assignee && (
                        <div className="flex items-center space-x-1">
                            <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs font-medium text-white bg-blue-500">
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

const DroppableColumn: React.FC<{
    id: string;
    children: React.ReactNode;
}> = ({ id, children }) => {
    const { setNodeRef } = useDroppable({
        id,
    });

    return (
        <div ref={setNodeRef} className="h-full">
            {children}
        </div>
    );
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ projectId }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [newTaskAssignee, setNewTaskAssignee] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
    const [newTaskDueDate, setNewTaskDueDate] = useState<Date | undefined>();
    const [newTaskTags, setNewTaskTags] = useState<Tag[]>([]);
    const [newTagName, setNewTagName] = useState('');
    const [newTagColor, setNewTagColor] = useState(tagColors[0]);
    const [editTask, setEditTask] = useState<Task | null>(null);
    const [deleteTaskId, setDeleteTaskId] = useState<number | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const currentUser = useSelector((state: RootState) => state.auth.user);

    // Memoize column tasks
    const columnTasksMap = useMemo(() => {
        return columns.reduce((acc, column) => {
            acc[column.id] = tasks.filter((task) => task.status === column.id);
            return acc;
        }, {} as Record<string, Task[]>);
    }, [tasks]);

    // Fetch tasks and users
    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser) {
                toast.error('User not authenticated.');
                return;
            }

            try {
                const taskResponse = await taskService.getTasks(projectId);
                setTasks(taskResponse.data);

                const userResponse = await projectService.getAllUsers();
                setUsers(userResponse.data.map(user => ({
                    ...user,
                    initials: `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`
                })));
            } catch (error) {
                console.error('Failed to fetch data:', error);
                toast.error('Failed to load tasks or users.');
            }
        };

        fetchData();
    }, [projectId, currentUser]);

    // Handle drag end
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) return;

        const activeTaskId = active.id as number;
        const overId = over.id;

        const activeTask = tasks.find((task) => task.id === activeTaskId);
        if (!activeTask) return;

        let newTasks = [...tasks];
        let newStatus = activeTask.status;

        let targetColumnId: string | undefined;
        if (typeof overId === 'string' && columns.some((col) => col.id === overId)) {
            targetColumnId = overId;
            newStatus = overId;
        } else {
            const overTaskId = typeof overId === 'string' ? parseInt(overId) : overId;
            const overTask = tasks.find((task) => task.id === overTaskId);
            if (overTask) {
                targetColumnId = overTask.status;
                newStatus = overTask.status;
                const activeIndex = tasks.findIndex((task) => task.id === activeTaskId);
                const overIndex = tasks.findIndex((task) => task.id === overTaskId);
                newTasks = arrayMove(tasks, activeIndex, overIndex);
            } else {
                const targetColumn = columns.find((col) =>
                    newTasks
                        .filter((task) => task.status === col.id)
                        .some((task) => task.id === activeTaskId)
                );
                if (targetColumn) {
                    targetColumnId = targetColumn.id;
                    newStatus = targetColumn.id;
                }
            }
        }

        if (targetColumnId && targetColumnId !== activeTask.status) {
            const targetColumn = columns.find((col) => col.id === targetColumnId);
            const columnTasks = tasks.filter((task) => task.status === targetColumnId);
            if (targetColumn?.limit && columnTasks.length >= targetColumn.limit) {
                toast.error(`Cannot move task to ${targetColumn.title}: Column limit of ${targetColumn.limit} reached.`);
                return;
            }
        }

        const updatedTasks = newTasks.map((task) =>
            task.id === activeTaskId ? { ...task, status: newStatus } : task
        );
        const originalTasks = [...tasks];
        setTasks(updatedTasks);

        try {
            await taskService.updateTask(activeTaskId, {
                status: newStatus,
                title: activeTask.title,
                description: activeTask.description,
                user_id: activeTask.user_id,
                priority: activeTask.priority,
                due_date: activeTask.due_date,
                tags: activeTask.tags,
            });
        } catch (error) {
            console.error('Failed to update task status:', error);
            toast.error('Failed to update task status.');
            setTasks(originalTasks);
        }
    };

    // Add new task
    const addTask = async (columnId: string) => {
        if (!newTaskTitle.trim() || !newTaskAssignee) {
            toast.error('Title and assignee are required.');
            return;
        }

        const newTask: Task = {
            id: 0,
            title: newTaskTitle,
            description: newTaskDescription,
            status: columnId,
            project_id: projectId,
            user_id: parseInt(newTaskAssignee),
            priority: newTaskPriority || 'medium',
            due_date: newTaskDueDate ? newTaskDueDate.toISOString() : undefined,
            tags: newTaskTags,
        };

        try {
            const response = await taskService.createTask({
                ...newTask,
                user_id: parseInt(newTaskAssignee),
                project_id: projectId,
            });
            setTasks([...tasks, response.data]);
            resetForm();
            toast.success(`${newTask.title} has been added.`);
        } catch (error) {
            console.error('Failed to create task:', error);
            toast.error('Failed to create task.');
        }
    };

    // Edit task
    const handleEditTask = async () => {
        if (!editTask || !editTask.title.trim() || !editTask.user_id) {
            toast.error('Title and assignee are required.');
            return;
        }

        const previousTask = tasks.find((task) => task.id === editTask.id);
        try {
            const response = await taskService.updateTask(editTask.id, {
                title: editTask.title,
                description: editTask.description,
                status: editTask.status,
                user_id: editTask.user_id,
                priority: editTask.priority || 'medium',
                due_date: editTask.due_date,
                tags: editTask.tags,
            });
            setTasks(tasks.map((task) => (task.id === editTask.id ? response.data : task)));
            setHistory([...history, { action: 'edit', task: response.data, previousState: previousTask }]);
            setEditTask(null);
            toast.success(`${editTask.title} has been updated.`, {
                action: {
                    label: 'Undo',
                    onClick: () => undoLastAction(),
                },
            });
        } catch (error) {
            console.error('Failed to update task:', error);
            toast.error('Failed to update task.');
        }
    };

    // Delete task with confirmation
    const confirmDeleteTask = (taskId: number) => {
        setDeleteTaskId(taskId);
    };

    const handleDeleteTask = async () => {
        if (!deleteTaskId) return;
        const taskToDelete = tasks.find((task) => task.id === deleteTaskId);
        if (taskToDelete) {
            try {
                await taskService.deleteTask(deleteTaskId);
                setTasks(tasks.filter((task) => task.id !== deleteTaskId));
                setHistory([...history, { action: 'delete', task: taskToDelete }]);
                toast.success(`${taskToDelete.title} has been deleted.`, {
                    action: {
                        label: 'Undo',
                        onClick: () => undoLastAction(),
                    },
                });
            } catch (error) {
                console.error('Failed to delete task:', error);
                toast.error('Failed to delete task.');
            }
        }
        setDeleteTaskId(null);
    };

    // Undo last action
    const undoLastAction = async () => {
        if (history.length === 0) return;

        const lastAction = history[history.length - 1];
        try {
            if (lastAction.action === 'delete') {
                const response = await taskService.createTask({
                    title: lastAction.task.title,
                    description: lastAction.task.description,
                    status: lastAction.task.status,
                    project_id: lastAction.task.project_id,
                    user_id: lastAction.task.user_id!,
                    priority: lastAction.task.priority || 'medium',
                    due_date: lastAction.task.due_date,
                    tags: lastAction.task.tags,
                });
                setTasks([...tasks, response.data]);
            } else if (lastAction.action === 'edit' && lastAction.previousState) {
                const response = await taskService.updateTask(lastAction.task.id, {
                    title: lastAction.previousState.title,
                    description: lastAction.previousState.description,
                    status: lastAction.previousState.status,
                    user_id: lastAction.previousState.user_id,
                    priority: lastAction.previousState.priority || 'medium',
                    due_date: lastAction.previousState.due_date,
                    tags: lastAction.previousState.tags,
                });
                setTasks(tasks.map((task) => (task.id === lastAction.task.id ? response.data : task)));
            }
            setHistory(history.slice(0, -1));
            toast.success('Action undone.');
        } catch (error) {
            console.error('Failed to undo action:', error);
            toast.error('Failed to undo action.');
        }
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
        return columnTasksMap[columnId].length;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
           
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
                                value={editTask.description || ''}
                                onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                            />
                            <Select
                                value={editTask.user_id?.toString() || ''}
                                onValueChange={(value) => setEditTask({ ...editTask, user_id: parseInt(value) })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Assign to..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map((user) => (
                                        <SelectItem key={user.id} value={user.id.toString()}>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-5 w-5">
                                                    <AvatarFallback className="text-xs text-white bg-blue-500">
                                                        {user.initials}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {user.first_name} {user.last_name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={editTask.priority || 'medium'}
                                onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => setEditTask({ ...editTask, priority: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">🔵 Low Priority</SelectItem>
                                    <SelectItem value="medium">🟡 Medium Priority</SelectItem>
                                    <SelectItem value="high">🟢 High Priority</SelectItem>
                                    <SelectItem value="urgent">🔴 Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !editTask.due_date && 'text-muted-foreground'
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {editTask.due_date ? format(new Date(editTask.due_date), 'PPP') : <span>Pick a due date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <CalendarPicker
                                        mode="single"
                                        selected={editTask.due_date ? new Date(editTask.due_date) : undefined}
                                        onSelect={(date) => setEditTask({ ...editTask, due_date: date?.toISOString() })}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <div className="space-y-2">
                                <div className="font-medium text-xs text-gray-700">Tags</div>
                                <div className="flex flex-wrap gap-1 mb-2">
                                    {editTask.tags?.map((tag) => (
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
                            <Button onClick={handleEditTask} disabled={!editTask.title.trim() || !editTask.user_id}>
                                Save
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

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

            <div className="p-6">
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <div className="flex gap-6 overflow-x-auto pb-4 min-h-[calc(100vh-200px)]">
                        {columns.map((column) => {
                            const columnTasks = columnTasksMap[column.id];
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
                                                    {getColumnTaskCount(column.id)}
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
                                                                {users.map((user) => (
                                                                    <SelectItem key={user.id} value={user.id.toString()}>
                                                                        <div className="flex items-center gap-2">
                                                                            <Avatar className="h-5 w-5">
                                                                                <AvatarFallback className="text-xs text-white bg-blue-500">
                                                                                    {user.initials}
                                                                                </AvatarFallback>
                                                                            </Avatar>
                                                                            {user.first_name} {user.last_name}
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
                                                                <SelectItem value="high">🟢 High Priority</SelectItem>
                                                                <SelectItem value="urgent">🔴 Urgent</SelectItem>
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
                                        <DroppableColumn id={column.id}>
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
                                                        <div className="flex flex-col items-center h-32 text-gray-400">
                                                            <div className="text-2xl mb-2">📋</div>
                                                            <p className="text-sm">No tasks yet</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </SortableContext>
                                        </DroppableColumn>
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