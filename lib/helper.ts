import { getSheetsClient, SPREADSHEET_ID } from './googlesheet';

export interface TreeCountData {
  count: number;
  lastUpdated: string;
}

export interface DonationData {
  id: string;
  name: string;
  amount: number;
  currency: string;
  date: string;
  email?: string;
  message?: string;
}

export interface RegistrationData {
  id: string;
  name: string;
  type: 'Individual' | 'Club';
  location: string;
  date: string;
  email?: string;
  phone?: string;
  bikeModel?: string;
}

export interface DashboardData {
  treeCount: TreeCountData;
  recentDonations: DonationData[];
  recentRegistrations: RegistrationData[];
  totalRiders: number;
}

/**
 * Fetch tree count data from Google Sheets
 */
export async function getTreeCountData(): Promise<TreeCountData> {
  try {
    const sheets = await getSheetsClient();
    
    // Fetch data from 'treecounter' sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'treecounter!A:C', // Assuming columns: Count, Last Updated, Notes
    });

    const rows = response.data.values || [];
    
    if (rows.length < 2) {
      // Return default if no data
      return {
        count: 25847,
        lastUpdated: new Date().toISOString()
      };
    }

    // Skip header row and get the latest entry
    const latestRow = rows[rows.length - 1];
    
    return {
      count: parseInt(latestRow[0]) || 25847,
      lastUpdated: latestRow[1] || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching tree count data:', error);
    return {
      count: 25847,
      lastUpdated: new Date().toISOString()
    };
  }
}

/**
 * Update tree count in Google Sheets
 */
export async function updateTreeCount(newCount: number): Promise<boolean> {
  try {
    const sheets = await getSheetsClient();
    
    // Append new tree count entry
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'treecounter!A:C',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[newCount, new Date().toISOString(), 'Updated via admin dashboard']]
      }
    });

    return response.status === 200;
  } catch (error) {
    console.error('Error updating tree count:', error);
    return false;
  }
}

/**
 * Fetch donations data from Google Sheets
 */
export async function getDonationsData(): Promise<DonationData[]> {
  try {
    const sheets = await getSheetsClient();
    
    // Fetch data from 'donations' sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'donations!A:H', // Assuming columns: ID, Name, Amount, Currency, Date, Email, Message, Status
    });

    const rows = response.data.values || [];
    
    if (rows.length < 2) {
      return [];
    }

    // Skip header row and convert to DonationData
    const donations: DonationData[] = rows.slice(1).map((row, index) => ({
      id: row[0] || `donation-${index + 1}`,
      name: row[1] || 'Anonymous',
      amount: parseFloat(row[2]) || 0,
      currency: row[3] || 'USD',
      date: row[4] || new Date().toISOString().split('T')[0],
      email: row[5] || undefined,
      message: row[6] || undefined,
    }));

    // Return recent donations (last 10, sorted by date)
    return donations
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  } catch (error) {
    console.error('Error fetching donations data:', error);
    return [];
  }
}

/**
 * Fetch registrations data from Google Sheets
 */
export async function getRegistrationsData(): Promise<RegistrationData[]> {
  try {
    const sheets = await getSheetsClient();
    
    // Fetch data from 'registrations' sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'registrations!A:H', // Assuming columns: ID, Name, Type, Location, Date, Email, Phone, BikeModel
    });

    const rows = response.data.values || [];
    
    if (rows.length < 2) {
      return [];
    }

    // Skip header row and convert to RegistrationData
    const registrations: RegistrationData[] = rows.slice(1).map((row, index) => ({
      id: row[0] || `registration-${index + 1}`,
      name: row[1] || 'Unknown',
      type: (row[2] === 'Club' ? 'Club' : 'Individual') as 'Individual' | 'Club',
      location: row[3] || 'Unknown',
      date: row[4] || new Date().toISOString().split('T')[0],
      email: row[5] || undefined,
      phone: row[6] || undefined,
      bikeModel: row[7] || undefined,
    }));

    // Return recent registrations (last 10, sorted by date)
    return registrations
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  } catch (error) {
    console.error('Error fetching registrations data:', error);
    return [];
  }
}

/**
 * Calculate total riders from registrations
 */
export async function getTotalRiders(): Promise<number> {
  try {
    const registrations = await getRegistrationsData();
    // In a real scenario, you might want to get all registrations, not just recent ones
    // For now, we'll use a larger range to get all registrations
    const sheets = await getSheetsClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'registrations!A:A', // Just get all IDs to count
    });

    const rows = response.data.values || [];
    // Subtract 1 for header row
    return Math.max(0, rows.length - 1);
  } catch (error) {
    console.error('Error calculating total riders:', error);
    return 52340; // Default fallback
  }
}

/**
 * Fetch all dashboard data
 */
export async function getDashboardData(): Promise<DashboardData> {
  try {
    const [treeCount, donations, registrations, totalRiders] = await Promise.all([
      getTreeCountData(),
      getDonationsData(),
      getRegistrationsData(),
      getTotalRiders(),
    ]);

    return {
      treeCount,
      recentDonations: donations,
      recentRegistrations: registrations,
      totalRiders,
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    // Return default data on error
    return {
      treeCount: { count: 25847, lastUpdated: new Date().toISOString() },
      recentDonations: [],
      recentRegistrations: [],
      totalRiders: 52340,
    };
  }
}

/**
 * Add a new donation to Google Sheets
 */
export async function addDonation(donation: Omit<DonationData, 'id'>): Promise<boolean> {
  try {
    const sheets = await getSheetsClient();
    
    // Generate a unique ID
    const id = `donation-${Date.now()}`;
    
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'donations!A:H',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          id,
          donation.name,
          donation.amount,
          donation.currency,
          donation.date,
          donation.email || '',
          donation.message || '',
          'Confirmed'
        ]]
      }
    });

    return response.status === 200;
  } catch (error) {
    console.error('Error adding donation:', error);
    return false;
  }
}

/**
 * Add a new registration to Google Sheets
 */
export async function addRegistration(registration: Omit<RegistrationData, 'id'>): Promise<boolean> {
  try {
    const sheets = await getSheetsClient();
    
    // Generate a unique ID
    const id = `registration-${Date.now()}`;
    
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'registrations!A:H',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          id,
          registration.name,
          registration.type,
          registration.location,
          registration.date,
          registration.email || '',
          registration.phone || '',
          registration.bikeModel || ''
        ]]
      }
    });

    return response.status === 200;
  } catch (error) {
    console.error('Error adding registration:', error);
    return false;
  }
}