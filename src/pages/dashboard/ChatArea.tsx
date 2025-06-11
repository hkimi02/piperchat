import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const ChatArea: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col bg-card">
      <div className="p-4 border-b">
        <h2 className="font-bold text-lg"># général</h2>
      </div>
      <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-4">
        {/* Placeholder for chat messages */}
        <div className="flex items-start gap-3">
          <Avatar>
            <AvatarImage src="https://github.com/utilisateur1.png" />
            <AvatarFallback>U1</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold">Utilisateur 1</p>
            <p className="text-muted-foreground">Bonjour le monde!</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Avatar>
            <AvatarImage src="https://github.com/utilisateur2.png" />
            <AvatarFallback>U2</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold">Utilisateur 2</p>
            <p className="text-muted-foreground">Salut!</p>
          </div>
        </div>
      </div>
      <div className="p-4 border-t mt-auto">
        <div className="relative">
          <Input type="text" placeholder="Écrire un message dans #général..." className="pr-12" />
          <Button type="submit" size="icon" className="absolute top-1/2 right-2 -translate-y-1/2 h-7 w-7">
            <Send className="h-4 w-4" />
            <span className="sr-only">Envoyer</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
