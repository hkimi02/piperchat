import React, { useEffect, useState } from 'react';
import apiClient from '@/services/apiClient';
import echo from '@/services/echo';
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
  organisation_id?: number;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: string;
  statusCode?: number;
}

interface UserProfileProps {
  user: User;
  children: React.ReactNode;
  isOnline: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, children, isOnline }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.profile_picture || ''} />
              <AvatarFallback className="text-4xl">{user.full_name.charAt(0)}</AvatarFallback>
            </Avatar>
            {isOnline && (
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-background rounded-full" />
            )}
          </div>
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Record<number, any>>({});

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [usersResponse, meResponse] = await Promise.all([
          apiClient.get<any>('/organisation/users'),
          apiClient.get<ApiResponse<User>>('/auth/me')
        ]);

        // Robustly handle users data, which might be wrapped or not
        const usersData = usersResponse.data?.data || usersResponse.data;
        setUsers(Array.isArray(usersData) ? usersData : []);

        // Handle meResponse, which we know is wrapped
        setCurrentUser(meResponse.data.data);

      } catch (error) {
        console.error('Failed to fetch initial data:', error);
        setUsers([]); // Ensure users is an array on error to prevent crashes
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!currentUser?.organisation_id) {
      console.log('Echo: Waiting for current user data...');
      return;
    }

    const channelName = `organisation.${currentUser.organisation_id}`;
    console.log(`Echo: Attempting to join channel: ${channelName}`);

    echo.join(channelName)
      .here((users: any[]) => {
        console.log('Echo: Successfully joined channel. Online users:', users);
        const online = users.reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {});
        setOnlineUsers(online);
      })
      .joining((user: any) => {
        console.log('Echo: User joining:', user);
        setOnlineUsers(prev => ({ ...prev, [user.id]: user }));
      })
      .leaving((user: any) => {
        console.log('Echo: User leaving:', user);
        setOnlineUsers(prev => {
          const newOnline = { ...prev };
          delete newOnline[user.id];
          return newOnline;
        });
      })
      .error((error: any) => {
        console.error('Echo: Channel subscription error:', error);
      });

    return () => {
      const channelName = `organisation.${currentUser.organisation_id}`;
      console.log(`Echo: Leaving channel: ${channelName}`);
      echo.leave(channelName);
    };
  }, [currentUser]);

  return (
    <div className="w-60 bg-muted/40 p-3 flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-primary">Membres ({users.length})</h2>
        <p className="text-xs text-muted-foreground">{Object.keys(onlineUsers).length} en ligne</p>
      </div>
      <div className="flex flex-col gap-2">
        {users.map((user) => {
          const isOnline = !!onlineUsers[user.id];
          return (
            <UserProfile key={user.id} user={user} isOnline={isOnline}>
              <div className="flex items-center gap-3 cursor-pointer hover:bg-muted p-2 rounded-md">
                <div className="relative">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.profile_picture || ''} />
                    <AvatarFallback>{user.full_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                  )}
                </div>
                <span className={`font-medium ${isOnline ? 'text-foreground' : 'text-muted-foreground'}`}>{user.full_name}</span>
              </div>
            </UserProfile>
          );
        })}
      </div>
    </div>
  );
};

export default MemberList;
