import { db } from '@/lib/db';

export type FreeSessionStatus =
  | 'PENDING'
  | 'SCHEDULED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export interface CreateFreeSessionBookingData {
  studentId: string;
  sessionDate: Date;
  duration?: number;
  subject?: string;
  studentNotes?: string;
  timezone?: string;
}

export interface UpdateFreeSessionBookingData {
  teacherId?: string;
  sessionDate?: Date;
  status?: FreeSessionStatus;
  teacherNotes?: string;
  meetingLink?: string;
  completedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
}

export interface FreeSessionBooking {
  id: string;
  studentId: string;
  teacherId?: string | null;
  sessionDate: Date;
  duration: number;
  status: FreeSessionStatus;
  subject?: string | null;
  studentNotes?: string | null;
  teacherNotes?: string | null;
  meetingLink?: string | null;
  timezone?: string | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date | null;
  cancelledAt?: Date | null;
  cancellationReason?: string | null;
  student?: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
  };
  teacher?: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
}

export const getFreeSessionBookingById = async (
  id: string
): Promise<FreeSessionBooking | null> => {
  try {
    const booking = await db.$queryRaw<FreeSessionBooking[]>`
      SELECT 
        fsb.*,
        json_build_object(
          'id', s.id,
          'name', s.name,
          'email', s.email,
          'phone', s.phone
        ) as student,
        CASE 
          WHEN t.id IS NOT NULL THEN json_build_object(
            'id', t.id,
            'name', t.name,
            'email', t.email,
            'phone', t.phone
          )
          ELSE NULL
        END as teacher
      FROM free_session_bookings fsb
      LEFT JOIN "User" s ON fsb."studentId" = s.id
      LEFT JOIN "User" t ON fsb."teacherId" = t.id
      WHERE fsb.id = ${id}
    `;

    return booking[0] || null;
  } catch (error) {
    console.error('Error fetching free session booking:', error);
    return null;
  }
};

export const getFreeSessionBookingsByStudentId = async (
  studentId: string
): Promise<FreeSessionBooking[]> => {
  try {
    const bookings = await db.$queryRaw<FreeSessionBooking[]>`
      SELECT 
        fsb.*,
        CASE 
          WHEN t.id IS NOT NULL THEN json_build_object(
            'id', t.id,
            'name', t.name,
            'email', t.email,
            'phone', t.phone
          )
          ELSE NULL
        END as teacher
      FROM free_session_bookings fsb
      LEFT JOIN "User" t ON fsb."teacherId" = t.id
      WHERE fsb."studentId" = ${studentId}
      ORDER BY fsb."createdAt" DESC
    `;

    return bookings;
  } catch (error) {
    console.error('Error fetching student bookings:', error);
    return [];
  }
};

export const createFreeSessionBooking = async (
  data: CreateFreeSessionBookingData
): Promise<FreeSessionBooking | null> => {
  try {
    // Check if student already has a free session booking
    const existingBookings = await db.$queryRaw<{ count: number }[]>`
      SELECT COUNT(*) as count 
      FROM free_session_bookings 
      WHERE "studentId" = ${data.studentId}
    `;

    if (existingBookings[0]?.count > 0) {
      throw new Error('Student already has a free session booking');
    }

    // Create the booking
    const bookingId = crypto.randomUUID();
    await db.$executeRaw`
      INSERT INTO free_session_bookings (
        id, "studentId", "sessionDate", duration, status, subject, "studentNotes", timezone, "createdAt", "updatedAt"
      ) VALUES (
        ${bookingId}, ${data.studentId}, ${data.sessionDate}, ${data.duration || 30}, 'PENDING', 
        ${data.subject}, ${data.studentNotes}, ${data.timezone}, NOW(), NOW()
      )
    `;

    // Update user's hasBookedDemo status
    await db.user.update({
      where: { id: data.studentId },
      data: { hasBookedDemo: true },
    });

    // Fetch the created booking
    const newBooking = await db.$queryRaw<FreeSessionBooking[]>`
      SELECT * FROM free_session_bookings 
      WHERE id = ${bookingId}
    `;

    return newBooking[0] || null;
  } catch (error) {
    console.error('Error creating free session booking:', error);
    throw error;
  }
};

