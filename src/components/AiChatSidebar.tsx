import { useState } from "react";
import { Plus, MessageSquare, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";



type ChatHistory = {
  id: string;
  title?: string;
  lastMessage?: string;
  timestamp?: Date;
  messageCount?: number;
};

type AiChatSidebarProps = {
  currentChatId?: string;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  chatHistories: ChatHistory[];
  conversationTypes?: { [id: string]: string };
  onDeleteChat: (chatId: string) => void;
};


const AiChatSidebar = ({ currentChatId, onSelectChat, onNewChat, chatHistories, conversationTypes, onDeleteChat }: AiChatSidebarProps) => {
  // Helper to categorize chat title based on type
  function getChatCategory(type?: string) {
    if (type === 'portfolio') return 'Portfolio Review';
    if (type === 'advice') return 'Financial Advice';
    return 'Normal Question';
  }
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleNewChat = () => {
    // TODO: Create new chat session
    // - Generate new chat ID
    // - Clear current messages
    // - Add to chat history
    onNewChat();
  };

  const handleSelectChat = (chatId: string) => {
    // TODO: Load chat messages from backend
    // - Fetch messages for the selected chat
    // - Update current chat state
    onSelectChat(chatId);
  };


  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteChat(chatId);
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  return (
    <Card className={cn(
      "h-full shadow-soft transition-all duration-300 flex flex-col",
      isCollapsed ? "w-16" : "w-80"
    )}>
      <CardContent className="p-4 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          {!isCollapsed && (
            <h2 className="font-semibold text-lg">Chat History</h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex-shrink-0"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* New Chat Button */}
        <Button
          onClick={handleNewChat}
          className={cn(
            "mb-4 flex items-center gap-2",
            isCollapsed ? "w-8 h-8 p-0" : "w-full"
          )}
          variant="default"
        >
          <Plus className="h-4 w-4" />
          {!isCollapsed && "New Chat"}
        </Button>


        {/* Chat History List */}
        <ScrollArea className="flex-1">
          <div className="space-y-2">
            {chatHistories.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm mt-8">No conversations found.</div>
            ) : (
              chatHistories.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleSelectChat(chat.id)}
                  className={cn(
                    "p-3 rounded-lg cursor-pointer transition-colors group hover:bg-muted/50",
                    currentChatId === chat.id ? "bg-muted" : "",
                    isCollapsed ? "p-2" : ""
                  )}
                >
                  {isCollapsed ? (
                    <div className="flex justify-center">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm truncate flex-1">
                          {getChatCategory(conversationTypes?.[chat.id])}
                        </h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDeleteChat(chat.id, e)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      {chat.lastMessage && (
                        <p className="text-xs text-muted-foreground truncate">
                          {chat.lastMessage}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{chat.timestamp ? formatTimestamp(chat.timestamp) : ''}</span>
                        {chat.messageCount !== undefined && <span>{chat.messageCount} messages</span>}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AiChatSidebar;