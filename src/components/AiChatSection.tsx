import { useState, useRef, useEffect } from "react";
import { Send, MessageCircle, User, Bot } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  message: string;
  timestamp: Date;
}


interface Conversation {
  id: string;
  createdAt: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  message: string;
  timestamp: Date;
}

interface AiChatSectionProps {
  conversations: Conversation[];
  selectedMessages?: any[];
  onMessageSent?: () => void;
}

const AiChatSection = ({ conversations, selectedMessages = [], onMessageSent }: AiChatSectionProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>(selectedMessages);
  const [currentQuery, setCurrentQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const quickActions = [
    "Review my portfolio",
    "Give me investment advice"
  ];

  // Removed fetching logic, now handled in parent

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // When selectedMessages changes, update messages
  useEffect(() => {
    if (selectedMessages && selectedMessages.length > 0) {
      setMessages(
        selectedMessages.map((msg: any) => ({
          id: msg.id,
          type: msg.role === 'ai' ? 'ai' : 'user',
          message: msg.content,
          timestamp: new Date(msg.createdAt)
        }))
      );
    } else if (selectedMessages && selectedMessages.length === 0) {
      setMessages([]);
    }
  }, [selectedMessages]);

  const handleQuickAction = (action: string) => {
    setActiveAction(prev => prev === action ? null : action);
    setCurrentQuery("");
  };

  const handleSendMessage = async () => {
    if (!currentQuery.trim()) return;

    // Special handling for portfolio review: prompt must be portfolio name
    if (activeAction === "Review my portfolio" && currentQuery.trim().length < 2) {
      alert("Please enter the exact name of your portfolio.");
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: currentQuery,
      timestamp: new Date()
    };

  setMessages(prev => [...prev, userMessage]);
  setCurrentQuery("");
  setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      let url = 'http://localhost:3004/api/v1/ai-service/';
      let body: any = { prompt: currentQuery };
      if (conversationId) {
        body.conversationId = conversationId;
      }

      // If "Give me investment advice" is active, use investment API
      if (activeAction === "Give me investment advice") {
        url = 'http://localhost:3004/api/v1/ai-service/investment';
      }
      // If "Review my portfolio" is active, use portfolio analyze API
      if (activeAction === "Review my portfolio") {
        url = 'http://localhost:3004/api/v1/ai-service/portfolio/analyze';
        body = { portfolioName: currentQuery };
        if (conversationId) {
          body.conversationId = conversationId;
        }
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      const aiOutput = data?.data?.aiOutput || 'No response.';
      const newConvId = data?.data?.conversationId;
      if (newConvId) setConversationId(newConvId);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        message: aiOutput,
        timestamp: new Date()
      };

  setMessages(prev => [...prev, aiMessage]);
  // Notify parent to refresh chat history
  if (onMessageSent) onMessageSent();
    } catch (error) {
      console.error('Error sending message to AI:', error);
      // TODO: Handle error state
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="shadow-soft">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Chat History Section - removed from main area, now only in sidebar */}

          {/* Chat Messages */}
          <div className="h-96 border rounded-lg bg-background/50">
            <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <MessageCircle className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium text-foreground">Start a conversation with AI</h3>
                    <p className="text-sm text-muted-foreground">Ask anything about your portfolio, goals, or investments</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.type === 'ai' && (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      
                      <div
                        className={`max-w-[75%] p-3 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <p className={`text-xs mt-1 ${
                          message.type === 'user' 
                            ? 'text-primary-foreground/70' 
                            : 'text-muted-foreground'
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>

                      {message.type === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <div className="max-w-[75%] p-3 rounded-lg bg-muted">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <Button
                key={action}
                variant={activeAction === action ? "default" : "outline"}
                size="sm"
                onClick={() => handleQuickAction(action)}
                className={`text-xs ${activeAction === action ? 'ring-2 ring-primary' : ''}`}
              >
                {action}
              </Button>
            ))}
            {activeAction === "Review my portfolio" && (
              <span className="text-xs text-primary ml-2">Enter your portfolio name below</span>
            )}
          </div>

          {/* Input Section */}
          <div className="flex gap-2">
            <Input
              placeholder="Ask AI about your portfolio or goals..."
              value={currentQuery}
              onChange={(e) => setCurrentQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !currentQuery.trim()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AiChatSection;