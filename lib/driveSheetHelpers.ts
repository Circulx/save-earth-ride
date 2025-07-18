// lib/driveSheetHelpers.ts
import { getSheetsClient, SPREADSHEET_ID } from './googlesheet';
import { DRIVE_SHEET_HEADERS, DRIVE_SHEET_NAME, validateDriveSheetData } from './driveSheetHeaders';

export interface DriveData {
  id?: string;
  title: string;
  location: string;
  date: string;
  participants?: number;
  treesTarget?: number;
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  registrationOpen?: boolean;
  description?: string;
  organizer: string;
  contactEmail: string;
  registrationDeadline?: string;
  meetingPoint?: string;
  duration?: string;
  difficulty?: 'Easy' | 'Moderate' | 'Challenging' | 'Expert';
  logo?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Initialize the drives sheet with headers if it doesn't exist
 */
export async function initializeDriveSheet() {
  try {
    const sheets = await getSheetsClient();
    
    // Check if the sheet exists
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });
    
    const sheetExists = spreadsheet.data.sheets?.some(
      sheet => sheet.properties?.title === DRIVE_SHEET_NAME
    );
    
    if (!sheetExists) {
      // Create the sheet
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: DRIVE_SHEET_NAME,
                gridProperties: {
                  rowCount: 1000,
                  columnCount: DRIVE_SHEET_HEADERS.length
                }
              }
            }
          }]
        }
      });
    }
    
    // Add headers if they don't exist
    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${DRIVE_SHEET_NAME}!1:1`,
    });
    
    if (!headerResponse.data.values || headerResponse.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${DRIVE_SHEET_NAME}!1:1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [DRIVE_SHEET_HEADERS]
        }
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing drive sheet:', error);
    throw error;
  }
}

/**
 * Get all drives from the sheet
 */
export async function getAllDrives(): Promise<DriveData[]> {
  try {
    const sheets = await getSheetsClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${DRIVE_SHEET_NAME}!A:R`, // Adjust range based on number of columns
    });
    
    const rows = response.data.values || [];
    if (rows.length <= 1) return []; // No data rows
    
    const [headers, ...dataRows] = rows;
    
    return dataRows.map(row => {
      const drive: any = {};
      headers.forEach((header, index) => {
        const value = row[index] || '';
        
        // Handle different data types
        switch (header) {
          case 'participants':
          case 'treesTarget':
            drive[header] = value ? parseInt(value) : 0;
            break;
          case 'registrationOpen':
            drive[header] = value === 'true' || value === true;
            break;
          case 'id':
            drive[header] = value ? parseInt(value) : Date.now();
            break;
          default:
            drive[header] = value;
        }
      });
      
      return drive as DriveData;
    });
  } catch (error) {
    console.error('Error getting drives:', error);
    throw error;
  }
}

/**
 * Add a new drive to the sheet
 */
export async function addDrive(driveData: DriveData): Promise<DriveData> {
  try {
    validateDriveSheetData(driveData);
    
    const sheets = await getSheetsClient();
    
    // Generate ID and timestamps
    const now = new Date().toISOString();
    const newDrive: DriveData = {
      ...driveData,
      id: driveData.id || Date.now().toString(),
      createdAt: now,
      updatedAt: now,
      participants: driveData.participants || 0,
      treesTarget: driveData.treesTarget || 0,
      status: driveData.status || 'upcoming',
      registrationOpen: driveData.registrationOpen ?? true,
      difficulty: driveData.difficulty || 'Easy'
    };
    
    // Convert to row array
    const rowData = DRIVE_SHEET_HEADERS.map(header => {
      const value = newDrive[header as keyof DriveData];
      return value !== undefined ? value.toString() : '';
    });
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${DRIVE_SHEET_NAME}!A:R`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [rowData]
      }
    });
    
    return newDrive;
  } catch (error) {
    console.error('Error adding drive:', error);
    throw error;
  }
}

/**
 * Update an existing drive in the sheet
 */
export async function updateDrive(id: string, driveData: Partial<DriveData>): Promise<DriveData> {
  try {
    validateDriveSheetData({ ...driveData, id });
    
    const sheets = await getSheetsClient();
    
    // Get all drives to find the row index
    const allDrives = await getAllDrives();
    const driveIndex = allDrives.findIndex(drive => drive.id?.toString() === id.toString());
    
    if (driveIndex === -1) {
      throw new Error('Drive not found');
    }
    
    // Update the drive data
    const updatedDrive: DriveData = {
      ...allDrives[driveIndex],
      ...driveData,
      updatedAt: new Date().toISOString()
    };
    
    // Convert to row array
    const rowData = DRIVE_SHEET_HEADERS.map(header => {
      const value = updatedDrive[header as keyof DriveData];
      return value !== undefined ? value.toString() : '';
    });
    
    // Update the specific row (add 2 to account for header row and 0-based index)
    const rowNumber = driveIndex + 2;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${DRIVE_SHEET_NAME}!A${rowNumber}:R${rowNumber}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [rowData]
      }
    });
    
    return updatedDrive;
  } catch (error) {
    console.error('Error updating drive:', error);
    throw error;
  }
}

/**
 * Delete a drive from the sheet
 */
export async function deleteDrive(id: string): Promise<boolean> {
  try {
    const sheets = await getSheetsClient();
    
    // Get all drives to find the row index
    const allDrives = await getAllDrives();
    const driveIndex = allDrives.findIndex(drive => drive.id?.toString() === id.toString());
    
    if (driveIndex === -1) {
      throw new Error('Drive not found');
    }
    
    // Delete the row (add 2 to account for header row and 0-based index)
    const rowNumber = driveIndex + 2;
    
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: 0, // Assuming first sheet, you might need to get the actual sheet ID
              dimension: 'ROWS',
              startIndex: rowNumber - 1,
              endIndex: rowNumber
            }
          }
        }]
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting drive:', error);
    throw error;
  }
}

/**
 * Get drive by ID
 */
export async function getDriveById(id: string): Promise<DriveData | null> {
  try {
    const allDrives = await getAllDrives();
    return allDrives.find(drive => drive.id?.toString() === id.toString()) || null;
  } catch (error) {
    console.error('Error getting drive by ID:', error);
    throw error;
  }
}

/**
 * Get drives by status
 */
export async function getDrivesByStatus(status: string): Promise<DriveData[]> {
  try {
    const allDrives = await getAllDrives();
    return allDrives.filter(drive => drive.status === status);
  } catch (error) {
    console.error('Error getting drives by status:', error);
    throw error;
  }
}