import { NextRequest, NextResponse } from 'next/server';
import { appendToMapSheet, updateMapSheet, deleteFromMapSheet, getMapData } from '@/lib/mapSheetHelpers';

export async function GET() {
  try {
    const data = await getMapData();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching map data:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch map data' }, { status: 500 });
  }
}
export const dynamic = "dynamic";
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'add':
        const newItem = await appendToMapSheet(data);
        return NextResponse.json({ success: true, data: newItem });

      case 'update':
        const updatedItem = await updateMapSheet(data);
        return NextResponse.json({ success: true, data: updatedItem });

      case 'delete':
        await deleteFromMapSheet(data.id);
        return NextResponse.json({ success: true, message: 'Item deleted successfully' });

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing map request:', error);
    return NextResponse.json({ success: false, error: 'Failed to process request' }, { status: 500 });
  }
}