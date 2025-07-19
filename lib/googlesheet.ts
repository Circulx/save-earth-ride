import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

const SPREADSHEET_ID = /*'1JQOP0BInND1IVZZv29IkYmjJfl_Zl5LW68R57DS2iAg';*/
'1IiriZCjD_FHO2nclc2By2ynEgUzTTaOd_89Uxr2hCoE';

const categories = [
  'drives',
  'blog',
  'gallery',
  'map',
  'timeline',
  'treecounter',
  'admins',
  'sponsors',
  'registrations',
  'donations',
];

// Vercel-compatible Google Auth setup
const auth = new google.auth.GoogleAuth({
  credentials: {
    type: 'service_account',
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function getSheetsClient() {
  try {
    const authClient = await auth.getClient() as JWT;
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    return sheets;
  } catch (error) {
    console.error('Failed to create sheets client:', error);
    throw error;
  }
}

export { getSheetsClient, SPREADSHEET_ID, categories };