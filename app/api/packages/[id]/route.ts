import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid package ID' },
        { status: 400 }
      );
    }

    const package_ = await db.package.findUnique({
      where: { id },
    });

    if (!package_) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    return NextResponse.json(package_);
  } catch (error) {
    console.error('Failed to retrieve package:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve package' },
      { status: 500 }
    );
  }
}
