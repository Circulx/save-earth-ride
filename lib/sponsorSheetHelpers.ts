import { getSheetsClient, SPREADSHEET_ID } from './googlesheet';
import { sheets_v4 } from 'googleapis';

const SPONSORS_SHEET = 'sponsors';

// Define the sponsor data structure
interface SponsorData {
  id: number;
  name: string;
  logo: string;
  tier: string;
  website: string;
  description: string;
  contribution: string;
  since: string;
  category: string;
  contactEmail: string;
  contactPerson: string;
  amount: number;
  type: string;
}

// Column headers for the Google Sheet
const HEADERS = [
  'id',
  'name',
  'logo',
  'tier',
  'website',
  'description',
  'contribution',
  'since',
  'category',
  'contactEmail',
  'contactPerson',
  'amount',
  'type'
];

// Helper function to ensure the sponsors sheet exists
async function ensureSponsorSheet() {
  try {
    const sheets = await getSheetsClient();
    
    // Check if the sponsors sheet exists
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const sponsorSheet = spreadsheet.data.sheets?.find(
      sheet => sheet.properties?.title === SPONSORS_SHEET
    );

    if (!sponsorSheet) {
      // Create the sponsors sheet if it doesn't exist
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: SPONSORS_SHEET,
                },
              },
            },
          ],
        },
      });

      // Add headers to the new sheet
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SPONSORS_SHEET}!A1:M1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [HEADERS],
        },
      });
    }
  } catch (error) {
    console.error('Error ensuring sponsor sheet exists:', error);
    throw error;
  }
}

// Convert row data to sponsor object
function rowToSponsor(row: any[], index: number): SponsorData {
  return {
    id: parseInt(row[0]) || index + 1,
    name: row[1] || '',
    logo: row[2] || '',
    tier: row[3] || '',
    website: row[4] || '',
    description: row[5] || '',
    contribution: row[6] || '',
    since: row[7] || '',
    category: row[8] || '',
    contactEmail: row[9] || '',
    contactPerson: row[10] || '',
    amount: parseFloat(row[11]) || 0,
    type: row[12] || 'sponsor'
  };
}

// Convert sponsor object to row data
function sponsorToRow(sponsor: SponsorData): any[] {
  return [
    sponsor.id,
    sponsor.name,
    sponsor.logo,
    sponsor.tier,
    sponsor.website,
    sponsor.description,
    sponsor.contribution,
    sponsor.since,
    sponsor.category,
    sponsor.contactEmail,
    sponsor.contactPerson,
    sponsor.amount,
    sponsor.type
  ];
}

// Get all sponsor data from Google Sheets
export async function getSponsorData(): Promise<SponsorData[]> {
  try {
    await ensureSponsorSheet();
    const sheets = await getSheetsClient();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SPONSORS_SHEET}!A2:M`,
    });

    const rows = response.data.values || [];
    return rows.map((row, index) => rowToSponsor(row, index));
  } catch (error) {
    console.error('Error fetching sponsor data:', error);
    throw error;
  }
}

// Save all sponsor data to Google Sheets (overwrites existing data)
export async function saveSponsorData(sponsors: SponsorData[]): Promise<void> {
  try {
    await ensureSponsorSheet();
    const sheets = await getSheetsClient();

    // Clear existing data (except headers)
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SPONSORS_SHEET}!A2:M`,
    });

    if (sponsors.length > 0) {
      // Convert sponsors to rows
      const rows = sponsors.map(sponsor => sponsorToRow(sponsor));

      // Add the data
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SPONSORS_SHEET}!A2:M${rows.length + 1}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: rows,
        },
      });
    }
  } catch (error) {
    console.error('Error saving sponsor data:', error);
    throw error;
  }
}

// Add a new sponsor
export async function addSponsorData(sponsor: Omit<SponsorData, 'id'>): Promise<SponsorData> {
  try {
    const existingSponsors = await getSponsorData();
    const newId = existingSponsors.length > 0 ? Math.max(...existingSponsors.map(s => s.id)) + 1 : 1;
    
    const newSponsor: SponsorData = {
      ...sponsor,
      id: newId
    };

    const updatedSponsors = [...existingSponsors, newSponsor];
    await saveSponsorData(updatedSponsors);
    
    return newSponsor;
  } catch (error) {
    console.error('Error adding sponsor:', error);
    throw error;
  }
}

// Update an existing sponsor
export async function updateSponsorData(id: number, updatedSponsor: Partial<SponsorData>): Promise<SponsorData> {
  try {
    const existingSponsors = await getSponsorData();
    const sponsorIndex = existingSponsors.findIndex(s => s.id === id);
    
    if (sponsorIndex === -1) {
      throw new Error('Sponsor not found');
    }

    const updated = {
      ...existingSponsors[sponsorIndex],
      ...updatedSponsor,
      id // Ensure ID doesn't change
    };

    existingSponsors[sponsorIndex] = updated;
    await saveSponsorData(existingSponsors);
    
    return updated;
  } catch (error) {
    console.error('Error updating sponsor:', error);
    throw error;
  }
}

// Delete a sponsor
export async function deleteSponsorData(id: number): Promise<void> {
  try {
    const existingSponsors = await getSponsorData();
    const filteredSponsors = existingSponsors.filter(s => s.id !== id);
    
    if (filteredSponsors.length === existingSponsors.length) {
      throw new Error('Sponsor not found');
    }

    await saveSponsorData(filteredSponsors);
  } catch (error) {
    console.error('Error deleting sponsor:', error);
    throw error;
  }
}

// Export all sponsors data as Excel-compatible format
export async function exportSponsorsToExcel(): Promise<any[]> {
  try {
    const sponsors = await getSponsorData();
    return sponsors.map(sponsor => ({
      'ID': sponsor.id,
      'Name': sponsor.name,
      'Logo': sponsor.logo,
      'Tier': sponsor.tier,
      'Website': sponsor.website,
      'Description': sponsor.description,
      'Contribution': sponsor.contribution,
      'Since': sponsor.since,
      'Category': sponsor.category,
      'Contact Email': sponsor.contactEmail,
      'Contact Person': sponsor.contactPerson,
      'Amount': sponsor.amount,
      'Type': sponsor.type
    }));
  } catch (error) {
    console.error('Error exporting sponsors to Excel:', error);
    throw error;
  }
}