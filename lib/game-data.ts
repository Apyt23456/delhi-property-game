// Delhi Monopoly Game Data - All 40 tiles with Delhi-themed properties

export type TileType = 
  | 'go' 
  | 'property' 
  | 'community-chest' 
  | 'chance' 
  | 'income-tax' 
  | 'luxury-tax' 
  | 'railway' 
  | 'utility' 
  | 'jail' 
  | 'free-parking' 
  | 'go-to-jail';

export type PropertyGroup = 
  | 'brown' 
  | 'light-blue' 
  | 'pink' 
  | 'orange' 
  | 'red' 
  | 'yellow' 
  | 'green' 
  | 'dark-blue'
  | 'railway'
  | 'utility';

export interface PropertyData {
  name: string;
  price: number;
  rent: number[];
  houseCost: number;
  mortgage: number;
  group: PropertyGroup;
}

export interface Tile {
  id: number;
  type: TileType;
  name: string;
  property?: PropertyData;
}

// Standard Monopoly tile order with Delhi-themed names
export const TILES: Tile[] = [
  // Bottom row (right to left when looking at board)
  { id: 0, type: 'go', name: 'GO' },
  { 
    id: 1, type: 'property', name: 'Paharganj',
    property: { name: 'Paharganj', price: 60, rent: [2, 10, 30, 90, 160, 250], houseCost: 50, mortgage: 30, group: 'brown' }
  },
  { id: 2, type: 'community-chest', name: 'Community Chest' },
  { 
    id: 3, type: 'property', name: 'Karol Bagh',
    property: { name: 'Karol Bagh', price: 60, rent: [4, 20, 60, 180, 320, 450], houseCost: 50, mortgage: 30, group: 'brown' }
  },
  { id: 4, type: 'income-tax', name: 'Income Tax' },
  { 
    id: 5, type: 'railway', name: 'New Delhi Railway',
    property: { name: 'New Delhi Railway', price: 200, rent: [25, 50, 100, 200], houseCost: 0, mortgage: 100, group: 'railway' }
  },
  { 
    id: 6, type: 'property', name: 'Lajpat Nagar',
    property: { name: 'Lajpat Nagar', price: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50, mortgage: 50, group: 'light-blue' }
  },
  { id: 7, type: 'chance', name: 'Chance' },
  { 
    id: 8, type: 'property', name: 'Sarojini Nagar',
    property: { name: 'Sarojini Nagar', price: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50, mortgage: 50, group: 'light-blue' }
  },
  { 
    id: 9, type: 'property', name: 'Janpath',
    property: { name: 'Janpath', price: 120, rent: [8, 40, 100, 300, 450, 600], houseCost: 50, mortgage: 60, group: 'light-blue' }
  },
  
  // Left column (bottom to top)
  { id: 10, type: 'jail', name: 'Jail' },
  { 
    id: 11, type: 'property', name: 'Nehru Place',
    property: { name: 'Nehru Place', price: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100, mortgage: 70, group: 'pink' }
  },
  { 
    id: 12, type: 'utility', name: 'Delhi Jal Board',
    property: { name: 'Delhi Jal Board', price: 150, rent: [4, 10], houseCost: 0, mortgage: 75, group: 'utility' }
  },
  { 
    id: 13, type: 'property', name: 'South Extension',
    property: { name: 'South Extension', price: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100, mortgage: 70, group: 'pink' }
  },
  { 
    id: 14, type: 'property', name: 'Greater Kailash',
    property: { name: 'Greater Kailash', price: 160, rent: [12, 60, 180, 500, 700, 900], houseCost: 100, mortgage: 80, group: 'pink' }
  },
  { 
    id: 15, type: 'railway', name: 'Old Delhi Railway',
    property: { name: 'Old Delhi Railway', price: 200, rent: [25, 50, 100, 200], houseCost: 0, mortgage: 100, group: 'railway' }
  },
  { 
    id: 16, type: 'property', name: 'Rajouri Garden',
    property: { name: 'Rajouri Garden', price: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100, mortgage: 90, group: 'orange' }
  },
  { id: 17, type: 'community-chest', name: 'Community Chest' },
  { 
    id: 18, type: 'property', name: 'Punjabi Bagh',
    property: { name: 'Punjabi Bagh', price: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100, mortgage: 90, group: 'orange' }
  },
  { 
    id: 19, type: 'property', name: 'Pitampura',
    property: { name: 'Pitampura', price: 200, rent: [16, 80, 220, 600, 800, 1000], houseCost: 100, mortgage: 100, group: 'orange' }
  },
  
  // Top row (left to right)
  { id: 20, type: 'free-parking', name: 'Free Parking' },
  { 
    id: 21, type: 'property', name: 'Dwarka',
    property: { name: 'Dwarka', price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150, mortgage: 110, group: 'red' }
  },
  { id: 22, type: 'chance', name: 'Chance' },
  { 
    id: 23, type: 'property', name: 'Vasant Kunj',
    property: { name: 'Vasant Kunj', price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150, mortgage: 110, group: 'red' }
  },
  { 
    id: 24, type: 'property', name: 'Hauz Khas',
    property: { name: 'Hauz Khas', price: 240, rent: [20, 100, 300, 750, 925, 1100], houseCost: 150, mortgage: 120, group: 'red' }
  },
  { 
    id: 25, type: 'railway', name: 'Hazrat Nizamuddin',
    property: { name: 'Hazrat Nizamuddin', price: 200, rent: [25, 50, 100, 200], houseCost: 0, mortgage: 100, group: 'railway' }
  },
  { 
    id: 26, type: 'property', name: 'Defence Colony',
    property: { name: 'Defence Colony', price: 260, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150, mortgage: 130, group: 'yellow' }
  },
  { 
    id: 27, type: 'utility', name: 'BSES Power',
    property: { name: 'BSES Power', price: 150, rent: [4, 10], houseCost: 0, mortgage: 75, group: 'utility' }
  },
  { 
    id: 28, type: 'property', name: 'Jor Bagh',
    property: { name: 'Jor Bagh', price: 260, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150, mortgage: 130, group: 'yellow' }
  },
  { 
    id: 29, type: 'property', name: 'Lodhi Colony',
    property: { name: 'Lodhi Colony', price: 280, rent: [24, 120, 360, 850, 1025, 1200], houseCost: 150, mortgage: 140, group: 'yellow' }
  },
  
  // Right column (top to bottom)
  { id: 30, type: 'go-to-jail', name: 'Go To Jail' },
  { 
    id: 31, type: 'property', name: 'Golf Links',
    property: { name: 'Golf Links', price: 300, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200, mortgage: 150, group: 'green' }
  },
  { id: 32, type: 'community-chest', name: 'Community Chest' },
  { 
    id: 33, type: 'property', name: 'Sundar Nagar',
    property: { name: 'Sundar Nagar', price: 300, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200, mortgage: 150, group: 'green' }
  },
  { 
    id: 34, type: 'railway', name: 'Anand Vihar',
    property: { name: 'Anand Vihar', price: 200, rent: [25, 50, 100, 200], houseCost: 0, mortgage: 100, group: 'railway' }
  },
  { id: 35, type: 'chance', name: 'Chance' },
  { 
    id: 36, type: 'property', name: 'Prithviraj Road',
    property: { name: 'Prithviraj Road', price: 350, rent: [35, 175, 500, 1100, 1300, 1500], houseCost: 200, mortgage: 175, group: 'green' }
  },
  { id: 37, type: 'luxury-tax', name: 'Luxury Tax' },
  { 
    id: 38, type: 'property', name: 'Lutyens Delhi',
    property: { name: 'Lutyens Delhi', price: 400, rent: [50, 200, 600, 1400, 1700, 2000], houseCost: 200, mortgage: 200, group: 'dark-blue' }
  },
  { 
    id: 39, type: 'property', name: 'Rashtrapati Bhavan',
    property: { name: 'Rashtrapati Bhavan', price: 400, rent: [50, 200, 600, 1400, 1700, 2000], houseCost: 200, mortgage: 200, group: 'dark-blue' }
  },
];

