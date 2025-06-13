import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Home, Plus, Users } from 'lucide-react';

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
import { Separator } from '@/components/ui/separator';

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
  selectedProject: Project | null;
}

const ProjectList: React.FC<ProjectListProps> = ({ onSelectProject, selectedProject: activeProject }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

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
      } catch (error) {
        console.error('Failed to fetch projects:', error);
        toast.error('Failed to fetch projects.');
      }
    };
    if (user) {
      fetchProjects();
    }
  }, [user]);

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
    if (!activeProject) return;

    try {
      const response = await projectService.updateProject(activeProject.id, {
        name: updateProject.name,
        description: updateProject.description || undefined,
      });
      setProjects(
          projects.map((p) =>
              p.id === activeProject.id ? { ...p, ...response.data } : p
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
    onSelectProject(project);
    setUpdateProject({ name: project.name, description: project.description || '' });
    setIsUpdateDialogOpen(true);
  };

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col items-center gap-4 py-3 px-2 bg-muted/20 border-r">
                <nav className="flex flex-col items-center gap-2 flex-grow">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative flex items-center">
                <div
                  className={`absolute left-0 w-1 bg-primary rounded-r-full transition-all duration-200 ${!activeProject ? 'h-8' : 'h-0'}`}
                />
                <Button
                  variant={!activeProject ? 'secondary' : 'ghost'}
                  size="icon"
                  className={`h-12 w-12 rounded-2xl transition-all duration-200 ${!activeProject ? 'rounded-xl' : 'rounded-full'}`}
                  onClick={() => onSelectProject(null)}
                >
                  <Home className="h-6 w-6" />
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Home</p>
            </TooltipContent>
          </Tooltip>
          <Separator className="my-2" />
          {projects.map((project) => (
            <ContextMenu key={project.id}>
              <Tooltip>
                <ContextMenuTrigger>
                  <TooltipTrigger asChild>
                    <div className="relative flex items-center">
                      <div
                        className={`absolute left-0 w-1 bg-primary rounded-r-full transition-all duration-200 ${activeProject?.id === project.id ? 'h-8' : 'h-0'}`}
                      />
                      <Button
                        variant={activeProject?.id === project.id ? 'secondary' : 'ghost'}
                        size="icon"
                        className={`h-12 w-12 rounded-2xl transition-all duration-200 ${activeProject?.id === project.id ? 'rounded-xl' : 'rounded-full'}`}
                        onClick={() => onSelectProject(project)}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="text-lg">
                            {project.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </div>
                  </TooltipTrigger>
                </ContextMenuTrigger>
                <TooltipContent side="right">
                  <p>{project.name}</p>
                </TooltipContent>
              </Tooltip>
              {isAdmin && (
                <ContextMenuContent>
                  <ContextMenuItem onClick={() => openUpdateDialog(project)}>
                    Update
                  </ContextMenuItem>
                </ContextMenuContent>
              )}
            </ContextMenu>
          ))}
        </nav>

        <div className="flex flex-col items-center gap-4">
          {isAdmin && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full bg-background"
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  <Plus className="h-6 w-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Add Project</p>
              </TooltipContent>
            </Tooltip>
          )}

          {isAdmin && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full bg-background"
                  onClick={() => setIsOrgManagementOpen(true)}
                >
                  <Users className="h-6 w-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Manage Organisation</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Dialogs for adding/updating projects and managing organisation */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Project</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} placeholder="Project name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} placeholder="Project description (optional)" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddProject}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Update Project</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="update-name">Name</Label>
                <Input id="update-name" value={updateProject.name} onChange={(e) => setUpdateProject({ ...updateProject, name: e.target.value })} placeholder="Project name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="update-description">Description</Label>
                <Input id="update-description" value={updateProject.description} onChange={(e) => setUpdateProject({ ...updateProject, description: e.target.value })} placeholder="Project description (optional)" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdateProject}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {isAdmin && <OrganisationManagementDialog isOpen={isOrgManagementOpen} onClose={() => setIsOrgManagementOpen(false)} />}
      </div>
    </TooltipProvider>
  );
};

export default ProjectList;