import { NextRequest, NextResponse } from 'next/server';
import { 
  getTimelineData, 
  saveTimelineData, 
  addTimelineItem, 
  updateTimelineItem, 
  deleteTimelineItem,
  initializeTimelineSheet,
  TimelineItem 
} from '@/lib/timelineSheetHelpers';

// GET - Fetch all timeline data
export async function GET() {
  try {
    // Initialize sheet if needed
    await initializeTimelineSheet();
    
    const timelineData = await getTimelineData();
    
    return NextResponse.json({ 
      success: true, 
      data: timelineData 
    });
  } catch (error) {
    console.error('Error in GET /api/timeline:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch timeline data' 
      },
      { status: 500 }
    );
  }
}
export const dynamic = "dynamic";
// POST - Add new timeline item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.location || !body.date) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: title, location, date' 
        },
        { status: 400 }
      );
    }

    const newItem = await addTimelineItem({
      date: body.date,
      title: body.title,
      location: body.location,
      type: body.type || 'Tree Planting',
      participants: parseInt(body.participants) || 0,
      treesPlanted: parseInt(body.treesPlanted) || 0,
      description: body.description || '',
      image: body.image || '',
      side: body.side || 'left',
      contactEmail: body.contactEmail || ''
    });

    return NextResponse.json({ 
      success: true, 
      data: newItem 
    });
  } catch (error) {
    console.error('Error in POST /api/timeline:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to add timeline item' 
      },
      { status: 500 }
    );
  }
}

// PUT - Update existing timeline item
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required field: id' 
        },
        { status: 400 }
      );
    }

    const updatedItem = await updateTimelineItem(body.id, {
      date: body.date,
      title: body.title,
      location: body.location,
      type: body.type,
      participants: parseInt(body.participants) || 0,
      treesPlanted: parseInt(body.treesPlanted) || 0,
      description: body.description,
      image: body.image,
      side: body.side,
      contactEmail: body.contactEmail
    });

    return NextResponse.json({ 
      success: true, 
      data: updatedItem 
    });
  } catch (error) {
    console.error('Error in PUT /api/timeline:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update timeline item' 
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete timeline item
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required parameter: id' 
        },
        { status: 400 }
      );
    }

    await deleteTimelineItem(parseInt(id));

    return NextResponse.json({ 
      success: true, 
      message: 'Timeline item deleted successfully' 
    });
  } catch (error) {
    console.error('Error in DELETE /api/timeline:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete timeline item' 
      },
      { status: 500 }
    );
  }
}

// PATCH - Bulk update timeline data
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!Array.isArray(body.data)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid data format. Expected array of timeline items' 
        },
        { status: 400 }
      );
    }

    await saveTimelineData(body.data);

    return NextResponse.json({ 
      success: true, 
      message: 'Timeline data updated successfully' 
    });
  } catch (error) {
    console.error('Error in PATCH /api/timeline:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update timeline data' 
      },
      { status: 500 }
    );
  }
}