// Property group colors matching classic Monopoly
export const GROUP_COLORS: Record<PropertyGroup, string> = {
  'brown': '#8B4513',
  'light-blue': '#87CEEB',
  'pink': '#FF69B4',
  'orange': '#FFA500',
  'red': '#FF0000',
  'yellow': '#FFFF00',
  'green': '#228B22',
  'dark-blue': '#00008B',
  'railway': '#000000',
  'utility': '#808080',
};

// Chance Cards
export const CHANCE_CARDS = [
  { text: 'Advance to GO. Collect ₹200.', action: 'move', value: 0 },
  { text: 'Advance to Lutyens Delhi.', action: 'move', value: 38 },
  { text: 'Advance to Hauz Khas. If you pass GO, collect ₹200.', action: 'move', value: 24 },
  { text: 'Advance to New Delhi Railway.', action: 'move', value: 5 },
  { text: 'Bank pays you dividend of ₹50.', action: 'receive', value: 50 },
  { text: 'Get out of Jail free card.', action: 'jail-card', value: 0 },
  { text: 'Go back 3 spaces.', action: 'back', value: 3 },
  { text: 'Go directly to Jail. Do not pass GO.', action: 'jail', value: 0 },
  { text: 'Make general repairs. Pay ₹25 per house, ₹100 per hotel.', action: 'repairs', value: 25 },
  { text: 'Pay poor tax of ₹15.', action: 'pay', value: 15 },
  { text: 'Take a trip to Old Delhi Railway.', action: 'move', value: 15 },
  { text: 'You have been elected Chairman. Pay each player ₹50.', action: 'pay-all', value: 50 },
  { text: 'Your building loan matures. Collect ₹150.', action: 'receive', value: 150 },
  { text: 'You won a crossword competition. Collect ₹100.', action: 'receive', value: 100 },
];

