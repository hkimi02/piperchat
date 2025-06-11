import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Hash } from 'lucide-react';

const ChatroomList: React.FC = () => {
  return (
    <div className="w-60 bg-muted/60 p-3 flex flex-col gap-4 border-r">
      <div className="border-b pb-2 mb-2">
        <h1 className="font-bold text-lg">Accueil</h1>
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-sm text-muted-foreground">Salons textuels</h2>
            <Button variant="ghost" size="icon" className="h-6 w-6">
                <Plus className="h-4 w-4" />
            </Button>
        </div>
        <nav className="flex flex-col gap-1">
          <Button variant="secondary" className="justify-start gap-2">
            <Hash className="h-4 w-4" />
            général
          </Button>
          <Button variant="ghost" className="justify-start gap-2">
            <Hash className="h-4 w-4" />
            planification
          </Button>
        </nav>
      </div>
    </div>
  );
};

export default ChatroomList;
