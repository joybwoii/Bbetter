import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Note: You need to set FIREBASE_SERVICE_ACCOUNT_KEY env var or provide path to serviceAccountKey.json
// For this script, I'll assume usage with a local service account key if available, 
// otherwise it will fail gracefully with a reminder.

const serviceAccountKeyPath = resolve('serviceAccountKey.json');
let serviceAccount;

try {
  serviceAccount = JSON.parse(readFileSync(serviceAccountKeyPath, 'utf8'));
} catch (e) {
  console.error("Error: 'serviceAccountKey.json' not found in the root directory.");
  console.error("Please download it from Firebase Console -> Project Settings -> Service Accounts.");
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const CATEGORIES = [
  { id: "kitchen", name: "Smart Kitchen", desc: "Effortless cooking with intelligent tools." },
  { id: "organization", name: "Home Organization", desc: "Minimalist solutions for a clutter-free space." },
  { id: "gadgets", name: "Lifestyle Gadgets", desc: "Tech that simplifies your daily routine." },
];

const PRODUCTS = [
  { 
    name: "Automatic Spice Dispenser", 
    price: 1499, 
    category: "kitchen", 
    rating: 4.8, 
    reviews: 342, 
    tag: "Best Seller",
    description: "Upgrade your kitchen experience with a single-press automatic spice dispenser. Measures exact quantities to keep your cooking precise, clean, and organized.",
    stock: 50,
    images: ["https://placehold.co/600x400?text=Spice+Dispenser"]
  },
  { 
    name: "Modular Sink Organizer", 
    price: 899, 
    category: "kitchen", 
    rating: 4.7, 
    reviews: 156,
    description: "Keep your sink area tidy and dry with our modular organizer. Features adjustable compartments for sponges, brushes, and soap.",
    stock: 100,
    images: ["https://placehold.co/600x400?text=Sink+Organizer"]
  },
  { 
    name: "Smart Aroma Diffuser V2", 
    price: 2199, 
    category: "gadgets", 
    rating: 4.9, 
    reviews: 890, 
    tag: "New Arrival",
    description: "Transform your home atmosphere with the app-controlled Smart Aroma Diffuser. Features customizable mist modes and ambient lighting.",
    stock: 30,
    images: ["https://placehold.co/600x400?text=Aroma+Diffuser"]
  },
  { 
    name: "Magnetic Knife Bar & Hooks", 
    price: 1199, 
    category: "organization", 
    rating: 4.6, 
    reviews: 201,
    description: "Maximize your kitchen wall space with this heavy-duty magnetic knife bar. Includes additional hooks for utensils.",
    stock: 75,
    images: ["https://placehold.co/600x400?text=Knife+Bar"]
  },
];

async function seed() {
  console.log("Seeding categories...");
  for (const cat of CATEGORIES) {
    await db.collection('categories').doc(cat.id).set(cat);
    console.log(`- Seeded category: ${cat.name}`);
  }

  console.log("Seeding products...");
  for (const prod of PRODUCTS) {
    const docRef = await db.collection('products').add({
      ...prod,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`- Seeded product: ${prod.name} (ID: ${docRef.id})`);
  }

  console.log("Seeding complete!");
}

seed().catch(console.error);
