import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type PackagesResponse = {
  thirtyMinutes: any[];
  sixtyMinutes: any[];
};

export async function GET() {
  try {
    // Fetch all packages from the database
    const packages = await prisma.package.findMany();

    // Separate packages into 30-minute and 60-minute arrays
    const thirtyMinutes = packages.filter((pkg) =>
      pkg.details.includes('30 Mins')
    );
    const sixtyMinutes = packages.filter((pkg) =>
      pkg.details.includes('60 Mins')
    );

    const response: PackagesResponse = {
      thirtyMinutes,
      sixtyMinutes,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to retrieve packages:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve packages' },
      { status: 500 }
    );
  }
}
