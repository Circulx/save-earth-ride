// import { NextResponse } from 'next/server';
// import { getSheetsClient, SPREADSHEET_ID } from '@/lib/googlesheet';

// const SHEET_RANGE = 'admins!A1:G1000'; // adjust range accordingly

// // Read from Sheet
// export async function GET() {
//   try {
//     const sheets = await getSheetsClient();
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: SPREADSHEET_ID,
//       range: SHEET_RANGE,
//     });

//     const [headers, ...rows] = response.data.values ?? [];

//     const admins = rows.map(row =>
//       headers.reduce((acc, key, i) => {
//         acc[key] = row[i];
//         return acc;
//       }, {} as Record<string, string>)
//     );

//     return NextResponse.json(admins);
//   } catch (error) {
//     console.error('GET /api/admins error:', error);
//     return NextResponse.json({ error: 'Failed to fetch admin data' }, { status: 500 });
//   }
// }

// // Write to Sheet
// export async function POST(req: Request) {
//   try {
//     const data = await req.json(); // array of admin objects

//     const sheets = await getSheetsClient();
//     const headers = Object.keys(data[0] ?? {});

//     const values = [
//       headers,
//       ...data.map((row: any) => headers.map(key => row[key] || ''))
//     ];

//     await sheets.spreadsheets.values.update({
//       spreadsheetId: SPREADSHEET_ID,
//       range: SHEET_RANGE,
//       valueInputOption: 'RAW',
//       requestBody: { values }
//     });

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error('POST /api/admins error:', error);
//     return NextResponse.json({ error: 'Failed to update admin data' }, { status: 500 });
//   }
// }

// app/api/admins/route.ts

import { NextResponse, type NextRequest } from "next/server"
import { readAdminsFromSheet, writeAdminsToSheet } from "@/lib/googleSheetHelpers"

export async function GET() {
  const data = await readAdminsFromSheet()
  return NextResponse.json({ data })
}

export const dynamic = "auto"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log("Request body:", body)

    // Validate the request body
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Request body must be an array of admin objects" }, { status: 400 })
    }

    await writeAdminsToSheet(body)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("POST /api/admins error:", error)
    return NextResponse.json({ error: error.message || "Failed to update admin data" }, { status: 500 })
  }
}
