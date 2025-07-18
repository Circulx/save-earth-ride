import { NextRequest, NextResponse } from 'next/server';
import { 
  addRegistration, 
  getRegistrations, 
  getRegistrationStats,
  updateRegistration,
  deleteRegistration,
  type RegistrationData 
} from '@/lib/registerSheetHelpers';

export const dynamic='dynamic';
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.email || !body.phone || !body.country || !body.city || !body.licenceNumber) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate registration type
    if (!body.type || !['individual', 'club'].includes(body.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid registration type' },
        { status: 400 }
      );
    }

    // Type-specific validation
    if (body.type === 'individual') {
      if (!body.firstName || !body.lastName || !body.bio || !body.ridingExperience) {
        return NextResponse.json(
          { success: false, error: 'Missing required individual fields' },
          { status: 400 }
        );
      }
    } else if (body.type === 'club') {
      if (!body.clubName || !body.adminName || !body.description) {
        return NextResponse.json(
          { success: false, error: 'Missing required club fields' },
          { status: 400 }
        );
      }
    }

    // Validate terms acceptance
    if (!body.acceptTerms) {
      return NextResponse.json(
        { success: false, error: 'Terms and conditions must be accepted' },
        { status: 400 }
      );
    }

    // Prepare registration data
    const registrationData: RegistrationData = {
      type: body.type,
      firstName: body.firstName,
      lastName: body.lastName,
      clubName: body.clubName,
      adminName: body.adminName,
      email: body.email,
      phone: body.phone,
      country: body.country,
      city: body.city,
      licenceNumber: body.licenceNumber,
      bio: body.bio,
      description: body.description,
      ridingExperience: body.ridingExperience,
      website: body.website,
      instagram: body.instagram,
      facebook: body.facebook,
      twitter: body.twitter,
      acceptTerms: body.acceptTerms,
    };

    // Add registration to Google Sheets
    const registrationId = await addRegistration(registrationData);

    return NextResponse.json({
      success: true,
      registrationId,
      message: 'Registration successful',
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'stats':
        const stats = await getRegistrationStats();
        return NextResponse.json({
          success: true,
          data: stats,
        });

      case 'list':
      default:
        const registrations = await getRegistrations();
        return NextResponse.json({
          success: true,
          data: registrations,
        });
    }

  } catch (error) {
    console.error('Error retrieving registrations:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to retrieve registrations' 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { registrationId, updates } = body;

    if (!registrationId) {
      return NextResponse.json(
        { success: false, error: 'Registration ID is required' },
        { status: 400 }
      );
    }

    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No updates provided' },
        { status: 400 }
      );
    }

    await updateRegistration(registrationId, updates);

    return NextResponse.json({
      success: true,
      message: 'Registration updated successfully',
    });

  } catch (error) {
    console.error('Error updating registration:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update registration' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const registrationId = searchParams.get('registrationId');

    if (!registrationId) {
      return NextResponse.json(
        { success: false, error: 'Registration ID is required' },
        { status: 400 }
      );
    }

    await deleteRegistration(registrationId);

    return NextResponse.json({
      success: true,
      message: 'Registration deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting registration:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete registration' 
      },
      { status: 500 }
    );
  }
}