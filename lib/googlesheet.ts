import { GoogleSpreadsheet } from "google-spreadsheet"
import { JWT } from "google-auth-library"

// Create service account auth from environment variables
const createServiceAccountAuth = () => {
  const credentials = {
    type: "service_account",
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.GOOGLE_CLIENT_EMAIL || "")}`,
    universe_domain: "googleapis.com",
  }

  return new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive.file"],
  })
}

export const getGoogleSheet = async (sheetId: string) => {
  try {
    const serviceAccountAuth = createServiceAccountAuth()
    const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth)
    await doc.loadInfo()
    return doc
  } catch (error) {
    console.error("Error accessing Google Sheet:", error)
    throw error
  }
}

export const appendToSheet = async (sheetId: string, sheetName: string, values: any[]) => {
  try {
    const doc = await getGoogleSheet(sheetId)
    const sheet = doc.sheetsByTitle[sheetName]
    if (!sheet) {
      throw new Error(`Sheet "${sheetName}" not found`)
    }
    await sheet.addRow(values)
    return { success: true }
  } catch (error) {
    console.error("Error appending to sheet:", error)
    throw error
  }
}

export const readFromSheet = async (sheetId: string, sheetName: string) => {
  try {
    const doc = await getGoogleSheet(sheetId)
    const sheet = doc.sheetsByTitle[sheetName]
    if (!sheet) {
      throw new Error(`Sheet "${sheetName}" not found`)
    }
    const rows = await sheet.getRows()
    return rows.map((row: { toObject: () => any }) => row.toObject())
  } catch (error) {
    console.error("Error reading from sheet:", error)
    throw error
  }
}
