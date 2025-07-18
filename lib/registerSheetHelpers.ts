import { getSheetsClient, SPREADSHEET_ID } from './googlesheet';

export interface RegistrationData {
  type: 'individual' | 'club';
  // Individual fields
  firstName?: string;
  lastName?: string;
  bio?: string;
  ridingExperience?: string;
  // Club fields
  clubName?: string;
  adminName?: string;
  description?: string;
  website?: string;
  // Common fields
  email: string;
  phone: string;
  country: string;
  city: string;
  licenceNumber: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  acceptTerms: boolean;
  // Additional metadata
  registrationId?: string;
  timestamp?: string;
}

const REGISTRATION_SHEET_NAME = 'registrations';

const REGISTRATION_HEADERS = [
  'Registration ID',
  'Type',
  'Name',
  'Email',
  'Phone',
  'Country',
  'City',
  'Licence Number',
  'Bio/Description',
  'Riding Experience',
  'Website',
  'Instagram',
  'Facebook',
  'Twitter',
  'Terms Accepted',
  'Registration Date',
  'Timestamp'
];

/**
 * Ensures the registration sheet exists with proper headers
 */
export async function ensureRegistrationSheet(): Promise<void> {
  try {
    const sheets = await getSheetsClient();
    
    // Check if sheet exists
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });
    
    const sheetExists = spreadsheet.data.sheets?.some(
      sheet => sheet.properties?.title === REGISTRATION_SHEET_NAME
    );
    
    if (!sheetExists) {
      // Create the sheet
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: REGISTRATION_SHEET_NAME,
                gridProperties: {
                  rowCount: 1000,
                  columnCount: REGISTRATION_HEADERS.length,
                },
              },
            },
          }],
        },
      });
    }
    
    // Check if headers exist
    const headerRange = `${REGISTRATION_SHEET_NAME}!A1:${String.fromCharCode(64 + REGISTRATION_HEADERS.length)}1`;
    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: headerRange,
    });
    
    const existingHeaders = headerResponse.data.values?.[0] || [];
    
    // Add headers if they don't exist or are incomplete
    if (existingHeaders.length === 0 || existingHeaders.length < REGISTRATION_HEADERS.length) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: headerRange,
        valueInputOption: 'RAW',
        requestBody: {
          values: [REGISTRATION_HEADERS],
        },
      });
    }
  } catch (error) {
    console.error('Error ensuring registration sheet:', error);
    throw new Error('Failed to ensure registration sheet exists');
  }
}

/**
 * Converts registration data to row format for Google Sheets
 */
