import { NextRequest, NextResponse } from 'next/server';
import { getSponsorData, saveSponsorData, addSponsorData, updateSponsorData, deleteSponsorData } from '@/lib/sponsorSheetHelpers';

export async function GET() {
  try {
    const sponsors = await getSponsorData();
    return NextResponse.json({ success: true, data: sponsors });
  } catch (error) {
    console.error('Error fetching sponsors:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sponsors' },
      { status: 500 }
    );
  }
}
export const dynamic = "dynamic";
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'add':
        const newSponsor = await addSponsorData(data);
        return NextResponse.json({ success: true, data: newSponsor });

      case 'update':
        const updatedSponsor = await updateSponsorData(data.id, data);
        return NextResponse.json({ success: true, data: updatedSponsor });

      case 'delete':
        await deleteSponsorData(data.id);
        return NextResponse.json({ success: true, message: 'Sponsor deleted successfully' });

      case 'bulk_save':
        await saveSponsorData(data);
        return NextResponse.json({ success: true, message: 'Sponsors saved successfully' });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing sponsor request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}