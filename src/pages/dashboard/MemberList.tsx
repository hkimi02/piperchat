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
import { MessageSquare, Phone, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store/store';
import { findOrCreatePrivateChatroom, selectChatroom, startCall } from '@/slices/chatSlice';
import { useNavigate } from 'react-router-dom';


interface User {
  id: number;
  full_name: string;
  email: string;
  profile_picture: string | null;
  organisation_id?: number;
}

interface UserProfileProps {
  user: User;
  children: React.ReactNode;
  isOnline: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, children, isOnline }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleMessage = async () => {
    try {
      const chatroom = await dispatch(findOrCreatePrivateChatroom(user.id)).unwrap();
      dispatch(selectChatroom(chatroom));
      navigate('/dashboard'); // Navigate to the dashboard, chat state will handle the rest
    } catch (error) {
      console.error('Failed to start private chat:', error);
    }
  };

  const handleCall = async () => {
    try {
      const chatroom = await dispatch(findOrCreatePrivateChatroom(user.id)).unwrap();
      dispatch(selectChatroom(chatroom));
      dispatch(startCall());
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to initiate call:', error);
    }
  };

  return (
      <Popover>
        <PopoverTrigger asChild>{children}</PopoverTrigger>
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
              <Button variant="outline" onClick={handleMessage}>
                <MessageSquare className="mr-2 h-4 w-4" /> Message
              </Button>
              <Button onClick={handleCall}>
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
  const [isInviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const userRole = useSelector((state: RootState) => state.auth.user?.role);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [usersResponse, meResponse] = await Promise.all([
          apiClient.get<any>('/organisation/users'),
          apiClient.get<any>('/auth/me'),
        ]);
        const usersData = usersResponse.data?.data || usersResponse.data;
        setUsers(Array.isArray(usersData) ? usersData : []);
        setCurrentUser(meResponse.data.data);
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
        setUsers([]);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!currentUser?.organisation_id) return;

    const channelName = `organisation.${currentUser.organisation_id}`;
    echo
        .join(channelName)
        .here((users: any[]) => {
          const online = users.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
          }, {});
          setOnlineUsers(online);
        })
        .joining((user: any) => {
          setOnlineUsers((prev) => ({ ...prev, [user.id]: user }));
        })
        .leaving((user: any) => {
          setOnlineUsers((prev) => {
            const newOnline = { ...prev };
            delete newOnline[user.id];
            return newOnline;
          });
        })
        .error((error: any) => {
          console.error('Echo: Channel subscription error:', error);
        });

    return () => {
      echo.leave(channelName);
    };
  }, [currentUser]);

  const handleInvite = async () => {
    try {
      await apiClient.post('/organisation/invite', { email: inviteEmail });
      setInviteEmail('');
      setInviteOpen(false);
    } catch (error) {
      console.error('Failed to send invitation:', error);
    }
  };

  return (
      <div className="h-full flex flex-col bg-muted/40 p-3 gap-4">
        <div>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-primary">
                Membres ({users.length})
              </h2>
              <p className="text-xs text-muted-foreground">{Object.keys(onlineUsers).length} en ligne</p>
            </div>
            {userRole === 'ADMIN' && (
                <Dialog open={isInviteOpen} onOpenChange={setInviteOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Inviter un membre</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            type="email"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleInvite}>Envoyer l'invitation</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
            )}
          </div>
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
                    <span className={`font-medium ${isOnline ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {user.full_name}
                </span>
                  </div>
                </UserProfile>
            );
          })}
        </div>
      </div>
  );
};

export default MemberList;