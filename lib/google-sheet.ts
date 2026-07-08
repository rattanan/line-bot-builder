import { google } from "googleapis";

const auth = new google.auth.GoogleAuth({
credentials: {
client_email: process.env.GOOGLE_CLIENT_EMAIL,
private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(
/\n/g,
"\n"
),
},
scopes: [
"https://www.googleapis.com/auth/spreadsheets",
],
});

export async function getFAQData() {
const sheets = google.sheets({
version: "v4",
auth,
});

const response =
await sheets.spreadsheets.values.get({
spreadsheetId:
process.env.GOOGLE_SHEET_ID,
range: "FAQ!A:B",
});

return response.data.values || [];
}
