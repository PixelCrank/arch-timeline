
import { NextResponse } from 'next/server';
import { google } from 'googleapis';

// Helper to map a sheet's rows to objects using the header row
function mapSheetRows(values: string[][]) {
  if (!values || values.length < 2) return [];
  const headers = values[0];
  return values.slice(1).map(row => {
    const obj: Record<string, string> = {};
    headers.forEach((header, i) => {
      obj[header] = row[i] || '';
    });
    return obj;
  });
}

export async function GET() {
  const authClient = new google.auth.JWT({
    keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  await authClient.authorize();
  const sheets = google.sheets({ version: 'v4', auth: authClient });
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  // Sheet/tab names based on your workbook
  const tabNames = ['Macros', 'Movements', 'Buildings', 'Figures'];
  const data: Record<string, Record<string, string>[]> = {};

  for (const tab of tabNames) {
    const range = `${tab}!A:Z`;
    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    data[tab] = mapSheetRows(res.data.values as string[][]);
  }

  return NextResponse.json(data);
}
