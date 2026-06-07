export const MOCK_CATEGORIES = [
  { id: "kitchen", name: "Smart Kitchen", description: "Effortless cooking with intelligent tools." },
  { id: "organization", name: "Home Organization", description: "Minimalist solutions for a clutter-free space." },
  { id: "gadgets", name: "Lifestyle Gadgets", description: "Tech that simplifies your daily routine." },
  { id: "beauty", name: "Beauty & Hair", description: "Premium beauty and hair care essentials." },
  { id: "home-gym", name: "Home Gym", description: "Professional workout equipment for your home." },
];

export const MOCK_PRODUCTS = [
  // Kitchen
  { id: "p1", name: "Automatic Spice Dispenser", price: 1499, mrp: 1999, category: "kitchen", rating: 4.8, reviews: 342, tag: "Best Seller", stock: 15, images: ["https://images.unsplash.com/photo-1596647901844-42f01fbd821d?w=800&q=80"] },
  { id: "p2", name: "Modular Sink Organizer", price: 899, mrp: 1299, category: "kitchen", rating: 4.7, reviews: 156, stock: 45, images: ["https://images.unsplash.com/photo-1584346764516-724d46f90912?w=800&q=80"] },
  { id: "p3", name: "Smart Electric Kettle", price: 2999, mrp: 3999, category: "kitchen", rating: 4.9, reviews: 210, tag: "New", stock: 8, images: ["https://images.unsplash.com/photo-1594247596827-023a496b971a?w=800&q=80"] },
  
  // Organization
  { id: "p4", name: "Magnetic Knife Bar", price: 1199, mrp: 1599, category: "organization", rating: 4.6, reviews: 201, stock: 12, images: ["https://images.unsplash.com/photo-1593504049359-74330189a345?w=800&q=80"] },
  { id: "p5", name: "Under-Shelf Storage Basket", price: 699, mrp: 999, category: "organization", rating: 4.5, reviews: 89, stock: 60, images: ["https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&q=80"] },
  
  // Gadgets
  { id: "p6", name: "Smart Aroma Diffuser V2", price: 2199, mrp: 2999, category: "gadgets", rating: 4.9, reviews: 890, tag: "Top Rated", stock: 25, images: ["https://images.unsplash.com/photo-1608535002898-112340578635?w=800&q=80"] },
  { id: "p7", name: "Motion Sensor Night Light", price: 499, mrp: 799, category: "gadgets", rating: 4.7, reviews: 540, stock: 120, images: ["https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80"] },
  
  // Beauty
  { id: "p8", name: "Ionic Hair Dryer Pro", price: 3499, mrp: 4999, category: "beauty", rating: 4.9, reviews: 120, tag: "Premium", stock: 5, images: ["https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=800&q=80"] },
  { id: "p9", name: "Precision Beard Trimmer", price: 1299, mrp: 1899, category: "beauty", rating: 4.5, reviews: 85, stock: 30, images: ["https://images.unsplash.com/photo-1621607512214-68297480165e?w=800&q=80"] },
  
  // Home Gym
  { id: "p10", name: "Adjustable Dumbbell Set", price: 4999, mrp: 6999, category: "home-gym", rating: 4.8, reviews: 450, tag: "Bestseller", stock: 10, images: ["https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80"] },
  { id: "p11", name: "Premium Yoga Mat", price: 999, mrp: 1499, category: "home-gym", rating: 4.7, reviews: 320, stock: 50, images: ["https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=800&q=80"] },
];

export const MOCK_ORDERS = [
  {
    id: "ord_1",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: "DELIVERED",
    total: 3499,
    paymentMethod: "COD",
    paymentStatus: "PAID",
    customerName: "Rahul Sharma",
    shipping: { firstName: "Rahul", lastName: "Sharma", email: "rahul@example.com", address: "123, Park Street", city: "Mumbai", state: "Maharashtra", pinCode: "400001", phone: "9876543210" },
    items: [{ id: "p8", name: "Ionic Hair Dryer Pro", price: 3499, quantity: 1, image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=800&q=80" }]
  },
  {
    id: "ord_2",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: "PROCESSING",
    total: 2398,
    paymentMethod: "COD",
    paymentStatus: "PENDING",
    customerName: "Anita Desai",
    shipping: { firstName: "Anita", lastName: "Desai", email: "anita@example.com", address: "45, Garden Layout", city: "Bangalore", state: "Karnataka", pinCode: "560001", phone: "9876543211" },
    items: [
      { id: "p4", name: "Magnetic Knife Bar", price: 1199, quantity: 2, image: "https://images.unsplash.com/photo-1593504049359-74330189a345?w=800&q=80" }
    ]
  }
];

export const MOCK_USERS = [
  { id: "u1", displayName: "Rahul Sharma", email: "rahul@example.com", createdAt: new Date(Date.now() - 86400000 * 30).toISOString() },
  { id: "u2", displayName: "Anita Desai", email: "anita@example.com", createdAt: new Date(Date.now() - 86400000 * 15).toISOString() },
  { id: "u3", displayName: "Vikram Singh", email: "vikram@example.com", createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
];
