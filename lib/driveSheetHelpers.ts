// lib/driveSheetHelpers.ts
import { getSheetsClient, SPREADSHEET_ID } from './googlesheet';
import { DRIVE_SHEET_HEADERS, DRIVE_SHEET_NAME, validateDriveSheetData } from './driveSheetHeaders';
import { sheets_v4 } from 'googleapis';

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

// Enhanced caching with TTL and compression
interface CacheEntry {
  data: DriveData[];
  timestamp: number;
  etag?: string;
}

interface ConnectionPool {
  client: sheets_v4.Sheets;
  lastUsed: number;
  isInUse: boolean;
}

// Connection pooling
const connectionPool: ConnectionPool[] = [];
const MAX_POOL_SIZE = 3;
const POOL_TIMEOUT = 30000; // 30 seconds

// Multi-level caching
let memoryCache: CacheEntry | null = null;
let sheetMetadata: { id: number; lastModified?: string } | null = null;
let isInitialized = false;

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const METADATA_TTL = 10 * 60 * 1000; // 10 minutes

// Optimized data transformation with pre-compiled mappings
const headerIndexMap = new Map<string, number>();
DRIVE_SHEET_HEADERS.forEach((header, index) => {
  headerIndexMap.set(header, index);
});

const transformRowToData = (row: string[]): DriveData => {
  const drive: any = {};
  
  // Use pre-compiled header mapping for O(1) access
  for (const [header, index] of headerIndexMap) {
    const value = row[index] || '';
    
    switch (header) {
      case 'participants':
      case 'treesTarget':
        drive[header] = value ? parseInt(value, 10) : 0;
        break;
      case 'registrationOpen':
        drive[header] = value === 'true';
        break;
      case 'id':
        drive[header] = value || Date.now().toString();
        break;
      default:
        drive[header] = value;
    }
  }
  
  return drive as DriveData;
};

// Connection pool management
async function getPooledClient(): Promise<sheets_v4.Sheets> {
  const now = Date.now();
  
  // Clean up expired connections
  for (let i = connectionPool.length - 1; i >= 0; i--) {
    if (now - connectionPool[i].lastUsed > POOL_TIMEOUT) {
      connectionPool.splice(i, 1);
    }
  }
  
  // Find available connection
  const available = connectionPool.find(conn => !conn.isInUse);
  if (available) {
    available.isInUse = true;
    available.lastUsed = now;
    return available.client;
  }
  
  // Create new connection if pool not full
  if (connectionPool.length < MAX_POOL_SIZE) {
    const client = await getSheetsClient();
    const poolEntry = { client, lastUsed: now, isInUse: true };
    connectionPool.push(poolEntry);
    return client;
  }
  
  // Use oldest connection if pool is full
  const oldest = connectionPool.reduce((prev, curr) => 
    prev.lastUsed < curr.lastUsed ? prev : curr
  );
  oldest.isInUse = true;
  oldest.lastUsed = now;
  return oldest.client;
}

function releaseClient(client: sheets_v4.Sheets): void {
  const poolEntry = connectionPool.find(conn => conn.client === client);
  if (poolEntry) {
    poolEntry.isInUse = false;
  }
}

// Optimized sheet metadata retrieval
async function getSheetMetadata(): Promise<{ id: number; lastModified?: string }> {
  if (sheetMetadata && Date.now() - (sheetMetadata as any).timestamp < METADATA_TTL) {
    return sheetMetadata;
  }
  
  const client = await getPooledClient();
  try {
    const spreadsheet = await client.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
      fields: 'sheets.properties'
    });
    
    const sheet = spreadsheet.data.sheets?.find(
      sheet => sheet.properties?.title === DRIVE_SHEET_NAME
    );
    
    if (!sheet?.properties?.sheetId) {
      throw new Error('Sheet not found');
    }
    
    sheetMetadata = {
      id: sheet.properties.sheetId,
      lastModified: new Date().toISOString(),
      timestamp: Date.now()
    } as any;
    
    if(sheetMetadata){
    return sheetMetadata;} else {
      throw new Error('Sheet metadata not found');
    }
  } finally {
    releaseClient(client);
  }
}

/**
 * Optimized initialization with minimal API calls
 */
