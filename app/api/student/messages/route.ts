import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

// Sample messages data
const sampleMessagesData = {
  threads: [
    {
      id: 'thread-1',
      teacherId: 'teacher-1',
      teacherName: 'Ahmed Al-Mansouri',
      teacherAvatar: null,
      subject: 'Quran Memorization',
      lastMessage:
        'Great progress on Surah Al-Baqarah! Keep practicing verses 51-60.',
      lastMessageTime: '2024-02-15T14:30:00Z',
      unreadCount: 2,
      isPinned: true,
      messages: [
        {
          id: 'msg-1',
          senderId: 'teacher-1',
          senderName: 'Ahmed Al-Mansouri',
          senderAvatar: null,
          content: 'السلام عليكم، مرحبا بك في دروس تحفيظ القرآن الكريم',
          timestamp: '2024-02-10T10:00:00Z',
          isRead: true,
          isPinned: false,
          type: 'text' as const,
        },
        {
          id: 'msg-2',
          senderId: 'student-1',
          senderName: 'Current User',
          senderAvatar: null,
          content: 'وعليكم السلام، شكراً لك استاذ احمد',
          timestamp: '2024-02-10T10:05:00Z',
          isRead: true,
          isPinned: false,
          type: 'text' as const,
        },
        {
          id: 'msg-3',
          senderId: 'teacher-1',
          senderName: 'Ahmed Al-Mansouri',
          senderAvatar: null,
          content:
            "Please practice Surah Al-Baqarah verses 1-20 for tomorrow's class. Focus on proper Tajweed rules.",
          timestamp: '2024-02-12T16:20:00Z',
          isRead: true,
          isPinned: false,
          type: 'assignment' as const,
        },
        {
          id: 'msg-4',
          senderId: 'teacher-1',
          senderName: 'Ahmed Al-Mansouri',
          senderAvatar: null,
          content:
            'Reminder: We have class tomorrow at 7:00 PM. Please be prepared with your memorization.',
          timestamp: '2024-02-14T19:00:00Z',
          isRead: true,
          isPinned: false,
          type: 'reminder' as const,
        },
        {
          id: 'msg-5',
          senderId: 'teacher-1',
          senderName: 'Ahmed Al-Mansouri',
          senderAvatar: null,
          content:
            'Great progress on Surah Al-Baqarah! Keep practicing verses 51-60.',
          timestamp: '2024-02-15T14:30:00Z',
          isRead: false,
          isPinned: false,
          type: 'feedback' as const,
        },
      ],
    },
    {
      id: 'thread-2',
      teacherId: 'teacher-2',
      teacherName: 'Fatima Al-Zahra',
      teacherAvatar: null,
      subject: 'Tajweed Rules',
      lastMessage: "Don't forget about tomorrow's Tajweed assessment.",
      lastMessageTime: '2024-02-14T18:45:00Z',
      unreadCount: 1,
      isPinned: false,
      messages: [
        {
          id: 'msg-6',
          senderId: 'teacher-2',
          senderName: 'Fatima Al-Zahra',
          senderAvatar: null,
          content: 'مرحبا، سنبدأ بدراسة أحكام التجويد الأساسية',
          timestamp: '2024-02-12T11:00:00Z',
          isRead: true,
          isPinned: false,
          type: 'text' as const,
        },
        {
          id: 'msg-7',
          senderId: 'teacher-2',
          senderName: 'Fatima Al-Zahra',
          senderAvatar: null,
          content:
            'Please review the Madd rules we covered in class. There will be an assessment next week.',
          timestamp: '2024-02-13T15:30:00Z',
          isRead: true,
          isPinned: false,
          type: 'assignment' as const,
        },
        {
          id: 'msg-8',
          senderId: 'teacher-2',
          senderName: 'Fatima Al-Zahra',
          senderAvatar: null,
          content: "Don't forget about tomorrow's Tajweed assessment.",
          timestamp: '2024-02-14T18:45:00Z',
          isRead: false,
          isPinned: false,
          type: 'reminder' as const,
        },
      ],
    },
    {
      id: 'thread-3',
      teacherId: 'teacher-3',
      teacherName: 'Omar Al-Baghdadi',
      teacherAvatar: null,
      subject: 'Islamic Studies',
      lastMessage: 'Your essay on the names of Allah was excellent.',
      lastMessageTime: '2024-02-13T13:20:00Z',
      unreadCount: 0,
      isPinned: false,
      messages: [
        {
          id: 'msg-9',
          senderId: 'teacher-3',
          senderName: 'Omar Al-Baghdadi',
          senderAvatar: null,
          content:
            'Welcome to Islamic Studies class. We will cover the beautiful names of Allah.',
          timestamp: '2024-02-11T14:00:00Z',
          isRead: true,
          isPinned: false,
          type: 'text' as const,
        },
        {
          id: 'msg-10',
          senderId: 'teacher-3',
          senderName: 'Omar Al-Baghdadi',
          senderAvatar: null,
          content:
            'Your essay on the names of Allah was excellent. Well researched and thoughtful.',
          timestamp: '2024-02-13T13:20:00Z',
          isRead: true,
          isPinned: false,
          type: 'feedback' as const,
        },
      ],
    },
  ],
  unreadTotal: 3,
};

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // In a real application, you would:
    // 1. Fetch message threads from database for this student
    // 2. Include unread message counts
    // 3. Order by last message timestamp
    // 4. Include teacher information from teachers table

    return NextResponse.json({
      success: true,
      messages: sampleMessagesData,
    });
  } catch (error) {
    console.error('Error fetching student messages:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
