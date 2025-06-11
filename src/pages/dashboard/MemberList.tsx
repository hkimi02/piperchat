import React from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageSquare, Phone } from 'lucide-react';

interface UserProfileProps {
  name: string;
  email: string;
  avatarSrc?: string;
  avatarFallback: string;
  children: React.ReactNode;
}

const UserProfile: React.FC<UserProfileProps> = ({ name, email, avatarSrc, avatarFallback, children }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="flex flex-col items-center gap-4 py-4">
            <Avatar className="h-24 w-24">
                <AvatarImage src={avatarSrc} />
                <AvatarFallback className="text-4xl">{avatarFallback}</AvatarFallback>
            </Avatar>
            <div className="text-center">
                <h3 className="text-xl font-bold">{name}</h3>
                <p className="text-sm text-muted-foreground">{email}</p>
            </div>
            <div className="flex gap-4 mt-4">
                <Button variant="outline">
                    <MessageSquare className="mr-2 h-4 w-4" /> Message
                </Button>
                <Button>
                    <Phone className="mr-2 h-4 w-4" /> Appeler
                </Button>
            </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const MemberList: React.FC = () => {
  return (
    <div className="w-60 bg-muted/40 p-3 flex flex-col gap-4">
      <div>
        <h2 className="font-semibold text-sm text-muted-foreground mb-2">En ligne - 2</h2>
        <div className="flex flex-col gap-3">
                    <UserProfile name="elyes" email="elyes@example.com" avatarSrc="https://github.com/shadcn.png" avatarFallback="E">
            <div className="flex items-center gap-2 cursor-pointer hover:bg-muted p-1 rounded-md">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>E</AvatarFallback>
              </Avatar>
              <span className="font-medium">elyes</span>
            </div>
          </UserProfile>
          <UserProfile name="cascade" email="cascade@example.com" avatarSrc="https://github.com/random.png" avatarFallback="C">
            <div className="flex items-center gap-2 cursor-pointer hover:bg-muted p-1 rounded-md">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://github.com/random.png" />
                <AvatarFallback>C</AvatarFallback>
              </Avatar>
              <span className="font-medium">cascade</span>
            </div>
          </UserProfile>
        </div>
      </div>
       <div>
        <h2 className="font-semibold text-sm text-muted-foreground mb-2">Hors ligne - 1</h2>
        <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 opacity-50">
            <Avatar className="h-8 w-8">
              <AvatarFallback>U3</AvatarFallback>
            </Avatar>
            <span className="font-medium">Utilisateur 3</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberList;
