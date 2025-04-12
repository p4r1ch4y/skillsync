import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Send } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  type: string;
}

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  isRead: boolean;
  sentAt: string;
}

interface Conversation {
  user: User;
  latestMessage: Message;
  unreadCount: number;
}

const Messages = () => {
  const [_, navigate] = useLocation();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: currentUser, isLoading: loadingUser, error: userError } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  const { data: conversations, isLoading: loadingConversations } = useQuery<Conversation[]>({
    queryKey: ["/api/messages"],
    enabled: !!currentUser,
  });

  const { data: selectedConversation, isLoading: loadingSelectedConversation } = useQuery<{
    messages: Message[];
    user: User;
  }>({
    queryKey: [`/api/messages/${selectedUserId}`],
    enabled: !!selectedUserId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser || !selectedUserId) return;
      return apiRequest("POST", "/api/messages", {
        senderId: currentUser.id,
        receiverId: selectedUserId,
        content: newMessage,
      });
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${selectedUserId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    // If error is 401 (unauthorized), redirect to login
    if (userError) {
      if ((userError as any).status === 401) {
        navigate("/login");
      }
    }
  }, [userError, navigate]);

  useEffect(() => {
    // Auto-select first conversation if none selected and conversations exist
    if (!selectedUserId && conversations && conversations.length > 0) {
      setSelectedUserId(conversations[0].user.id);
    }
  }, [conversations, selectedUserId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedConversation]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessageMutation.mutate();
    }
  };

  const getInitials = (user?: User) => {
    if (!user) return "?";
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const isLoading = loadingUser || loadingConversations;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="h-[calc(100vh-200px)]">
            <div className="flex h-full">
              <div className="w-1/3 border-r border-gray-200">
                <CardHeader className="py-4">
                  <Skeleton className="h-7 w-32" />
                </CardHeader>
                <div className="px-4 py-2 space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
              <div className="w-2/3 flex flex-col">
                <CardHeader className="py-4 border-b border-gray-200">
                  <Skeleton className="h-7 w-32" />
                </CardHeader>
                <div className="flex-1 p-4">
                  <Skeleton className="h-12 w-2/3 mb-4" />
                  <Skeleton className="h-12 w-2/3 mb-4 ml-auto" />
                  <Skeleton className="h-12 w-1/2 mb-4" />
                </div>
                <div className="p-4 border-t border-gray-200">
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="h-[calc(100vh-200px)]">
          <div className="flex h-full">
            {/* Conversations Sidebar */}
            <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
              <CardHeader className="py-4">
                <h2 className="text-lg font-medium">Messages</h2>
              </CardHeader>
              
              {conversations?.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-gray-500">No messages yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Your conversations will appear here
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {conversations?.map((conversation) => (
                    <div
                      key={conversation.user.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer ${
                        selectedUserId === conversation.user.id ? 'bg-gray-50' : ''
                      }`}
                      onClick={() => setSelectedUserId(conversation.user.id)}
                    >
                      <div className="flex items-start">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary-100 text-primary-700">
                            {getInitials(conversation.user)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-3 flex-1 truncate">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {`${conversation.user.firstName} ${conversation.user.lastName}`}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {formatMessageTime(conversation.latestMessage.sentAt)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-sm text-gray-500 truncate">
                              {conversation.latestMessage.senderId === currentUser?.id
                                ? `You: ${conversation.latestMessage.content}`
                                : conversation.latestMessage.content}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <Badge variant="default" className="rounded-full px-2 py-0.5 text-xs">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Messages Panel */}
            <div className="w-2/3 flex flex-col">
              {selectedUserId && selectedConversation ? (
                <>
                  <CardHeader className="py-4 border-b border-gray-200 flex-shrink-0">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary-100 text-primary-700">
                          {getInitials(selectedConversation.user)}
                        </AvatarFallback>
                      </Avatar>
                      <h2 className="text-md font-medium ml-2">
                        {`${selectedConversation.user.firstName} ${selectedConversation.user.lastName}`}
                      </h2>
                    </div>
                  </CardHeader>
                  
                  {/* Messages */}
                  <div className="flex-1 p-4 overflow-y-auto">
                    {loadingSelectedConversation ? (
                      <div className="flex justify-center">
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                    ) : selectedConversation.messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full">
                        <p className="text-gray-500">No messages yet</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Start the conversation by sending a message
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {selectedConversation.messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.senderId === currentUser?.id ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                message.senderId === currentUser?.id
                                  ? 'bg-primary-600 text-white'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              <p>{message.content}</p>
                              <div
                                className={`text-xs mt-1 ${
                                  message.senderId === currentUser?.id
                                    ? 'text-primary-100'
                                    : 'text-gray-500'
                                }`}
                              >
                                {formatMessageTime(message.sentAt)}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>
                  
                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 flex-shrink-0">
                    <form onSubmit={handleSendMessage} className="flex">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 mr-2"
                      />
                      <Button 
                        type="submit" 
                        disabled={!newMessage.trim() || sendMessageMutation.isPending}
                      >
                        <Send size={18} />
                      </Button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-500 max-w-md">
                    Choose a conversation from the sidebar or start a new one by applying to an opportunity.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Messages;
