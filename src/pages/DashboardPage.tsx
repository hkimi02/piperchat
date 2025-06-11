import React from 'react';
import ProjectList from '@/pages/dashboard/ProjectList';
import ChatroomList from '@/pages/dashboard/ChatroomList';
import ChatArea from '@/pages/dashboard/ChatArea';
import MemberList from '@/pages/dashboard/MemberList';

const DashboardPage: React.FC = () => {
  return (
    <div className="h-[calc(100vh-3.5rem)] flex">
      <ProjectList />
      <ChatroomList />
      <ChatArea />
      <MemberList />
    </div>
  );
};

export default DashboardPage;