// Community Chest Cards
export const COMMUNITY_CHEST_CARDS = [
  { text: 'Advance to GO. Collect ₹200.', action: 'move', value: 0 },
  { text: 'Bank error in your favor. Collect ₹200.', action: 'receive', value: 200 },
  { text: 'Doctor\'s fees. Pay ₹50.', action: 'pay', value: 50 },
  { text: 'From sale of stock you get ₹50.', action: 'receive', value: 50 },
  { text: 'Get out of Jail free card.', action: 'jail-card', value: 0 },
  { text: 'Go directly to Jail. Do not pass GO.', action: 'jail', value: 0 },
  { text: 'Grand Opera Night. Collect ₹50 from every player.', action: 'receive-all', value: 50 },
  { text: 'Holiday fund matures. Receive ₹100.', action: 'receive', value: 100 },
  { text: 'Income tax refund. Collect ₹20.', action: 'receive', value: 20 },
  { text: 'It\'s your birthday. Collect ₹10 from each player.', action: 'receive-all', value: 10 },
  { text: 'Life insurance matures. Collect ₹100.', action: 'receive', value: 100 },
  { text: 'Hospital fees. Pay ₹100.', action: 'pay', value: 100 },
  { text: 'School fees. Pay ₹50.', action: 'pay', value: 50 },
  { text: 'Receive ₹25 consultancy fee.', action: 'receive', value: 25 },
  { text: 'You inherit ₹100.', action: 'receive', value: 100 },
  { text: 'You have won second prize in a beauty contest. Collect ₹10.', action: 'receive', value: 10 },
];

export const PLAYER_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12'];
export const PLAYER_TOKENS = ['Car', 'Ship', 'Hat', 'Dog'];
