import { readFileSync } from 'fs';

const envContent = readFileSync('.env.local', 'utf8');
const match = envContent.match(/FIREBASE_SERVICE_ACCOUNT_KEY=(.*)/);

if (match) {
  const rawValue = match[1].trim();
  console.log("Raw Value Length:", rawValue.length);
  try {
    const parsed = JSON.parse(rawValue);
    console.log("Parsed successfully! Project ID:", parsed.project_id);
  } catch (e) {
    console.error("Parse failed:", e.message);
    console.log("Value starts with:", rawValue.substring(0, 50));
    console.log("Value ends with:", rawValue.substring(rawValue.length - 50));
  }
} else {
  console.log("FIREBASE_SERVICE_ACCOUNT_KEY not found in .env.local");
}
