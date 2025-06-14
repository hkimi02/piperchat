import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DndContext, closestCenter, useDroppable, type DragEndEvent, PointerSensor } from '@dnd-kit/core';
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
import { fr } from 'date-fns/locale/fr';
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
    { id: 'todo', title: 'À faire', color: 'border-l-slate-500', limit: 8 },
    { id: 'in-progress', title: 'En cours', color: 'border-l-blue-500', limit: 3 },
    { id: 'review', title: 'En révision', color: 'border-l-yellow-500', limit: 5 },
    { id: 'done', title: 'Terminé', color: 'border-l-green-500' },
];

const priorityConfig = {
    low: { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: '🔵', label: 'Basse' },
    medium: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: '🟡', label: 'Moyenne' },
    high: { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: '🟠', label: 'Haute' },
    urgent: { color: 'bg-red-100 text-red-700 border-red-200', icon: '🔴', label: 'Urgente' },
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
        transition: {
            duration: 150,
            easing: 'ease-out',
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        touchAction: 'none',
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
                'mb-2 bg-white border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-shadow duration-150 cursor-grab',
                isDragging && 'opacity-90 shadow-xl scale-102 rotate-1',
                isOverdue && 'ring-1 ring-red-200 border-red-300'
            )}
        >
            <div className="p-2 sm:p-3 space-y-2">
                <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-[11px] sm:text-xs leading-tight mb-1 line-clamp-2">
                            {task.title}
                        </h3>
                        <p className="text-[9px] sm:text-[10px] text-gray-600 line-clamp-2 leading-relaxed">
                            {task.description || 'Aucune description'}
                        </p>
                        <p className="text-[9px] sm:text-[10px] text-gray-500 mt-1 line-clamp-1">
                            Assigné à: {assignee ? `${assignee.first_name} ${assignee.last_name}` : 'Non assigné'}
                        </p>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600">
                                <MoreVertical className="h-2 w-2 sm:h-3 sm:w-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32 sm:w-36">
                            <DropdownMenuItem onClick={() => onEdit(task)}>
                                <Edit className="h-2 w-2 sm:h-3 sm:w-3 mr-2" />
                                Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-red-600">
                                <Trash2 className="h-2 w-2 sm:h-3 sm:w-3 mr-2" />
                                Supprimer
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {task.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} className={cn("text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5", tag.color)}>
                                {tag.name}
                            </Badge>
                        ))}
                        {task.tags.length > 2 && (
                            <Badge className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 bg-gray-100 text-gray-700">
                                +{task.tags.length - 2}
                            </Badge>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                    <div className="flex items-center space-x-1 sm:space-x-1.5">
                        <Badge className={cn("text-[9px] sm:text-[10px] border px-1 sm:px-1.5 py-0.5", priority.color)}>
                            <span className="mr-0.5 sm:mr-1">{priority.icon}</span>
                            {priority.label}
                        </Badge>

                        {task.due_date && (
                            <div className={cn(
                                "flex items-center text-[9px] sm:text-[10px]",
                                isOverdue ? "text-red-600" : "text-gray-500"
                            )}>
                                <Calendar className="h-2 w-2 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                                {format(new Date(task.due_date), 'dd MMM', { locale: fr })}
                            </div>
                        )}
                    </div>

                    {assignee && (
                        <Avatar className="h-4 w-4 sm:h-5 sm:w-5">
                            <AvatarFallback className="text-[9px] sm:text-[10px] font-medium text-white bg-blue-500">
                                {assignee.initials}
                            </AvatarFallback>
                        </Avatar>
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

    const columnTasksMap = useMemo(() => {
        return columns.reduce((acc, column) => {
            acc[column.id] = tasks.filter((task) => task.status === column.id);
            return acc;
        }, {} as Record<string, Task[]>);
    }, [tasks]);

    const fetchTasks = useCallback(async () => {
        try {
            const taskResponse = await taskService.getTasks(projectId);
            setTasks(taskResponse.data);
        } catch (error) {
            console.error('Échec du chargement des tâches:', error);
            toast.error('Échec du chargement des tâches.');
        }
    }, [projectId]);

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser) {
                toast.error('Utilisateur non authentifié.');
                return;
            }

            try {
                await fetchTasks();
                const userResponse = await projectService.getAllUsers();
                setUsers(userResponse.data.map(user => ({
                    ...user,
                    initials: `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`
                })));
            } catch (error) {
                console.error('Échec du chargement des données:', error);
                toast.error('Échec du chargement des tâches ou des utilisateurs.');
            }
        };

        fetchData();
    }, [currentUser, projectId, fetchTasks]);

    const handleDragEnd = useCallback(async (event: DragEndEvent) => {
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
                toast.error(`Impossible de déplacer la tâche vers ${targetColumn.title}: Limite de ${targetColumn.limit} atteinte.`);
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
            console.error('Échec de la mise à jour du statut de la tâche:', error);
            toast.error('Échec de la mise à jour du statut de la tâche.');
            setTasks(originalTasks);
        }
    }, [tasks]);

    const addTask = async (columnId: string) => {
        if (!newTaskTitle.trim() || !newTaskAssignee) {
            toast.error('Le titre et l\'assigné sont requis.');
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
            await taskService.createTask({
                ...newTask,
                user_id: parseInt(newTaskAssignee),
                project_id: projectId,
            });
            await fetchTasks(); // Refetch tasks after creation
            resetForm();
            toast.success(`${newTask.title} a été ajouté.`);
        } catch (error) {
            console.error('Échec de la création de la tâche:', error);
            toast.error('Échec de la création de la tâche.');
        }
    };

    const handleEditTask = async () => {
        if (!editTask || !editTask.title.trim() || !editTask.user_id) {
            toast.error('Le titre et l\'assigné sont requis.');
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
            toast.success(`${editTask.title} a été mis à jour.`, {
                action: {
                    label: 'Annuler',
                    onClick: () => undoLastAction(),
                },
            });
        } catch (error) {
            console.error('Échec de la mise à jour de la tâche:', error);
            toast.error('Échec de la mise à jour de la tâche.');
        }
    };

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
                toast.success(`${taskToDelete.title} a été supprimé.`, {
                    action: {
                        label: 'Annuler',
                        onClick: () => undoLastAction(),
                    },
                });
            } catch (error) {
                console.error('Échec de la suppression de la tâche:', error);
                toast.error('Échec de la suppression de la tâche.');
            }
        }
        setDeleteTaskId(null);
    };

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
            toast.success('Action annulée.');
        } catch (error) {
            console.error('Échec de l\'annulation de l\'action:', error);
            toast.error('Échec de l\'annulation de l\'action.');
        }
    };

    const addTag = () => {
        if (!newTagName.trim()) return;
        setNewTaskTags([...newTaskTags, { name: newTagName, color: newTagColor }]);
        setNewTagName('');
        setNewTagColor(tagColors[0]);
    };

    const removeTag = (tagName: string, isEdit = false) => {
        if (isEdit && editTask) {
            setEditTask({ ...editTask, tags: editTask.tags.filter(tag => tag.name !== tagName) });
        } else {
            setNewTaskTags(newTaskTags.filter(tag => tag.name !== tagName));
        }
    };

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

    const getColumnTaskCount = (columnId: string) => {
        return columnTasksMap[columnId].length;
    };

    return (
        <div className="min-h-screen bg-background from-gray-50 to-gray-100 py-2 sm:py-4">
            {editTask && (
                <Dialog open={!!editTask} onOpenChange={() => setEditTask(null)}>
                    <DialogContent className="w-[95vw] max-w-[400px] sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-base sm:text-lg">Modifier la tâche</DialogTitle>
                            <DialogDescription className="text-[11px] sm:text-sm">
                                Mettez à jour les détails de la tâche ci-dessous.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-2 sm:gap-3 py-3 sm:py-4">
                            <Input
                                placeholder="Titre de la tâche"
                                value={editTask.title}
                                onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                                className="text-[11px] sm:text-sm"
                            />
                            <Input
                                placeholder="Description"
                                value={editTask.description || ''}
                                onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                                className="text-[11px] sm:text-sm"
                            />
                            <Select
                                value={editTask.user_id?.toString() || ''}
                                onValueChange={(value) => setEditTask({ ...editTask, user_id: parseInt(value) })}
                            >
                                <SelectTrigger className="text-[11px] sm:text-sm">
                                    <SelectValue placeholder="Assigner à..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map((user) => (
                                        <SelectItem key={user.id} value={user.id.toString()} className="text-[11px] sm:text-sm">
                                            <div className="flex items-center gap-1 sm:gap-2">
                                                <Avatar className="h-3 w-3 sm:h-4 sm:w-4">
                                                    <AvatarFallback className="text-[9px] sm:text-[10px] text-white bg-blue-500">
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
                                <SelectTrigger className="text-[11px] sm:text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low" className="text-[11px] sm:text-sm">🔵 Priorité basse</SelectItem>
                                    <SelectItem value="medium" className="text-[11px] sm:text-sm">🟡 Priorité moyenne</SelectItem>
                                    <SelectItem value="high" className="text-[11px] sm:text-sm">🟠 Priorité haute</SelectItem>
                                    <SelectItem value="urgent" className="text-[11px] sm:text-sm">🔴 Priorité urgente</SelectItem>
                                </SelectContent>
                            </Select>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal text-[11px] sm:text-sm",
                                            !editTask.due_date && 'text-muted-foreground'
                                        )}
                                    >
                                        <CalendarIcon className="mr-1 sm:mr-2 h-2 w-2 sm:h-3 sm:w-3" />
                                        {editTask.due_date ? format(new Date(editTask.due_date), 'PPP', { locale: fr }) : <span>Choisir une date d'échéance</span>}
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
                                <div className="font-medium text-[10px] sm:text-[11px] text-gray-700">Étiquettes</div>
                                <div className="flex flex-wrap gap-1 mb-2">
                                    {editTask.tags?.map((tag) => (
                                        <Badge
                                            key={tag.name}
                                            className={cn("text-[9px] sm:text-[10px] cursor-pointer px-1 sm:px-1.5 py-0.5", tag.color)}
                                            onClick={() => removeTag(tag.name, true)}
                                        >
                                            {tag.name} ✕
                                        </Badge>
                                    ))}
                                </div>
                                <div className="flex gap-1 sm:gap-2">
                                    <Input
                                        placeholder="Nouvelle étiquette"
                                        value={newTagName}
                                        onChange={(e) => setNewTagName(e.target.value)}
                                        className="text-[11px] sm:text-sm"
                                    />
                                    <Select value={newTagColor} onValueChange={setNewTagColor}>
                                        <SelectTrigger className="w-20 sm:w-24 text-[11px] sm:text-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {tagColors.map((color) => (
                                                <SelectItem key={color} value={color}>
                                                    <div className={cn("w-2 h-2 sm:w-3 sm:h-3 rounded-full", color)} />
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
                                        setEditTask({ ...editTask, tags: [...editTask.tags, { name: newTaskName, color: newTagColor }] });
                                        setNewTagName('');
                                        setNewTagColor(tagColors[0]);
                                    }}
                                    disabled={!newTagName.trim()}
                                    className="w-full text-[11px] sm:text-sm"
                                >
                                    Ajouter une étiquette
                                </Button>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditTask(null)} className="text-[11px] sm:text-sm">
                                Annuler
                            </Button>
                            <Button onClick={handleEditTask} disabled={!editTask.title.trim() || !editTask.user_id} className="text-[11px] sm:text-sm">
                                Enregistrer
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            <Dialog open={!!deleteTaskId} onOpenChange={() => setDeleteTaskId(null)}>
                <DialogContent className="w-[95vw] max-w-[400px] sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-base sm:text-lg">Confirmer la suppression</DialogTitle>
                        <DialogDescription className="text-[11px] sm:text-sm">
                            Êtes-vous sûr de vouloir supprimer cette tâche ? Cette action peut être annulée.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTaskId(null)} className="text-[11px] sm:text-sm">
                            Annuler
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteTask} className="text-[11px] sm:text-sm">
                            Supprimer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="px-2 sm:px-4">
                <DndContext
                    sensors={[{ sensor: PointerSensor, options: { activationConstraint: { distance: 5 } } }]}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-120px)]">
                        {columns.map((column) => {
                            const columnTasks = columnTasksMap[column.id];
                            const isOverLimit = column.limit && columnTasks.length >= column.limit;

                            return (
                                <Card
                                    key={column.id}
                                    className={cn(
                                        "bg-white border-l-4 shadow-sm rounded-lg overflow-hidden",
                                        column.color
                                    )}
                                >
                                    <CardHeader className="pb-1 sm:pb-2 bg-gray-50">
                                        <CardTitle className="flex justify-between items-center">
                                            <div className="flex items-center gap-1 sm:gap-2">
                                                <span className="text-xs sm:text-sm font-semibold text-gray-800">
                                                    {column.title}
                                                </span>
                                                <Badge variant="secondary" className="text-[9px] sm:text-[10px] bg-gray-200 text-gray-700">
                                                    {getColumnTaskCount(column.id)}
                                                    {column.limit && `/${column.limit}`}
                                                </Badge>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-4 w-4 sm:h-5 sm:w-5">
                                                        <Plus className="h-2 w-2 sm:h-3 sm:w-3" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="w-[90vw] max-w-[320px] sm:w-80" align="end">
                                                    <div className="p-2 sm:p-3 space-y-1 sm:space-y-2">
                                                        <div className="font-medium text-xs sm:text-sm text-gray-900">Ajouter une nouvelle tâche</div>
                                                        <Input
                                                            placeholder="Titre de la tâche"
                                                            value={newTaskTitle}
                                                            onChange={(e) => setNewTaskTitle(e.target.value)}
                                                            className="text-[11px] sm:text-sm"
                                                        />
                                                        <Input
                                                            placeholder="Description"
                                                            value={newTaskDescription}
                                                            onChange={(e) => setNewTaskDescription(e.target.value)}
                                                            className="text-[11px] sm:text-sm"
                                                        />
                                                        <Select value={newTaskAssignee} onValueChange={setNewTaskAssignee}>
                                                            <SelectTrigger className="text-[11px] sm:text-sm">
                                                                <SelectValue placeholder="Assigner à..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {users.map((user) => (
                                                                    <SelectItem key={user.id} value={user.id.toString()} className="text-[11px] sm:text-sm">
                                                                        <div className="flex items-center gap-1 sm:gap-2">
                                                                            <Avatar className="h-3 w-3 sm:h-4 sm:w-4">
                                                                                <AvatarFallback className="text-[9px] sm:text-[10px] text-white bg-blue-500">
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
                                                            <SelectTrigger className="text-[11px] sm:text-sm">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="low" className="text-[11px] sm:text-sm">🔵 Priorité basse</SelectItem>
                                                                <SelectItem value="medium" className="text-[11px] sm:text-sm">🟡 Priorité moyenne</SelectItem>
                                                                <SelectItem value="high" className="text-[11px] sm:text-sm">🟠 Priorité haute</SelectItem>
                                                                <SelectItem value="urgent" className="text-[11px] sm:text-sm">🔴 Priorité urgente</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    className={cn(
                                                                        "w-full justify-start text-left font-normal text-[11px] sm:text-sm",
                                                                        !newTaskDueDate && "text-muted-foreground"
                                                                    )}
                                                                >
                                                                    <CalendarIcon className="mr-1 sm:mr-2 h-2 w-2 sm:h-3 sm:w-3" />
                                                                    {newTaskDueDate ? format(newTaskDueDate, "PPP", { locale: fr }) : <span>Choisir une date d'échéance</span>}
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
                                                        <div className="space-y-1 sm:space-y-2">
                                                            <div className="font-medium text-[10px] sm:text-[11px] text-gray-700">Étiquettes</div>
                                                            <div className="flex flex-wrap gap-1 mb-1 sm:mb-2">
                                                                {newTaskTags.map((tag) => (
                                                                    <Badge
                                                                        key={tag.name}
                                                                        className={cn("text-[9px] sm:text-[10px] cursor-pointer px-1 sm:px-1.5 py-0.5", tag.color)}
                                                                        onClick={() => removeTag(tag.name)}
                                                                    >
                                                                        {tag.name} ✕
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                            <div className="flex gap-1 sm:gap-2">
                                                                <Input
                                                                    placeholder="Nouvelle étiquette"
                                                                    value={newTagName}
                                                                    onChange={(e) => setNewTagName(e.target.value)}
                                                                    className="text-[11px] sm:text-sm"
                                                                />
                                                                <Select value={newTagColor} onValueChange={setNewTagColor}>
                                                                    <SelectTrigger className="w-20 sm:w-24 text-[11px] sm:text-sm">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {tagColors.map((color) => (
                                                                            <SelectItem key={color} value={color}>
                                                                                <div className={cn("w-2 h-2 sm:w-3 sm:h-3 rounded-full", color)} />
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
                                                                className="w-full text-[11px] sm:text-sm"
                                                            >
                                                                Ajouter une étiquette
                                                            </Button>
                                                        </div>
                                                        <Button
                                                            onClick={() => addTask(column.id)}
                                                            className="w-full text-[11px] sm:text-sm"
                                                            disabled={!newTaskTitle.trim() || !newTaskAssignee || isOverLimit}
                                                        >
                                                            {isOverLimit ? 'Limite de la colonne atteinte' : 'Ajouter la tâche'}
                                                        </Button>
                                                    </div>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-1 sm:pt-2 px-2 sm:px-3">
                                        <DroppableColumn id={column.id}>
                                            <SortableContext
                                                items={columnTasks.map((task) => task.id)}
                                                strategy={verticalListSortingStrategy}
                                            >
                                                <div className="space-y-2 min-h-[200px] sm:min-h-[300px]">
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
                                                        <div className="flex flex-col items-center h-16 sm:h-24 text-gray-400">
                                                            <div className="text-base sm:text-xl mb-1">📋</div>
                                                            <p className="text-[9px] sm:text-[10px]">Aucune tâche</p>
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