function registrationToRow(data: RegistrationData): (string | number)[] {
  const registrationId = data.registrationId || `reg-${Date.now()}`;
  const timestamp = data.timestamp || new Date().toISOString();
  const registrationDate = new Date().toLocaleDateString();
  
  // Determine name based on type
  const name = data.type === 'club' 
    ? data.clubName || 'Unknown Club'
    : `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Unknown';
  
  // Bio or description based on type
  const bioDescription = data.type === 'club' 
    ? data.description || ''
    : data.bio || '';
  
  return [
    registrationId,
    data.type === 'club' ? 'Club' : 'Individual',
    name,
    data.email,
    data.phone,
    data.country,
    data.city,
    data.licenceNumber,
    bioDescription,
    data.ridingExperience || (data.type === 'club' ? 'N/A' : ''),
    data.website || '',
    data.instagram || '',
    data.facebook || '',
    data.twitter || '',
    data.acceptTerms ? 'Yes' : 'No',
    registrationDate,
    timestamp
  ];
}

/**
 * Adds a new registration to the Google Sheet
 */
export async function addRegistration(data: RegistrationData): Promise<string> {
  try {
    await ensureRegistrationSheet();
    
    const sheets = await getSheetsClient();
    const registrationId = `reg-${Date.now()}`;
    
    // Add registration ID and timestamp to data
    const enhancedData = {
      ...data,
      registrationId,
      timestamp: new Date().toISOString(),
    };
    
    const row = registrationToRow(enhancedData);
    
    // Find the next empty row
    const range = `${REGISTRATION_SHEET_NAME}!A:A`;
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: range,
    });
    
    const nextRow = (response.data.values?.length || 0) + 1;
    const targetRange = `${REGISTRATION_SHEET_NAME}!A${nextRow}:${String.fromCharCode(64 + REGISTRATION_HEADERS.length)}${nextRow}`;
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: targetRange,
      valueInputOption: 'RAW',
      requestBody: {
        values: [row],
      },
    });
    
    return registrationId;
  } catch (error) {
    console.error('Error adding registration:', error);
    throw new Error('Failed to add registration to sheet');
  }
}

/**
 * Retrieves all registrations from the Google Sheet
 */
export async function getRegistrations(): Promise<RegistrationData[]> {
  try {
    await ensureRegistrationSheet();
    
    const sheets = await getSheetsClient();
    const range = `${REGISTRATION_SHEET_NAME}!A2:${String.fromCharCode(64 + REGISTRATION_HEADERS.length)}`;
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: range,
    });
    
    const rows = response.data.values || [];
    
    return rows.map(row => {
      const [
        registrationId,
        type,
        name,
        email,
        phone,
        country,
        city,
        licenceNumber,
        bioDescription,
        ridingExperience,
        website,
        instagram,
        facebook,
        twitter,
        termsAccepted,
        registrationDate,
        timestamp
      ] = row;
      
      // Parse name for individual registrations
      const isClub = type === 'Club';
      const firstName = isClub ? undefined : name.split(' ')[0];
      const lastName = isClub ? undefined : name.split(' ').slice(1).join(' ');
      
      return {
        registrationId,
        type: isClub ? 'club' : 'individual',
        firstName,
        lastName,
        clubName: isClub ? name : undefined,
        adminName: isClub ? undefined : name,
        email,
        phone,
        country,
        city,
        licenceNumber,
        bio: isClub ? undefined : bioDescription,
        description: isClub ? bioDescription : undefined,
        ridingExperience: ridingExperience === 'N/A' ? undefined : ridingExperience,
        website: website || undefined,
        instagram: instagram || undefined,
        facebook: facebook || undefined,
        twitter: twitter || undefined,
        acceptTerms: termsAccepted === 'Yes',
        timestamp,
      } as RegistrationData;
    });
  } catch (error) {
    console.error('Error getting registrations:', error);
    throw new Error('Failed to retrieve registrations from sheet');
  }
}

/**
 * Gets registration statistics
 */
export async function getRegistrationStats(): Promise<{
  total: number;
  individuals: number;
  clubs: number;
  recentRegistrations: number;
}> {
  try {
    const registrations = await getRegistrations();
    const total = registrations.length;
    const individuals = registrations.filter(r => r.type === 'individual').length;
    const clubs = registrations.filter(r => r.type === 'club').length;
    
    // Count registrations from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRegistrations = registrations.filter(r => {
      if (!r.timestamp) return false;
      const regDate = new Date(r.timestamp);
      return regDate >= thirtyDaysAgo;
    }).length;
    
    return {
      total,
      individuals,
      clubs,
      recentRegistrations,
    };
  } catch (error) {
    console.error('Error getting registration stats:', error);
    throw new Error('Failed to get registration statistics');
  }
}

/**
 * Updates a registration by ID
 */
export async function updateRegistration(
  registrationId: string, 
  updates: Partial<RegistrationData>
): Promise<void> {
  try {
    await ensureRegistrationSheet();
    
    const sheets = await getSheetsClient();
    const range = `${REGISTRATION_SHEET_NAME}!A:A`;
    
    // Find the row with the registration ID
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: range,
    });
    
    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === registrationId);
    
    if (rowIndex === -1) {
      throw new Error('Registration not found');
    }
    
    // Get current data
    const currentRow = rows[rowIndex];
    const currentData: RegistrationData = {
      registrationId: currentRow[0],
      type: currentRow[1] === 'Club' ? 'club' : 'individual',
      firstName: currentRow[1] === 'Individual' ? currentRow[2].split(' ')[0] : undefined,
      lastName: currentRow[1] === 'Individual' ? currentRow[2].split(' ').slice(1).join(' ') : undefined,
      clubName: currentRow[1] === 'Club' ? currentRow[2] : undefined,
      email: currentRow[3],
      phone: currentRow[4],
      country: currentRow[5],
      city: currentRow[6],
      licenceNumber: currentRow[7],
      bio: currentRow[1] === 'Individual' ? currentRow[8] : undefined,
      description: currentRow[1] === 'Club' ? currentRow[8] : undefined,
      ridingExperience: currentRow[9] === 'N/A' ? undefined : currentRow[9],
      website: currentRow[10] || undefined,
      instagram: currentRow[11] || undefined,
      facebook: currentRow[12] || undefined,
      twitter: currentRow[13] || undefined,
      acceptTerms: currentRow[14] === 'Yes',
      timestamp: currentRow[16],
    };
    
    // Merge updates
    const updatedData = { ...currentData, ...updates };
    const updatedRow = registrationToRow(updatedData);
    
    // Update the row
    const targetRange = `${REGISTRATION_SHEET_NAME}!A${rowIndex + 1}:${String.fromCharCode(64 + REGISTRATION_HEADERS.length)}${rowIndex + 1}`;
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: targetRange,
      valueInputOption: 'RAW',
      requestBody: {
        values: [updatedRow],
      },
    });
  } catch (error) {
    console.error('Error updating registration:', error);
    throw new Error('Failed to update registration');
  }
}

/**
 * Deletes a registration by ID
 */
export async function deleteRegistration(registrationId: string): Promise<void> {
  try {
    await ensureRegistrationSheet();
    
    const sheets = await getSheetsClient();
    const range = `${REGISTRATION_SHEET_NAME}!A:A`;
    
    // Find the row with the registration ID
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: range,
    });
    
    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === registrationId);
    
    if (rowIndex === -1) {
      throw new Error('Registration not found');
    }
    
    // Delete the row (add 1 because sheets are 1-indexed)
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: 0, // Assuming first sheet
              dimension: 'ROWS',
              startIndex: rowIndex,
              endIndex: rowIndex + 1,
            },
          },
        }],
      },
    });
  } catch (error) {
    console.error('Error deleting registration:', error);
    throw new Error('Failed to delete registration');
  }
}