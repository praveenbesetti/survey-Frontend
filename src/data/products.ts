export type Product = {
  id: number;
  name: string;
  category: 'Leafy' | 'Root' | 'Gourds' | 'Exotic';
  price: number;
  unit: string;
  emoji: string;
  image: string;
  badge: string | null;
  description: string;
  farmName: string;
};

export const products: Product[] = [
{
  id: 1,
  name: 'Spinach',
  category: 'Leafy',
  price: 25,
  unit: '250g',
  emoji: '🥬',
  image:
  'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=300&fit=crop',
  badge: 'Best Seller',
  description: 'Tender baby spinach leaves, harvested this morning',
  farmName: 'Green Valley Farm'
},
{
  id: 2,
  name: 'Tomato',
  category: 'Exotic',
  price: 30,
  unit: '500g',
  emoji: '🍅',
  image:
  'https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=400&h=300&fit=crop',
  badge: 'Fresh Today',
  description: 'Vine-ripened red tomatoes, perfect sweetness',
  farmName: 'Sunrise Organics'
},
{
  id: 3,
  name: 'Carrot',
  category: 'Root',
  price: 35,
  unit: '500g',
  emoji: '🥕',
  image:
  'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=300&fit=crop',
  badge: null,
  description: 'Crunchy orange carrots, rich in beta-carotene',
  farmName: 'Earth Roots Farm'
},
{
  id: 4,
  name: 'Broccoli',
  category: 'Exotic',
  price: 60,
  unit: '300g',
  emoji: '🥦',
  image:
  'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=300&fit=crop',
  badge: 'Premium',
  description: 'Fresh green broccoli crown, packed with nutrients',
  farmName: 'Highland Greens'
},
{
  id: 5,
  name: 'Onion',
  category: 'Root',
  price: 40,
  unit: '1kg',
  emoji: '🧅',
  image:
  'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&h=300&fit=crop',
  badge: null,
  description: 'Farm-fresh red onions, strong and aromatic',
  farmName: 'Nashik Direct'
},
{
  id: 6,
  name: 'Capsicum',
  category: 'Gourds',
  price: 55,
  unit: '250g',
  emoji: '🫑',
  image:
  'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&h=300&fit=crop',
  badge: 'Fresh Today',
  description: 'Crisp green capsicum, great for stir-fry',
  farmName: 'Poly House Fresh'
},
{
  id: 7,
  name: 'Corn',
  category: 'Exotic',
  price: 20,
  unit: '2 pcs',
  emoji: '🌽',
  image:
  'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=300&fit=crop',
  badge: null,
  description: 'Sweet golden corn, ideal for boiling or grilling',
  farmName: 'Golden Field Farm'
},
{
  id: 8,
  name: 'Cucumber',
  category: 'Gourds',
  price: 25,
  unit: '500g',
  emoji: '🥒',
  image:
  'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400&h=300&fit=crop',
  badge: null,
  description: 'Cool and hydrating cucumbers, freshly picked',
  farmName: 'Cool Greens Co.'
},
{
  id: 9,
  name: 'Lettuce',
  category: 'Leafy',
  price: 45,
  unit: '1 head',
  emoji: '🥗',
  image:
  'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400&h=300&fit=crop',
  badge: 'Organic',
  description: 'Crispy iceberg lettuce, certified organic',
  farmName: 'Pure Earth Farms'
},
{
  id: 10,
  name: 'Radish',
  category: 'Root',
  price: 20,
  unit: '500g',
  emoji: '🌱',
  image:
  'https://images.unsplash.com/photo-1585369348360-5e4e0f7a5e5e?w=400&h=300&fit=crop',
  badge: null,
  description: 'Spicy white radish, great for salads and curries',
  farmName: 'Root & Soil Farm'
},
{
  id: 11,
  name: 'Cabbage',
  category: 'Leafy',
  price: 35,
  unit: '1 pc',
  emoji: '🥬',
  image:
  'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=400&h=300&fit=crop',
  badge: null,
  description: 'Round firm cabbage head, fresh from the field',
  farmName: 'Green Valley Farm'
},
{
  id: 12,
  name: 'Bitter Gourd',
  category: 'Gourds',
  price: 30,
  unit: '500g',
  emoji: '🫛',
  image:
  'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=400&h=300&fit=crop',
  badge: 'Local Farm',
  description: 'Fresh bitter gourd, harvested from local fields',
  farmName: 'Village Fresh Farm'
}];