import ChatroomList from './ChatroomList';
import ChatArea from './ChatArea';

export default function ChatLayout() {
  return (
    <div className="flex h-full w-full">
      <div className="w-[320px] flex-shrink-0 border-r">
        <ChatroomList />
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatArea />
      </div>
    </div>
  );
}
