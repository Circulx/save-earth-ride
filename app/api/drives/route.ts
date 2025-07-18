// app/api/drives/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { 
  initializeDriveSheet, 
  getAllDrives, 
  addDrive, 
  updateDrive, 
  deleteDrive, 
  getDriveById,
  getDrivesByStatus,
  DriveData 
} from '@/lib/driveSheetHelpers';

/**
 * GET - Retrieve drives
 * Query parameters:
 * - id: Get specific drive by ID
 * - status: Filter by status
 */
export async function GET(request: NextRequest) {
  try {
    // Initialize sheet if needed
    await initializeDriveSheet();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const status = searchParams.get('status');
    
    if (id) {
      const drive = await getDriveById(id);
      if (!drive) {
        return NextResponse.json(
          { error: 'Drive not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(drive);
    }
    
    if (status) {
      const drives = await getDrivesByStatus(status);
      return NextResponse.json(drives);
    }
    
    const drives = await getAllDrives();
    return NextResponse.json(drives);
    
  } catch (error) {
    console.error('Error in GET /api/drives:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drives' },
      { status: 500 }
    );
  }
}

export const dynamic = 'dynamic';
/**
 * POST - Create a new drive
 */
export async function POST(request: NextRequest) {
  try {
    // Initialize sheet if needed
    await initializeDriveSheet();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.location || !body.date || !body.organizer || !body.contactEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: title, location, date, organizer, contactEmail' },
        { status: 400 }
      );
    }
    
    const driveData: DriveData = {
      title: body.title,
      location: body.location,
      date: body.date,
      participants: body.participants || 0,
      treesTarget: body.treesTarget || 0,
      status: body.status || 'upcoming',
      registrationOpen: body.registrationOpen ?? true,
      description: body.description || '',
      organizer: body.organizer,
      contactEmail: body.contactEmail,
      registrationDeadline: body.registrationDeadline || '',
      meetingPoint: body.meetingPoint || '',
      duration: body.duration || '',
      difficulty: body.difficulty || 'Easy',
      logo: body.logo || ''
    };
    
    const newDrive = await addDrive(driveData);
    
    return NextResponse.json(newDrive, { status: 201 });
    
  } catch (error) {
    console.error('Error in POST /api/drives:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create drive' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update an existing drive
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'Drive ID is required' },
        { status: 400 }
      );
    }
    
    const { id, ...updateData } = body;
    
    const updatedDrive = await updateDrive(id, updateData);
    
    return NextResponse.json(updatedDrive);
    
  } catch (error) {
    console.error('Error in PUT /api/drives:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update drive' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete a drive
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Drive ID is required' },
        { status: 400 }
      );
    }
    
    const success = await deleteDrive(id);
    
    if (success) {
      return NextResponse.json({ message: 'Drive deleted successfully' });
    } else {
      return NextResponse.json(
        { error: 'Failed to delete drive' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error in DELETE /api/drives:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete drive' },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Bulk operations
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, data } = body;
    
    switch (operation) {
      case 'bulk_update_status':
        // Update multiple drives' status
        const { ids, status } = data;
        const updatePromises = ids.map((id: string) => 
          updateDrive(id, { status })
        );
        await Promise.all(updatePromises);
        return NextResponse.json({ message: 'Bulk status update completed' });
        
      case 'initialize_sheet':
        await initializeDriveSheet();
        return NextResponse.json({ message: 'Sheet initialized successfully' });
        
      default:
        return NextResponse.json(
          { error: 'Invalid operation' },
          { status: 400 }
        );
    }
    
  } catch (error) {
    console.error('Error in PATCH /api/drives:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to perform operation' },
      { status: 500 }
    );
  }
}