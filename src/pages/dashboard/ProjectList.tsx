import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Plus, Home, Users } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import toast from 'react-hot-toast';
import projectService from '@/services/Projects/projectService';
import { useSelector } from 'react-redux';
import OrganisationManagementDialog from './components/OrganisationManagementDialog';

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

interface RootState {
  auth: { user: { id: number; role: 'ADMIN' | 'USER'; organisation_id: number } | null };
}

interface ProjectListProps {
  onSelectProject: (project: Project | null) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ onSelectProject }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [updateProject, setUpdateProject] = useState({ name: '', description: '' });
  const [isOrgManagementOpen, setIsOrgManagementOpen] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const isAdmin = user?.role === 'ADMIN';

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await projectService.getProjects();
        setProjects(response.data);
        if (response.data.length > 0) {
          onSelectProject(response.data[0]);
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
        toast.error('Failed to fetch projects.');
      }
    };
    if (user) {
      fetchProjects();
    }
  }, [onSelectProject, user]);

  // Handle adding a new project
  const handleAddProject = async () => {
    if (!user?.organisation_id) {
      toast.error('Organisation ID is missing.');
      return;
    }

    try {
      const response = await projectService.createProject({
        name: newProject.name,
        description: newProject.description || undefined,
        organisation_id: user.organisation_id,
      });
      setProjects([...projects, response.data]);
      setNewProject({ name: '', description: '' });
      setIsAddDialogOpen(false);
      toast.success('Project created successfully.');
      onSelectProject(response.data);
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error('Failed to create project.');
    }
  };

  // Handle updating a project
  const handleUpdateProject = async () => {
    if (!selectedProject) return;

    try {
      const response = await projectService.updateProject(selectedProject.id, {
        name: updateProject.name,
        description: updateProject.description || undefined,
      });
      setProjects(
          projects.map((p) =>
              p.id === selectedProject.id ? { ...p, ...response.data } : p
          )
      );
      setIsUpdateDialogOpen(false);
      toast.success('Project updated successfully.');
      onSelectProject(response.data);
    } catch (error) {
      console.error('Failed to update project:', error);
      toast.error('Failed to update project.');
    }
  };

  // Open update dialog with selected project data
  const openUpdateDialog = (project: Project) => {
    setSelectedProject(project);
    setUpdateProject({ name: project.name, description: project.description || '' });
    setIsUpdateDialogOpen(true);
  };

  return (
    <TooltipProvider>
      <div className="relative h-full flex flex-col p-4 bg-gray-50 border-r">
        <div className="flex flex-col items-center gap-3">
          <Button variant="ghost" size="icon">
            <Home className="h-5 w-5" />
          </Button>
          <Separator className="my-1" />
          {projects.map((project) => (
            <Tooltip key={project.id}>
              <ContextMenu>
                <ContextMenuTrigger>
                  <TooltipTrigger asChild>
                    <Avatar
                      className="cursor-pointer"
                      onClick={() => onSelectProject(project)}
                    >
                      <AvatarFallback>{project.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                </ContextMenuTrigger>
                {isAdmin && (
                  <ContextMenuContent>
                    <ContextMenuItem onClick={() => openUpdateDialog(project)}>
                      Update Project
                    </ContextMenuItem>
                  </ContextMenuContent>
                )}
              </ContextMenu>
              <TooltipContent side="right" className="max-w-xs">
                <h3 className="font-semibold">{project.name}</h3>
                {project.tasks?.length > 0 ? (
                  <ul className="mt-2 space-y-1">
                    {project.tasks.map((task) => (
                      <li
                        key={task.id}
                        className={`text-sm ${
                          task.is_assigned ? 'text-green-600 font-medium' : ''
                        }`}
                      >
                        {task.title} ({task.status})
                        {task.is_assigned && ' (Assigned to you)'}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No tasks</p>
                )}
              </TooltipContent>
            </Tooltip>
          ))}
          {isAdmin && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsAddDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Add Project</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsOrgManagementOpen(true)}
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Manage Organisation</p>
                </TooltipContent>
              </Tooltip>
            </>
          )}
        </div>

        {/* Add Project Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Project</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newProject.name}
                  onChange={(e) =>
                    setNewProject({ ...newProject, name: e.target.value })
                  }
                  placeholder="Project name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({ ...newProject, description: e.target.value })
                  }
                  placeholder="Project description (optional)"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddProject}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Update Project Dialog */}
        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Project</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="update-name">Name</Label>
                <Input
                  id="update-name"
                  value={updateProject.name}
                  onChange={(e) =>
                    setUpdateProject({ ...updateProject, name: e.target.value })
                  }
                  placeholder="Project name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="update-description">Description</Label>
                <Input
                  id="update-description"
                  value={updateProject.description}
                  onChange={(e) =>
                    setUpdateProject({
                      ...updateProject,
                      description: e.target.value,
                    })
                  }
                  placeholder="Project description (optional)"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsUpdateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateProject}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {isAdmin && (
          <OrganisationManagementDialog
            isOpen={isOrgManagementOpen}
            onClose={() => setIsOrgManagementOpen(false)}
          />
        )}
      </div>
    </TooltipProvider>
  );
};

export default ProjectList;