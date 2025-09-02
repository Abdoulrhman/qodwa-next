'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { DashboardLayout } from '@/shared/components/layout/dashboard-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Loader2,
  MessageCircle,
  Send,
  Pin,
  Star,
  Clock,
  CheckCheck,
  Check,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  isPinned: boolean;
  type: 'text' | 'assignment' | 'reminder' | 'feedback';
}

interface MessageThread {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherAvatar?: string;
  subject: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
  isPinned: boolean;
}

interface MessagesData {
  threads: MessageThread[];
  unreadTotal: number;
}

export default function MessagesPage() {
  const t = useTranslations('Dashboard');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const { user } = useAuth();

  const [messagesData, setMessagesData] = useState<MessagesData | null>(null);
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(
    null
  );
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/student/messages');

        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }

        const data = await response.json();

        if (data.success) {
          setMessagesData(data.messages);
        } else {
          setError(data.error || 'Failed to load messages');
        }
      } catch (err) {
        setError('An error occurred while loading messages');
        console.error('Error fetching messages:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Auto-select first thread when data loads
  useEffect(() => {
    if (messagesData && messagesData.threads.length > 0 && !selectedThread) {
      setSelectedThread(messagesData.threads[0]);
    }
  }, [messagesData, selectedThread]);

  const fetchMessagesData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/student/messages');

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();

      if (data.success) {
        setMessagesData(data.messages);
        // Auto-select first thread if available
        if (data.messages.threads.length > 0 && !selectedThread) {
          setSelectedThread(data.messages.threads[0]);
        }
      } else {
        setError(data.error || 'Failed to load messages');
      }
    } catch (err) {
      setError('An error occurred while loading messages');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!selectedThread || !newMessage.trim()) return;

    try {
      setSendingMessage(true);
      const response = await fetch('/api/student/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: selectedThread.id,
          content: newMessage.trim(),
        }),
      });

      if (response.ok) {
        setNewMessage('');
        fetchMessagesData();
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSendingMessage(false);
    }
  };

  const markAsRead = async (threadId: string) => {
    try {
      await fetch('/api/student/messages/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId }),
      });
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString(isRTL ? 'ar-SA' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (days === 1) {
      return isRTL ? 'أمس' : 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
        weekday: 'short',
      });
    } else {
      return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return '📚';
      case 'reminder':
        return '⏰';
      case 'feedback':
        return '⭐';
      default:
        return '💬';
    }
  };

  const handleThreadSelect = (thread: MessageThread) => {
    setSelectedThread(thread);
    if (thread.unreadCount > 0) {
      markAsRead(thread.id);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className='flex h-full items-center justify-center'>
          <Loader2 className='h-8 w-8 animate-spin' />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !messagesData) {
    return (
      <DashboardLayout>
        <div className='space-y-6' dir={isRTL ? 'rtl' : 'ltr'}>
          <Card className='border-destructive'>
            <CardContent className='pt-6'>
              <p className='text-destructive text-center'>{error}</p>
              <div className='flex justify-center mt-4'>
                <Button onClick={fetchMessagesData} variant='outline'>
                  {isRTL ? 'إعادة المحاولة' : 'Try Again'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className='space-y-6' dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Page Header */}
        <div className={cn('space-y-2', isRTL && 'text-right')}>
          <div
            className={cn(
              'flex items-center justify-between',
              isRTL && 'flex-row-reverse'
            )}
          >
            <h1 className='text-3xl font-bold'>
              {isRTL ? 'الرسائل' : 'Messages'}
            </h1>
            {messagesData.unreadTotal > 0 && (
              <Badge variant='destructive' className='text-sm'>
                {messagesData.unreadTotal} {isRTL ? 'غير مقروءة' : 'unread'}
              </Badge>
            )}
          </div>
          <p className='text-muted-foreground'>
            {isRTL
              ? 'تواصل مع معلميك واستقبل الإشعارات والواجبات'
              : 'Communicate with your teachers and receive notifications'}
          </p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]'>
          {/* Message Threads List */}
          <Card className='lg:col-span-1'>
            <CardHeader>
              <CardTitle
                className={cn(
                  'flex items-center gap-2',
                  isRTL && 'flex-row-reverse'
                )}
              >
                <MessageCircle className='h-5 w-5' />
                {isRTL ? 'المحادثات' : 'Conversations'}
              </CardTitle>
            </CardHeader>
            <CardContent className='p-0'>
              <div className='space-y-1 max-h-[480px] overflow-y-auto'>
                {messagesData.threads.map((thread) => (
                  <div
                    key={thread.id}
                    onClick={() => handleThreadSelect(thread)}
                    className={cn(
                      'flex items-center gap-3 p-3 hover:bg-accent cursor-pointer border-b transition-colors',
                      selectedThread?.id === thread.id && 'bg-accent',
                      isRTL && 'flex-row-reverse'
                    )}
                  >
                    <div className='relative'>
                      <Avatar className='h-10 w-10'>
                        <AvatarImage
                          src={thread.teacherAvatar}
                          alt={thread.teacherName}
                        />
                        <AvatarFallback>
                          {thread.teacherName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      {thread.unreadCount > 0 && (
                        <div className='absolute -top-1 -right-1 h-5 w-5 bg-destructive rounded-full flex items-center justify-center'>
                          <span className='text-xs text-white font-bold'>
                            {thread.unreadCount}
                          </span>
                        </div>
                      )}
                    </div>

                    <div
                      className={cn('flex-1 min-w-0', isRTL && 'text-right')}
                    >
                      <div
                        className={cn(
                          'flex items-center justify-between',
                          isRTL && 'flex-row-reverse'
                        )}
                      >
                        <h4 className='font-medium text-sm truncate'>
                          {thread.teacherName}
                        </h4>
                        <div className='flex items-center gap-1'>
                          {thread.isPinned && (
                            <Pin className='h-3 w-3 text-amber-500' />
                          )}
                          <span className='text-xs text-muted-foreground'>
                            {formatTime(thread.lastMessageTime)}
                          </span>
                        </div>
                      </div>
                      <p className='text-xs text-muted-foreground font-medium mb-1'>
                        {thread.subject}
                      </p>
                      <p className='text-xs text-muted-foreground truncate'>
                        {thread.lastMessage}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Message Thread View */}
          <Card className='lg:col-span-2'>
            {selectedThread ? (
              <>
                <CardHeader>
                  <div
                    className={cn(
                      'flex items-center justify-between',
                      isRTL && 'flex-row-reverse'
                    )}
                  >
                    <div
                      className={cn(
                        'flex items-center gap-3',
                        isRTL && 'flex-row-reverse'
                      )}
                    >
                      <Avatar>
                        <AvatarImage
                          src={selectedThread.teacherAvatar}
                          alt={selectedThread.teacherName}
                        />
                        <AvatarFallback>
                          {selectedThread.teacherName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className={cn(isRTL && 'text-right')}>
                        <h3 className='font-medium'>
                          {selectedThread.teacherName}
                        </h3>
                        <p className='text-sm text-muted-foreground'>
                          {selectedThread.subject}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className='flex flex-col h-[400px]'>
                  {/* Messages */}
                  <div className='flex-1 overflow-y-auto space-y-4 mb-4'>
                    {selectedThread.messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          'flex gap-3',
                          message.senderId === user?.id
                            ? isRTL
                              ? 'justify-start'
                              : 'justify-end'
                            : isRTL
                              ? 'justify-end flex-row-reverse'
                              : 'justify-start'
                        )}
                      >
                        {message.senderId !== user?.id && (
                          <Avatar className='h-8 w-8'>
                            <AvatarImage
                              src={message.senderAvatar}
                              alt={message.senderName}
                            />
                            <AvatarFallback>
                              {message.senderName
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                        )}

                        <div
                          className={cn(
                            'max-w-[70%] space-y-1',
                            message.senderId === user?.id
                              ? isRTL
                                ? 'text-right'
                                : 'text-left'
                              : isRTL
                                ? 'text-left'
                                : 'text-right'
                          )}
                        >
                          <div
                            className={cn(
                              'p-3 rounded-lg',
                              message.senderId === user?.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            )}
                          >
                            <div
                              className={cn(
                                'flex items-center gap-2 mb-1',
                                isRTL && 'flex-row-reverse'
                              )}
                            >
                              <span className='text-lg'>
                                {getMessageTypeIcon(message.type)}
                              </span>
                              {message.type !== 'text' && (
                                <Badge variant='outline' className='text-xs'>
                                  {message.type === 'assignment' &&
                                    (isRTL ? 'واجب' : 'Assignment')}
                                  {message.type === 'reminder' &&
                                    (isRTL ? 'تذكير' : 'Reminder')}
                                  {message.type === 'feedback' &&
                                    (isRTL ? 'ملاحظة' : 'Feedback')}
                                </Badge>
                              )}
                            </div>
                            <p className='text-sm whitespace-pre-wrap'>
                              {message.content}
                            </p>
                          </div>

                          <div
                            className={cn(
                              'flex items-center gap-1 text-xs text-muted-foreground',
                              isRTL && 'flex-row-reverse'
                            )}
                          >
                            <Clock className='h-3 w-3' />
                            <span>{formatTime(message.timestamp)}</span>
                            {message.senderId === user?.id &&
                              (message.isRead ? (
                                <CheckCheck className='h-3 w-3 text-blue-500' />
                              ) : (
                                <Check className='h-3 w-3' />
                              ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div
                    className={cn('flex gap-2', isRTL && 'flex-row-reverse')}
                  >
                    <Input
                      value={newMessage}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewMessage(e.target.value)
                      }
                      placeholder={
                        isRTL
                          ? 'اكتب رسالتك هنا...'
                          : 'Type your message here...'
                      }
                      className='flex-1'
                      dir={isRTL ? 'rtl' : 'ltr'}
                      onKeyPress={(e: React.KeyboardEvent) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || sendingMessage}
                      size='icon'
                      className='h-10 w-10'
                    >
                      {sendingMessage ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                      ) : (
                        <Send
                          className={cn('h-4 w-4', isRTL && 'scale-x-[-1]')}
                        />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className='flex items-center justify-center h-full'>
                <div
                  className={cn(
                    'text-center text-muted-foreground',
                    isRTL && 'text-right'
                  )}
                >
                  <MessageCircle className='h-12 w-12 mx-auto mb-4 opacity-50' />
                  <h3 className='font-medium mb-2'>
                    {isRTL ? 'اختر محادثة' : 'Select a conversation'}
                  </h3>
                  <p className='text-sm'>
                    {isRTL
                      ? 'اختر محادثة من القائمة لبدء المراسلة'
                      : 'Choose a conversation from the list to start messaging'}
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
