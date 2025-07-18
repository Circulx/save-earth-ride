import { getSheetsClient, SPREADSHEET_ID } from './googlesheet';

const GALLERY_SHEET_NAME = 'gallery';

interface GalleryItem {
  id: number;
  image: string;
  title: string;
  location: string;
  city: string;
  year: string;
  tags: string[];
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function getGalleryData(): Promise<GalleryItem[]> {
  try {
    const sheets = await getSheetsClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${GALLERY_SHEET_NAME}!A2:J`, // Assuming headers are in row 1
    });

    const rows = response.data.values || [];
    
    return rows.map((row: any[], index: number) => ({
      id: parseInt(row[0]) || index + 1,
      image: row[1] || '',
      title: row[2] || '',
      location: row[3] || '',
      city: row[4] || '',
      year: row[5] || '',
      tags: row[6] ? row[6].split(',').map((tag: string) => tag.trim()) : [],
      description: row[7] || '',
      createdAt: row[8] || '',
      updatedAt: row[9] || ''
    }));
  } catch (error) {
    console.error('Error fetching gallery data:', error);
    
    // Create sheet if it doesn't exist
    const errorMsg = typeof error==='string' ? error : (error instanceof Error ? error.message : String(error));
    if (errorMsg.toString().includes('Unable to parse range')) {
      await createGallerySheet();
      return [];
    }
    
    throw error;
  }
}

export async function appendToGallerySheet(item: Omit<GalleryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<GalleryItem> {
  try {
    const sheets = await getSheetsClient();
    const timestamp = new Date().toISOString();
    const id = Date.now();
    
    const tagsString = Array.isArray(item.tags) ? item.tags.join(', ') : item.tags;
    
    const values = [
      [
        id,
        item.image,
        item.title,
        item.location,
        item.city,
        item.year,
        tagsString,
        item.description,
        timestamp,
        timestamp
      ]
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${GALLERY_SHEET_NAME}!A:J`,
      valueInputOption: 'RAW',
      requestBody: {
        values,
      },
    });

    return {
      id,
      ...item,
      createdAt: timestamp,
      updatedAt: timestamp
    };
  } catch (error) {
    console.error('Error appending to gallery sheet:', error);
    throw error;
  }
}

export async function updateGallerySheet(item: GalleryItem): Promise<GalleryItem> {
  try {
    const sheets = await getSheetsClient();
    const timestamp = new Date().toISOString();
    
    // Find the row with the matching ID
    const allData = await getGalleryData();
    const rowIndex = allData.findIndex(row => row.id === item.id);
    
    if (rowIndex === -1) {
      throw new Error('Item not found');
    }

    const tagsString = Array.isArray(item.tags) ? item.tags.join(', ') : item.tags;
    
    const values = [
      [
        item.id,
        item.image,
        item.title,
        item.location,
        item.city,
        item.year,
        tagsString,
        item.description,
        item.createdAt || timestamp,
        timestamp
      ]
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${GALLERY_SHEET_NAME}!A${rowIndex + 2}:J${rowIndex + 2}`,
      valueInputOption: 'RAW',
      requestBody: {
        values,
      },
    });

    return {
      ...item,
      updatedAt: timestamp
    };
  } catch (error) {
    console.error('Error updating gallery sheet:', error);
    throw error;
  }
}

export async function deleteFromGallerySheet(id: number): Promise<void> {
  try {
    const sheets = await getSheetsClient();
    
    // Find the row with the matching ID
    const allData = await getGalleryData();
    const rowIndex = allData.findIndex(row => row.id === id);
    
    if (rowIndex === -1) {
      throw new Error('Item not found');
    }

    // Delete the row
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: await getSheetId(GALLERY_SHEET_NAME),
                dimension: 'ROWS',
                startIndex: rowIndex + 1, // +1 because of header row
                endIndex: rowIndex + 2,
              },
            },
          },
        ],
      },
    });
  } catch (error) {
    console.error('Error deleting from gallery sheet:', error);
    throw error;
  }
}

async function createGallerySheet(): Promise<void> {
  try {
    const sheets = await getSheetsClient();
    
    // Create the sheet
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: GALLERY_SHEET_NAME,
              },
            },
          },
        ],
      },
    });

    // Add headers
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${GALLERY_SHEET_NAME}!A1:J1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [
          [
            'ID',
            'Image',
            'Title',
            'Location',
            'City',
            'Year',
            'Tags',
            'Description',
            'Created At',
            'Updated At'
          ]
        ],
      },
    });
  } catch (error) {
    console.error('Error creating gallery sheet:', error);
    throw error;
  }
}

async function getSheetId(sheetName: string): Promise<number> {
  const sheets = await getSheetsClient();
  
  const response = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });

  const sheet = response.data.sheets?.find(s => s.properties?.title === sheetName);
  return sheet?.properties?.sheetId || 0;
}