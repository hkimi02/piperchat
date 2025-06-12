import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Plus, Home } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const ProjectList: React.FC = () => {
  return (
    <div className="w-20 bg-muted/50 p-3 flex flex-col items-center gap-4 border-r">
      <h2 className="font-bold text-lg sr-only">Projets</h2>
            <div className="flex flex-col items-center gap-3">
        <Button variant="ghost" size="icon">
          <Home className="h-5 w-5" />
        </Button>
        <Separator className="my-1" />
        <Avatar className="cursor-pointer">
          <AvatarFallback>P1</AvatarFallback>
        </Avatar>
        <Avatar className="cursor-pointer">
          <AvatarFallback>P2</AvatarFallback>
        </Avatar>
        <Button variant="outline" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ProjectList;