export const updateFreeSessionBooking = async (
  id: string,
  data: UpdateFreeSessionBookingData
): Promise<FreeSessionBooking | null> => {
  try {
    // Build the SET clause dynamically to avoid type conflicts
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    if (data.teacherId !== undefined) {
      setClauses.push(`"teacherId" = $${paramIndex++}`);
      values.push(data.teacherId);
    }
    
    if (data.sessionDate !== undefined) {
      setClauses.push(`"sessionDate" = $${paramIndex++}`);
      values.push(data.sessionDate);
    }
    
    if (data.status !== undefined) {
      setClauses.push(`status = $${paramIndex++}::"FreeSessionStatus"`);
      values.push(data.status);
    }
    
    if (data.teacherNotes !== undefined) {
      setClauses.push(`"teacherNotes" = $${paramIndex++}`);
      values.push(data.teacherNotes);
    }
    
    if (data.meetingLink !== undefined) {
      setClauses.push(`"meetingLink" = $${paramIndex++}`);
      values.push(data.meetingLink);
    }
    
    if (data.completedAt !== undefined) {
      setClauses.push(`"completedAt" = $${paramIndex++}`);
      values.push(data.completedAt);
    }
    
    if (data.cancelledAt !== undefined) {
      setClauses.push(`"cancelledAt" = $${paramIndex++}`);
      values.push(data.cancelledAt);
    }
    
    if (data.cancellationReason !== undefined) {
      setClauses.push(`"cancellationReason" = $${paramIndex++}`);
      values.push(data.cancellationReason);
    }

    // Always update the updatedAt timestamp
    setClauses.push(`"updatedAt" = NOW()`);

    if (values.length === 0) {
      // Nothing to update
      return null;
    }

    const query = `
      UPDATE free_session_bookings 
      SET ${setClauses.join(', ')}
      WHERE id = $${paramIndex}
    `;
    
    values.push(id);
    
    // Debug logging
    console.log('📝 SQL Query:', query);
    console.log('📝 Parameters:', values);
    console.log('📝 Parameter count:', values.length);
    
    await db.$executeRawUnsafe(query, ...values);

    // Fetch the updated booking
    const updatedBooking = await db.$queryRaw<FreeSessionBooking[]>`
      SELECT * FROM free_session_bookings WHERE id = ${id}
    `;

    return updatedBooking[0] || null;
  } catch (error) {
    console.error('Error updating free session booking:', error);
    return null;
  }
};

export const checkStudentHasFreeSession = async (
  studentId: string
): Promise<boolean> => {
  try {
    const result = await db.$queryRaw<{ count: number }[]>`
      SELECT COUNT(*) as count 
      FROM free_session_bookings 
      WHERE "studentId" = ${studentId}
    `;

    return (result[0]?.count || 0) > 0;
  } catch (error) {
    console.error('Error checking student free session status:', error);
    return false;
  }
};

export interface GetAllFreeSessionBookingsOptions {
  status?: FreeSessionStatus;
  page?: number;
  limit?: number;
}

export const getAllFreeSessionBookings = async (
  options: GetAllFreeSessionBookingsOptions = {}
): Promise<{ bookings: FreeSessionBooking[]; total: number }> => {
  try {
    const { status, page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    let whereClause = '';
    if (status) {
      whereClause = `WHERE fsb.status = '${status}'`;
    }

    // Get total count
    const totalQuery = `
      SELECT COUNT(*) as count 
      FROM free_session_bookings fsb
      ${whereClause}
    `;
    const totalResult = await db.$queryRawUnsafe<{ count: number }[]>(totalQuery);
    const total = Number(totalResult[0]?.count || 0);

    // Get bookings with pagination
    const bookingsQuery = `
      SELECT 
        fsb.*,
        json_build_object(
          'id', s.id,
          'name', s.name,
          'email', s.email,
          'phone', s.phone
        ) as student,
        CASE 
          WHEN t.id IS NOT NULL THEN json_build_object(
            'id', t.id,
            'name', t.name,
            'email', t.email,
            'phone', t.phone
          )
          ELSE NULL
        END as teacher
      FROM free_session_bookings fsb
      LEFT JOIN "User" s ON fsb."studentId" = s.id
      LEFT JOIN "User" t ON fsb."teacherId" = t.id
      ${whereClause}
      ORDER BY fsb."createdAt" DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const bookings = await db.$queryRawUnsafe<FreeSessionBooking[]>(bookingsQuery);

    return { bookings, total };
  } catch (error) {
    console.error('Error fetching all free session bookings:', error);
    return { bookings: [], total: 0 };
  }
};
