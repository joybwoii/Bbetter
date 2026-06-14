import { adminDb } from '../src/lib/firebase/admin';

async function test() {
  try {
    const snap = await adminDb.collection('categories').get();
    console.log("Empty?", snap.empty);
    console.log("Docs:", snap.docs.map(d => d.data()));
  } catch (err) {
    console.error(err);
  }
}
test();
