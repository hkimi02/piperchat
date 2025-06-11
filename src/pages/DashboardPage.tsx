import React from 'react';
import ProjectList from '@/pages/dashboard/ProjectList';
import MemberList from '@/pages/dashboard/MemberList';
import ChatLayout from '@/pages/Chat/components/ChatLayout';

const DashboardPage: React.FC = () => {
  return (
    <div className="h-[calc(100vh-3.5rem)] flex">
      <ProjectList />
      <div className="flex-1 flex">
        <ChatLayout />
      </div>
      <MemberList />
    </div>
  );
};

export default DashboardPage;
