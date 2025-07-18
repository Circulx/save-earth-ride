// lib/googleSheetHelpers.ts
import { getSheetsClient, SPREADSHEET_ID } from './googlesheet';

const ADMIN_SHEET_NAME = 'admins';

export async function readAdminsFromSheet() {
  const sheets = await getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${ADMIN_SHEET_NAME}!A2:H`,
  });

  const rows = response.data.values || [];

  return rows.map((row, index) => ({
    id: Number(row[0]),
    username: row[1],
    email: row[2],
    password: row[3],
    role: row[4],
    createdAt: row[5],
    lastLogin: row[6],
    status: row[7],
  }));
}

export async function writeAdminsToSheet(admins: any[]) {
  const sheets = await getSheetsClient();

  // Step 1: Read existing data
  const existingAdmins = await readAdminsFromSheet();
  
  // Create a set of existing IDs for quick lookup
  const existingIds = new Set(existingAdmins.map(admin => admin.id.toString()));
  
  // Create a map of existing admins by ID for updates
  const existingAdminMap = new Map(
    existingAdmins.map((admin, index) => [admin.id.toString(), { admin, rowIndex: index + 2 }])
  );

  // Separate new admins from updates
  const newAdmins: any[] = [];
  const updatedAdmins: { admin: any; rowIndex: number }[] = [];

  admins.forEach((admin) => {
    const adminId = admin.id.toString();
    
    if (existingIds.has(adminId)) {
      // This admin exists, check if it needs updating
      const existingData = existingAdminMap.get(adminId);
      if (existingData && hasAdminChanged(existingData.admin, admin)) {
        updatedAdmins.push({ admin, rowIndex: existingData.rowIndex });
      }
    } else {
      // This is a new admin
      newAdmins.push(admin);
    }
  });

  console.log(`Found ${newAdmins.length} new admins and ${updatedAdmins.length} admins to update`);

  // Step 2: Update existing rows that have changed
  for (const { admin, rowIndex } of updatedAdmins) {
    const values = [
      admin.id ?? '',
      admin.username ?? '',
      admin.email ?? '',
      admin.password ?? '',
      admin.role ?? '',
      admin.createdAt ?? '',
      admin.lastLogin ?? '',
      admin.status ?? '',
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${ADMIN_SHEET_NAME}!A${rowIndex}:H${rowIndex}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [values],
      },
    });
  }

  // Step 3: Append only new rows
  if (newAdmins.length > 0) {
    const newRows = newAdmins.map(admin => [
      admin.id ?? '',
      admin.username ?? '',
      admin.email ?? '',
      admin.password ?? '',
      admin.role ?? '',
      admin.createdAt ?? '',
      admin.lastLogin ?? '',
      admin.status ?? '',
    ]);

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${ADMIN_SHEET_NAME}!A2:H`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: newRows,
      },
    });
  }

  return { 
    success: true, 
    newAdmins: newAdmins.length, 
    updatedAdmins: updatedAdmins.length 
  };
}

// Helper function to check if admin data has changed
function hasAdminChanged(existing: any, incoming: any): boolean {
  const fieldsToCompare = ['username', 'email', 'password', 'role', 'createdAt', 'lastLogin', 'status'];
  
  return fieldsToCompare.some(field => {
    const existingValue = existing[field] || '';
    const incomingValue = incoming[field] || '';
    return existingValue !== incomingValue;
  });
}

// Alternative function that completely replaces the sheet data (use with caution)
export async function replaceAdminsInSheet(admins: any[]) {
  const sheets = await getSheetsClient();

  // First, clear existing data (except headers)
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET_ID,
    range: `${ADMIN_SHEET_NAME}!A2:H`,
  });

  // Then write all the new data
  if (admins.length > 0) {
    const rows = admins.map(admin => [
      admin.id ?? '',
      admin.username ?? '',
      admin.email ?? '',
      admin.password ?? '',
      admin.role ?? '',
      admin.createdAt ?? '',
      admin.lastLogin ?? '',
      admin.status ?? '',
    ]);

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${ADMIN_SHEET_NAME}!A2:H`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: rows,
      },
    });
  }

  return { success: true, totalAdmins: admins.length };
}

// Function to add a single admin (with duplicate check)
export async function addSingleAdmin(admin: any) {
  const existingAdmins = await readAdminsFromSheet();
  const existingIds = new Set(existingAdmins.map(a => a.id.toString()));
  
  if (existingIds.has(admin.id.toString())) {
    return { success: false, message: 'Admin already exists' };
  }
  
  return await writeAdminsToSheet([admin]);
}