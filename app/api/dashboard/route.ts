import { NextRequest, NextResponse } from 'next/server';
import { getDashboardData, updateTreeCount, addDonation, addRegistration } from '@/lib/helper';

export async function GET() {
  try {
    const dashboardData = await getDashboardData();
    
    return NextResponse.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dashboard data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
export const dynamic = 'dynamic'
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'updateTreeCount':
        const { count } = data;
        const success = await updateTreeCount(count);
        
        if (success) {
          return NextResponse.json({
            success: true,
            message: 'Tree count updated successfully',
          });
        } else {
          return NextResponse.json(
            {
              success: false,
              error: 'Failed to update tree count',
            },
            { status: 500 }
          );
        }

      case 'addDonation':
        const donationSuccess = await addDonation(data);
        
        if (donationSuccess) {
          return NextResponse.json({
            success: true,
            message: 'Donation added successfully',
          });
        } else {
          return NextResponse.json(
            {
              success: false,
              error: 'Failed to add donation',
            },
            { status: 500 }
          );
        }

      case 'addRegistration':
        const registrationSuccess = await addRegistration(data);
        
        if (registrationSuccess) {
          return NextResponse.json({
            success: true,
            message: 'Registration added successfully',
          });
        } else {
          return NextResponse.json(
            {
              success: false,
              error: 'Failed to add registration',
            },
            { status: 500 }
          );
        }

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action',
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Dashboard API POST error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process request',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'updateTreeCount':
        const { count } = data;
        const success = await updateTreeCount(count);
        
        if (success) {
          // Return updated dashboard data
          const dashboardData = await getDashboardData();
          return NextResponse.json({
            success: true,
            message: 'Tree count updated successfully',
            data: dashboardData,
          });
        } else {
          return NextResponse.json(
            {
              success: false,
              error: 'Failed to update tree count',
            },
            { status: 500 }
          );
        }

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action',
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Dashboard API PUT error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process request',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}