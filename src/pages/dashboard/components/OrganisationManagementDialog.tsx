import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '@/services/apiClient';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface OrganisationManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const OrganisationManagementDialog: React.FC<OrganisationManagementDialogProps> = ({ isOpen, onClose }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [inviteCode, setInviteCode] = useState('');

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('/organisation/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to fetch users.');
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const handleGenerateCode = async () => {
    try {
      const response = await apiClient.post('/organisation/generate-code');
      setInviteCode(response.data.code);
      toast.success('Invite code generated successfully.');
    } catch (error) {
      console.error('Failed to generate invite code:', error);
      toast.error('Failed to generate invite code.');
    }
  };

  const handleRemoveUser = async (userId: number) => {
    try {
      await apiClient.delete(`/organisation/users/${userId}`);
      await fetchUsers(); // Refetch users to update the list
      toast.success('User removed successfully.');
    } catch (error) {
      console.error('Failed to remove user:', error);
      toast.error('Failed to remove user.');
    }
  };

  const handleCopyCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      toast.success('Invite code copied to clipboard.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Organisation Management
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div>
            <h3 className="text-lg font-medium">Organisation Members</h3>
            <div className="space-y-3 mt-3 max-h-60 overflow-y-auto pr-2">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-2 rounded-md border">
                  <div>
                    <p className="font-semibold">{`${user.first_name} ${user.last_name}`}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <Button variant="outline" size="icon" onClick={() => handleRemoveUser(user.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-lg font-medium">Generate Invite Code</h3>
            <div className="flex items-center space-x-2 mt-3">
              <Input id="invite-code" value={inviteCode} readOnly placeholder="Click generate to get a new code" />
              <Button size="icon" variant="outline" onClick={handleCopyCode} disabled={!inviteCode}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={handleGenerateCode} className="mt-3 w-full">Generate New Code</Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrganisationManagementDialog;
