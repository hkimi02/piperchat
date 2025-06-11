import React, { useEffect, useState } from 'react';
import apiClient from '@/services/apiClient';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageSquare, Phone } from 'lucide-react';

interface User {
  id: number;
  full_name: string;
  email: string;
  profile_picture: string | null;
}

interface UserProfileProps {
  user: User;
  children: React.ReactNode;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, children }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="flex flex-col items-center gap-4 py-4">
            <Avatar className="h-24 w-24">
                <AvatarImage src={user.profile_picture || ''} />
                <AvatarFallback className="text-4xl">{user.full_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="text-center">
                <h3 className="text-xl font-bold">{user.full_name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
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
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await apiClient.get<User[]>('/organisation/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    fetchUsers();
  }, []);
  return (
    <div className="w-60 bg-muted/40 p-3 flex flex-col gap-4">
      <div>
        <h2 className="font-semibold text-sm text-muted-foreground mb-2">Membres - {users.length}</h2>
        <div className="flex flex-col gap-3">
          {users.map(user => (
            <UserProfile key={user.id} user={user}>
              <div className="flex items-center gap-2 cursor-pointer hover:bg-muted p-1 rounded-md">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.profile_picture || ''} />
                  <AvatarFallback>{user.full_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{user.full_name}</span>
              </div>
            </UserProfile>
          ))}
        </div>
      </div>
       
    </div>
  );
};

export default MemberList;
