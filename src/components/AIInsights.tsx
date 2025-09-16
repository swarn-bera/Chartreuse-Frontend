import { useState, useEffect } from "react";
import { Brain } from "lucide-react";
import AiChatSection from "./AiChatSection";
import AiChatSidebar from "./AiChatSidebar";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

const AIInsights = () => {
  const [currentChatId, setCurrentChatId] = useState<string>();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [chatHistories, setChatHistories] = useState<any[]>([]);
  // Track conversation types by id
  const [conversationTypes, setConversationTypes] = useState<{[id: string]: string}>({});
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [selectedMessages, setSelectedMessages] = useState<any[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConversationId, setDeleteConversationId] = useState<string | null>(null);
  // For new chat naming
  const randomTitles = ["Portfolio Review", "Investment Advice", "Quick Analysis", "Growth Insights", "Fund Check", "Goal Planner"];

  useEffect(() => {
    // Fetch chat history from backend with Authorization header
    const token = localStorage.getItem('token');
  fetch(`${import.meta.env.VITE_API_URL_INSIGHTS}/api/v1/ai-service/`, {
      credentials: 'include',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    })
      .then(res => res.json())
      .then(data => {
        // Frontend-only title logic
        const chats = (data?.data?.conversations || []).map((chat: any) => {
          let lastMsg = chat.lastMessage || '';
          let type = 'normal';
          const msgLower = lastMsg.toLowerCase();
          if (msgLower.includes('portfolio')) type = 'portfolio';
          else if (msgLower.includes('advice') || msgLower.includes('invest')) type = 'advice';
          return { ...chat, type };
        });
        setChatHistories(chats);
        // Build type map for sidebar
        const typeMap: {[id: string]: string} = {};
        chats.forEach(chat => { typeMap[chat.id] = chat.type; });
        setConversationTypes(typeMap);
        setLastUpdated(new Date());
        setLoadingConversations(false);
      })
      .catch(() => setLoadingConversations(false));
  }, []);

  const handleSelectChat = async (chatId: string) => {
    setCurrentChatId(chatId);
    setSelectedMessages([]);
    try {
      const token = localStorage.getItem('token');
  const res = await fetch(`${import.meta.env.VITE_API_URL_INSIGHTS}/api/v1/ai-service/${chatId}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      const data = await res.json();
      const messages = data?.data?.conversation?.messages || [];
      setSelectedMessages(messages);
    } catch (err) {
      setSelectedMessages([]);
    }
  };

  const handleNewChat = async () => {
    setCurrentChatId(undefined);
    setSelectedMessages([]);
    // Optionally, create a new conversation in backend
    // After creation, refresh chat history
    const token = localStorage.getItem('token');
  await fetch(`${import.meta.env.VITE_API_URL_INSIGHTS}/api/v1/ai-service/`, {
      credentials: 'include',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });
    // Refresh chat history
  fetch(`${import.meta.env.VITE_API_URL_INSIGHTS}/api/v1/ai-service/`, {
      credentials: 'include',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    })
      .then(res => res.json())
      .then(data => {
        const chats = (data?.data?.conversations || []).map((chat: any) => {
          let lastMsg = chat.lastMessage || '';
          let title = '';
          const msgLower = lastMsg.toLowerCase();
          if (msgLower.includes('portfolio')) {
            title = randomTitles[Math.floor(Math.random() * randomTitles.length)];
          } else if (msgLower.includes('advice') || msgLower.includes('invest')) {
            title = randomTitles[Math.floor(Math.random() * randomTitles.length)];
          } else if (lastMsg) {
            title = lastMsg.split(' ').slice(0, 4).join(' ') + '...';
          } else {
            title = `Conversation ${chat.id.slice(0, 8)}...`;
          }
          return { ...chat, title };
        });
        setChatHistories(chats);
      });
  };

  const handleDeleteChat = (conversationId: string) => {
    setDeleteConversationId(conversationId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteChat = async () => {
    if (!deleteConversationId) return;
    try {
      const token = localStorage.getItem('token');
  await fetch(`${import.meta.env.VITE_API_URL_INSIGHTS}/api/v1/ai-service/${deleteConversationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      setChatHistories(prev => prev.filter(chat => chat.id !== deleteConversationId));
      if (currentChatId === deleteConversationId) {
        setCurrentChatId(undefined);
        setSelectedMessages([]);
      }
    } catch (err) {}
    setShowDeleteDialog(false);
    setDeleteConversationId(null);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Sidebar */}
      <AiChatSidebar
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        chatHistories={chatHistories || []}
        conversationTypes={conversationTypes}
        onDeleteChat={handleDeleteChat}
      />
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Are you sure you want to delete this conversation?
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteChat}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Main Content (no outer scroll) */}
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">AI Insights</h1>
              <p className="text-muted-foreground">
                Ask AI anything about your portfolio, goals, or investments
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Interactive AI Chat Section */}
        <AiChatSection
          conversations={chatHistories || []}
          selectedMessages={selectedMessages}
          onMessageSent={async () => {
            // Refresh chat history after sending a message
            const token = localStorage.getItem('token');
            fetch(`${import.meta.env.VITE_API_URL_INSIGHTS}/api/v1/ai-service/`, {
              credentials: 'include',
              headers: {
                'Authorization': token ? `Bearer ${token}` : '',
              },
            })
              .then(res => res.json())
              .then(data => {
                const chats = (data?.data?.conversations || []).map((chat: any) => {
                  let lastMsg = chat.lastMessage || '';
                  let title = '';
                  const msgLower = lastMsg.toLowerCase();
                  if (msgLower.includes('portfolio')) {
                    title = randomTitles[Math.floor(Math.random() * randomTitles.length)];
                  } else if (msgLower.includes('advice') || msgLower.includes('invest')) {
                    title = randomTitles[Math.floor(Math.random() * randomTitles.length)];
                  } else if (lastMsg) {
                    title = lastMsg.split(' ').slice(0, 4).join(' ') + '...';
                  } else {
                    title = `Conversation ${chat.id.slice(0, 8)}...`;
                  }
                  return { ...chat, title };
                });
                setChatHistories(chats);
              });
          }}
        />
      </div>
    </div>
  );
};

export default AIInsights;