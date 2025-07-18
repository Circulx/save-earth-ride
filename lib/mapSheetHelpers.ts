import { getSheetsClient, SPREADSHEET_ID } from './googlesheet';

const MAP_SHEET_NAME = 'map';

interface MapItem {
  id: number;
  name: string;
  location: string;
  coordinates: { lat: number; lng: number };
  date: string;
  type: string;
  participants: number;
  treesPlanted: number;
  description: string;
  image: string;
  organizer: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function getMapData(): Promise<MapItem[]> {
  try {
    const sheets = await getSheetsClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${MAP_SHEET_NAME}!A2:P`, // Assuming headers are in row 1
    });

    const rows = response.data.values || [];
    
    return rows.map((row: any[], index: number) => ({
      id: parseInt(row[0]) || index + 1,
      name: row[1] || '',
      location: row[2] || '',
      coordinates: {
        lat: parseFloat(row[3]) || 0,
        lng: parseFloat(row[4]) || 0
      },
      date: row[5] || '',
      type: row[6] || '',
      participants: parseInt(row[7]) || 0,
      treesPlanted: parseInt(row[8]) || 0,
      description: row[9] || '',
      image: row[10] || '',
      organizer: row[11] || '',
      status: row[12] || 'upcoming',
      createdAt: row[13] || '',
      updatedAt: row[14] || ''
    }));
  } catch (error) {
    console.error('Error fetching map data:', error);
    
    // Create sheet if it doesn't exist

    const errorMsg = typeof error==='string' ? error : (error instanceof Error ? error.message : String(error));
    if (errorMsg.toString().includes('Unable to parse range')) {
      await createMapSheet();
      return [];
    }
    
    throw error;
  }
}

export async function appendToMapSheet(item: Omit<MapItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MapItem> {
  try {
    const sheets = await getSheetsClient();
    const timestamp = new Date().toISOString();
    const id = Date.now();
    
    const values = [
      [
        id,
        item.name,
        item.location,
        item.coordinates.lat,
        item.coordinates.lng,
        item.date,
        item.type,
        item.participants,
        item.treesPlanted,
        item.description,
        item.image,
        item.organizer,
        item.status,
        timestamp,
        timestamp
      ]
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${MAP_SHEET_NAME}!A:O`,
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
    console.error('Error appending to map sheet:', error);
    throw error;
  }
}

export async function updateMapSheet(item: MapItem): Promise<MapItem> {
  try {
    const sheets = await getSheetsClient();
    const timestamp = new Date().toISOString();
    
    // Find the row with the matching ID
    const allData = await getMapData();
    const rowIndex = allData.findIndex(row => row.id === item.id);
    
    if (rowIndex === -1) {
      throw new Error('Item not found');
    }

    const values = [
      [
        item.id,
        item.name,
        item.location,
        item.coordinates.lat,
        item.coordinates.lng,
        item.date,
        item.type,
        item.participants,
        item.treesPlanted,
        item.description,
        item.image,
        item.organizer,
        item.status,
        item.createdAt || timestamp,
        timestamp
      ]
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${MAP_SHEET_NAME}!A${rowIndex + 2}:O${rowIndex + 2}`,
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
    console.error('Error updating map sheet:', error);
    throw error;
  }
}

export async function deleteFromMapSheet(id: number): Promise<void> {
  try {
    const sheets = await getSheetsClient();
    
    // Find the row with the matching ID
    const allData = await getMapData();
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
                sheetId: await getSheetId(MAP_SHEET_NAME),
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
    console.error('Error deleting from map sheet:', error);
    throw error;
  }
}

async function createMapSheet(): Promise<void> {
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
                title: MAP_SHEET_NAME,
              },
            },
          },
        ],
      },
    });

    // Add headers
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${MAP_SHEET_NAME}!A1:O1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [
          [
            'ID',
            'Name',
            'Location',
            'Latitude',
            'Longitude',
            'Date',
            'Type',
            'Participants',
            'Trees Planted',
            'Description',
            'Image',
            'Organizer',
            'Status',
            'Created At',
            'Updated At'
          ]
        ],
      },
    });
  } catch (error) {
    console.error('Error creating map sheet:', error);
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