export async function initializeDriveSheet(): Promise<boolean> {
  if (isInitialized) return true;
  
  const client = await getPooledClient();
  try {
    // Single API call to check and create sheet
    const spreadsheet = await client.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
      fields: 'sheets.properties'
    });
    
    const sheetExists = spreadsheet.data.sheets?.some(
      sheet => sheet.properties?.title === DRIVE_SHEET_NAME
    );
    
    if (!sheetExists) {
      const response = await client.spreadsheets.batchUpdate({
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
      
      // Cache new sheet metadata
      const newSheet = response.data.replies?.[0]?.addSheet;
      if (newSheet?.properties?.sheetId !== undefined) {
        sheetMetadata = {
          id: newSheet.properties.sheetId,
          lastModified: new Date().toISOString(),
          timestamp: Date.now()
        } as any;
      }
      
      // Add headers in same batch
      await client.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${DRIVE_SHEET_NAME}!1:1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [DRIVE_SHEET_HEADERS]
        }
      });
    }
    
    isInitialized = true;
    return true;
  } finally {
    releaseClient(client);
  }
}

/**
 * Optimized data retrieval with smart caching
 */
export async function getAllDrives(): Promise<DriveData[]> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (memoryCache && (now - memoryCache.timestamp) < CACHE_TTL) {
    return memoryCache.data;
  }
  
  const client = await getPooledClient();
  try {
    // Use batch request for better performance
    const columnRange = String.fromCharCode(65 + DRIVE_SHEET_HEADERS.length - 1);
    const response = await client.spreadsheets.values.batchGet({
      spreadsheetId: SPREADSHEET_ID,
      ranges: [`${DRIVE_SHEET_NAME}!A1:${columnRange}`],
      majorDimension: 'ROWS',
      valueRenderOption: 'UNFORMATTED_VALUE'
    });
    
    const rows = response.data.valueRanges?.[0]?.values || [];
    if (rows.length <= 1) {
      memoryCache = { data: [], timestamp: now };
      return [];
    }
    
    // Skip header row and process in chunks for better performance
    const dataRows = rows.slice(1);
    const drives: DriveData[] = [];
    
    // Process in batches to avoid blocking
    const batchSize = 100;
    for (let i = 0; i < dataRows.length; i += batchSize) {
      const batch = dataRows.slice(i, i + batchSize);
      const batchDrives = batch.map(row => transformRowToData(row));
      drives.push(...batchDrives);
      
      // Allow event loop to process other tasks
      if (i % 200 === 0) {
        await new Promise(resolve => setImmediate(resolve));
      }
    }
    
    // Update cache
    memoryCache = { data: drives, timestamp: now };
    return drives;
    
  } finally {
    releaseClient(client);
  }
}

/**
 * Optimized single drive retrieval
 */
export async function getDriveById(id: string): Promise<DriveData | null> {
  // Try cache first
  if (memoryCache && (Date.now() - memoryCache.timestamp) < CACHE_TTL) {
    return memoryCache.data.find(drive => drive.id?.toString() === id) || null;
  }
  
  // Fallback to full retrieval
  const drives = await getAllDrives();
  return drives.find(drive => drive.id?.toString() === id) || null;
}

/**
 * Optimized filtered retrieval
 */
export async function getDrivesByStatus(status: string): Promise<DriveData[]> {
  const drives = await getAllDrives();
  return drives.filter(drive => drive.status === status);
}

/**
 * Optimized add operation with immediate cache update
 */
