import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Package, PackagesResponse } from '@/APISchema';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Fetch all packages from the database
    const packages = await prisma.package.findMany();

    // Separate packages into 30-minute and 60-minute arrays based on class_duration
    const thirtyMinutes = packages.filter((pkg: Package) =>
      pkg.package_type.includes('30 Minutes')
    );
    const sixtyMinutes = packages.filter((pkg: Package) =>
      pkg.package_type.includes('60 Minutes')
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
