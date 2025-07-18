import { getSheetsClient, SPREADSHEET_ID } from './googlesheet';

export interface TimelineItem {
  id: number;
  date: string;
  title: string;
  location: string;
  type: string;
  participants: number;
  treesPlanted: number;
  description: string;
  image: string;
  side: 'left' | 'right';
  contactEmail?: string;
}

const TIMELINE_SHEET_NAME = 'timeline';

/**
 * Get all timeline data from Google Sheets
 */
export async function getTimelineData(): Promise<TimelineItem[]> {
  try {
    const sheets = await getSheetsClient();
    
    // Get all data from the timeline sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${TIMELINE_SHEET_NAME}!A:K`, // Adjust range as needed
    });

    const rows = response.data.values;
    
    if (!rows || rows.length <= 1) {
      return [];
    }

    // Skip header row and convert to objects
    const timelineData = rows.slice(1).map((row, index) => ({
      id: parseInt(row[0]) || index + 1,
      date: row[1] || '',
      title: row[2] || '',
      location: row[3] || '',
      type: row[4] || '',
      participants: parseInt(row[5]) || 0,
      treesPlanted: parseInt(row[6]) || 0,
      description: row[7] || '',
      image: row[8] || '',
      side: (row[9] === 'right' ? 'right' : 'left') as 'left' | 'right',
      contactEmail: row[10] || '',
    }));

    return timelineData;
  } catch (error) {
    console.error('Error fetching timeline data:', error);
    throw new Error('Failed to fetch timeline data from Google Sheets');
  }
}

/**
 * Save timeline data to Google Sheets
 */
export async function saveTimelineData(timelineData: TimelineItem[]): Promise<void> {
  try {
    const sheets = await getSheetsClient();
    
    // Prepare data for sheets (convert objects to arrays)
    const headers = [
      'ID', 'Date', 'Title', 'Location', 'Type', 
      'Participants', 'Trees Planted', 'Description', 
      'Image', 'Side', 'Contact Email'
    ];
    
    const values = [
      headers,
      ...timelineData.map(item => [
        item.id.toString(),
        item.date,
        item.title,
        item.location,
        item.type,
        item.participants.toString(),
        item.treesPlanted.toString(),
        item.description,
        item.image,
        item.side,
        item.contactEmail || ''
      ])
    ];

    // Clear existing data and write new data
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: `${TIMELINE_SHEET_NAME}!A:K`,
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${TIMELINE_SHEET_NAME}!A1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: values,
      },
    });

    console.log('Timeline data saved to Google Sheets successfully');
  } catch (error) {
    console.error('Error saving timeline data:', error);
    throw new Error('Failed to save timeline data to Google Sheets');
  }
}

/**
 * Add a new timeline item to Google Sheets
 */
export async function addTimelineItem(item: Omit<TimelineItem, 'id'>): Promise<TimelineItem> {
  try {
    const currentData = await getTimelineData();
    const newId = Math.max(...currentData.map(d => d.id), 0) + 1;
    
    const newItem: TimelineItem = {
      ...item,
      id: newId,
    };

    const updatedData = [...currentData, newItem];
    await saveTimelineData(updatedData);
    
    return newItem;
  } catch (error) {
    console.error('Error adding timeline item:', error);
    throw new Error('Failed to add timeline item to Google Sheets');
  }
}

/**
 * Update an existing timeline item in Google Sheets
 */
export async function updateTimelineItem(id: number, updates: Partial<TimelineItem>): Promise<TimelineItem> {
  try {
    const currentData = await getTimelineData();
    const itemIndex = currentData.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      throw new Error('Timeline item not found');
    }

    const updatedItem = { ...currentData[itemIndex], ...updates, id };
    currentData[itemIndex] = updatedItem;
    
    await saveTimelineData(currentData);
    
    return updatedItem;
  } catch (error) {
    console.error('Error updating timeline item:', error);
    throw new Error('Failed to update timeline item in Google Sheets');
  }
}

/**
 * Delete a timeline item from Google Sheets
 */
export async function deleteTimelineItem(id: number): Promise<void> {
  try {
    const currentData = await getTimelineData();
    const filteredData = currentData.filter(item => item.id !== id);
    
    if (filteredData.length === currentData.length) {
      throw new Error('Timeline item not found');
    }
    
    await saveTimelineData(filteredData);
  } catch (error) {
    console.error('Error deleting timeline item:', error);
    throw new Error('Failed to delete timeline item from Google Sheets');
  }
}

/**
 * Initialize timeline sheet with headers if it doesn't exist
 */
export async function initializeTimelineSheet(): Promise<void> {
  try {
    const sheets = await getSheetsClient();
    
    // Check if timeline sheet exists
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });
    
    const timelineSheet = spreadsheet.data.sheets?.find(
      sheet => sheet.properties?.title === TIMELINE_SHEET_NAME
    );
    
    if (!timelineSheet) {
      // Create the timeline sheet
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: TIMELINE_SHEET_NAME,
              },
            },
          }],
        },
      });
    }
    
    // Check if headers exist
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${TIMELINE_SHEET_NAME}!A1:K1`,
    });
    
    if (!response.data.values || response.data.values.length === 0) {
      // Add headers
      const headers = [
        'ID', 'Date', 'Title', 'Location', 'Type', 
        'Participants', 'Trees Planted', 'Description', 
        'Image', 'Side', 'Contact Email'
      ];
      
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${TIMELINE_SHEET_NAME}!A1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [headers],
        },
      });
    }
  } catch (error) {
    console.error('Error initializing timeline sheet:', error);
    throw new Error('Failed to initialize timeline sheet');
  }
}