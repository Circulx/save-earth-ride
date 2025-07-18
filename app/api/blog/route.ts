// app/api/blog/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSheetsClient, SPREADSHEET_ID } from '@/lib/googlesheet';

const BLOG_SHEET_NAME = 'blog';

export async function GET() {
  try {
    const sheets = await getSheetsClient();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${BLOG_SHEET_NAME}!A2:Q`, // Extended range for all blog fields
    });

    const rows = response.data.values || [];

    const blogData = rows.map((row, index) => ({
      id: Number(row[0]) || index + 1,
      title: row[1] || '',
      excerpt: row[2] || '',
      content: row[3] || '',
      blogURL: row[4] || '',
      authorName: row[5] || '',
      authorBio: row[6] || '',
      authorAvatar: row[7] || '',
      tags: row[8] ? row[8].split(',').map((tag: string) => tag.trim()) : [],
      image: row[9] || '',
      readTime: row[10] || '',
      featured: row[11] === 'true',
      status: row[12] || 'draft',
      category: row[13] || '',
      date: row[14] || new Date().toISOString().split('T')[0],
      createdAt: row[15] || new Date().toISOString(),
      updatedAt: row[16] || new Date().toISOString(),
    }));

    return NextResponse.json({ success: true, data: blogData });
  } catch (error) {
    console.error('Error fetching blog data:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch blog data' }, { status: 500 });
  }
}

export const dynamic = 'auto';
export async function POST(request: NextRequest) {
  try {
    const { blogs } = await request.json();
    
    if (!blogs || !Array.isArray(blogs)) {
      return NextResponse.json({ success: false, error: 'Invalid blog data' }, { status: 400 });
    }

    const sheets = await getSheetsClient();

    // Read existing data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${BLOG_SHEET_NAME}!A2:Q`,
    });

    const existingRows = response.data.values || [];
    
    // Create a map of existing blog IDs to their row indices
    const idToRowIndex = new Map<string, number>();
    existingRows.forEach((row, index) => {
      const id = row[0];
      if (id) {
        idToRowIndex.set(id, index + 2); // +2 because A2 is row 2
      }
    });

    // Prepare updates and appends
    const updates: { rowIndex: number; values: any[] }[] = [];
    const appends: any[][] = [];

    blogs.forEach((blog) => {
      const values = [
        blog.id || '',
        blog.title || '',
        blog.excerpt || '',
        blog.content || '',
        blog.blogURL || '',
        blog.authorName || '',
        blog.authorBio || '',
        blog.authorAvatar || '',
        Array.isArray(blog.tags) ? blog.tags.join(', ') : blog.tags || '',
        blog.image || '',
        blog.readTime || '',
        blog.featured ? 'true' : 'false',
        blog.status || 'draft',
        blog.category || '',
        blog.date || new Date().toISOString().split('T')[0],
        blog.createdAt || new Date().toISOString(),
        new Date().toISOString(), // updatedAt
      ];

      const rowIndex = idToRowIndex.get(blog.id?.toString());
      if (rowIndex) {
        updates.push({ rowIndex, values });
      } else {
        appends.push(values);
      }
    });

    // Update existing rows
    for (const update of updates) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${BLOG_SHEET_NAME}!A${update.rowIndex}:Q${update.rowIndex}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [update.values],
        },
      });
    }

    // Append new rows
    if (appends.length > 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${BLOG_SHEET_NAME}!A2:Q`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: appends,
        },
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Blog data saved successfully',
      updated: updates.length,
      added: appends.length
    });

  } catch (error) {
    console.error('Error saving blog data:', error);
    return NextResponse.json({ success: false, error: 'Failed to save blog data' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const blogId = searchParams.get('id');

    if (!blogId) {
      return NextResponse.json({ success: false, error: 'Blog ID is required' }, { status: 400 });
    }

    const sheets = await getSheetsClient();

    // Read existing data to find the row to delete
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${BLOG_SHEET_NAME}!A2:Q`,
    });

    const existingRows = response.data.values || [];
    
    // Find the row index for the blog to delete
    let rowToDelete = -1;
    existingRows.forEach((row, index) => {
      if (row[0] === blogId) {
        rowToDelete = index + 2; // +2 because A2 is row 2
      }
    });

    if (rowToDelete === -1) {
      return NextResponse.json({ success: false, error: 'Blog not found' }, { status: 404 });
    }

    // Delete the row
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: 0, // Assuming the first sheet
                dimension: 'ROWS',
                startIndex: rowToDelete - 1,
                endIndex: rowToDelete,
              },
            },
          },
        ],
      },
    });

    return NextResponse.json({ success: true, message: 'Blog deleted successfully' });

  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete blog' }, { status: 500 });
  }
}