export async function addDrive(driveData: DriveData): Promise<DriveData> {
  validateDriveSheetData(driveData);
  
  const client = await getPooledClient();
  try {
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
    
    const rowData = DRIVE_SHEET_HEADERS.map(header => {
      const value = newDrive[header as keyof DriveData];
      return value !== undefined ? String(value) : '';
    });
    
    const columnRange = String.fromCharCode(65 + DRIVE_SHEET_HEADERS.length - 1);
    await client.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${DRIVE_SHEET_NAME}!A:${columnRange}`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [rowData]
      }
    });
    
    // Update cache immediately
    if (memoryCache) {
      memoryCache.data.push(newDrive);
      memoryCache.timestamp = Date.now();
    }
    
    return newDrive;
  } finally {
    releaseClient(client);
  }
}

/**
 * Optimized update with cache synchronization
 */
export async function updateDrive(id: string, driveData: Partial<DriveData>): Promise<DriveData> {
  validateDriveSheetData({ ...driveData, id });
  
  const client = await getPooledClient();
  try {
    const drives = await getAllDrives();
    const driveIndex = drives.findIndex(drive => drive.id?.toString() === id);
    
    if (driveIndex === -1) {
      throw new Error('Drive not found');
    }
    
    const updatedDrive: DriveData = {
      ...drives[driveIndex],
      ...driveData,
      updatedAt: new Date().toISOString()
    };
    
    const rowData = DRIVE_SHEET_HEADERS.map(header => {
      const value = updatedDrive[header as keyof DriveData];
      return value !== undefined ? String(value) : '';
    });
    
    const rowNumber = driveIndex + 2;
    const columnRange = String.fromCharCode(65 + DRIVE_SHEET_HEADERS.length - 1);
    
    await client.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${DRIVE_SHEET_NAME}!A${rowNumber}:${columnRange}${rowNumber}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [rowData]
      }
    });
    
    // Update cache immediately
    if (memoryCache) {
      memoryCache.data[driveIndex] = updatedDrive;
      memoryCache.timestamp = Date.now();
    }
    
    return updatedDrive;
  } finally {
    releaseClient(client);
  }
}

/**
 * Optimized delete with cache update
 */
export async function deleteDrive(id: string): Promise<boolean> {
  const client = await getPooledClient();
  try {
    const drives = await getAllDrives();
    const driveIndex = drives.findIndex(drive => drive.id?.toString() === id);
    
    if (driveIndex === -1) {
      throw new Error('Drive not found');
    }
    
    const metadata = await getSheetMetadata();
    const rowNumber = driveIndex + 2;
    
    await client.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: metadata.id,
              dimension: 'ROWS',
              startIndex: rowNumber - 1,
              endIndex: rowNumber
            }
          }
        }]
      }
    });
    
    // Update cache immediately
    if (memoryCache) {
      memoryCache.data.splice(driveIndex, 1);
      memoryCache.timestamp = Date.now();
    }
    
    return true;
  } finally {
    releaseClient(client);
  }
}

/**
 * Optimized batch operations
 */
export async function batchUpdateDrives(updates: { id: string; data: Partial<DriveData> }[]): Promise<DriveData[]> {
  const client = await getPooledClient();
  try {
    const drives = await getAllDrives();
    const batchRequests = [];
    const results: DriveData[] = [];
    
    for (const { id, data } of updates) {
      const driveIndex = drives.findIndex(drive => drive.id?.toString() === id);
      
      if (driveIndex === -1) {
        throw new Error(`Drive with ID ${id} not found`);
      }
      
      const updatedDrive = {
        ...drives[driveIndex],
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      const rowData = DRIVE_SHEET_HEADERS.map(header => {
        const value = updatedDrive[header as keyof DriveData];
        return value !== undefined ? String(value) : '';
      });
      
      const rowNumber = driveIndex + 2;
      const columnRange = String.fromCharCode(65 + DRIVE_SHEET_HEADERS.length - 1);
      
      batchRequests.push({
        range: `${DRIVE_SHEET_NAME}!A${rowNumber}:${columnRange}${rowNumber}`,
        values: [rowData]
      });
      
      results.push(updatedDrive);
    }
    
    await client.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: batchRequests
      }
    });
    
    // Update cache
    if (memoryCache) {
      results.forEach(updatedDrive => {
        const index = memoryCache!.data.findIndex(d => d.id === updatedDrive.id);
        if (index !== -1) {
          memoryCache!.data[index] = updatedDrive;
        }
      });
      memoryCache.timestamp = Date.now();
    }
    
    return results;
  } finally {
    releaseClient(client);
  }
}

/**
 * Cache management functions
 */
export function invalidateCache(): void {
  memoryCache = null;
}

export function clearCache(): void {
  memoryCache = null;
  sheetMetadata = null;
  isInitialized = false;
  connectionPool.length = 0;
}

export function getCacheStats(): { cached: boolean; age: number; size: number } {
  return {
    cached: memoryCache !== null,
    age: memoryCache ? Date.now() - memoryCache.timestamp : 0,
    size: memoryCache ? memoryCache.data.length : 0
  };
}