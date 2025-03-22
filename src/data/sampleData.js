// Sample data for ButterflyBlue Creations Dashboard

export const designData = [
  { id: 'D001', name: 'Warrior Spirit', scripture: 'Ephesians 6:11', status: 'active', uniquenessScore: 85, lastUsed: '2023-10-15', collection: 'Armor of God' },
  { id: 'D002', name: 'Shield of Faith', scripture: 'Ephesians 6:16', status: 'active', uniquenessScore: 92, lastUsed: '2023-11-02', collection: 'Armor of God' },
  { id: 'D003', name: 'Sword of Truth', scripture: 'Ephesians 6:17', status: 'in-development', uniquenessScore: 78, lastUsed: 'N/A', collection: 'Armor of God' },
  { id: 'D004', name: 'Lion Heart', scripture: 'Proverbs 28:1', status: 'needs-review', uniquenessScore: 65, lastUsed: '2023-09-20', collection: 'Courage' },
  { id: 'D005', name: 'Mountain Mover', scripture: 'Matthew 17:20', status: 'active', uniquenessScore: 88, lastUsed: '2023-10-30', collection: 'Faith' },
  { id: 'D006', name: 'Steadfast', scripture: '1 Corinthians 15:58', status: 'active', uniquenessScore: 79, lastUsed: '2023-11-10', collection: 'Perseverance' },
];

export const scriptureData = [
  { id: 'S001', reference: 'Ephesians 6:11', text: 'Put on the full armor of God, so that you can take your stand against the devil\'s schemes.', usageCount: 3, lastUsed: '2023-10-15', status: 'verified', context: 'Spiritual warfare' },
  { id: 'S002', reference: 'Ephesians 6:16', text: 'In addition to all this, take up the shield of faith, with which you can extinguish all the flaming arrows of the evil one.', usageCount: 2, lastUsed: '2023-11-02', status: 'verified', context: 'Faith protection' },
  { id: 'S003', reference: 'Ephesians 6:17', text: 'Take the helmet of salvation and the sword of the Spirit, which is the word of God.', usageCount: 1, lastUsed: '2023-10-01', status: 'verified', context: 'Spiritual weapons' },
  { id: 'S004', reference: 'Proverbs 28:1', text: 'The wicked flee though no one pursues, but the righteous are as bold as a lion.', usageCount: 4, lastUsed: '2023-09-20', status: 'needs-review', context: 'Courage' },
  { id: 'S005', reference: 'Matthew 17:20', text: 'Truly I tell you, if you have faith as small as a mustard seed, you can say to this mountain, "Move from here to there," and it will move. Nothing will be impossible for you.', usageCount: 2, lastUsed: '2023-10-30', status: 'verified', context: 'Faith power' },
];

export const collectionData = [
  { id: 'C001', name: 'Armor of God', theme: 'Spiritual Warfare', designCount: 3, status: 'active', launchDate: '2023-12-01' },
  { id: 'C002', name: 'Courage', theme: 'Boldness', designCount: 1, status: 'in-development', launchDate: '2024-01-15' },
  { id: 'C003', name: 'Faith', theme: 'Belief', designCount: 1, status: 'active', launchDate: '2023-11-01' },
  { id: 'C004', name: 'Perseverance', theme: 'Endurance', designCount: 1, status: 'active', launchDate: '2023-10-15' },
];

export const financialData = [
  { month: 'Aug', revenue: 1200, expenses: 800, profit: 400 },
  { month: 'Sep', revenue: 1500, expenses: 850, profit: 650 },
  { month: 'Oct', revenue: 1800, expenses: 900, profit: 900 },
  { month: 'Nov', revenue: 2200, expenses: 950, profit: 1250 },
];

export const productData = [
  { id: 'P001', name: 'Warrior Spirit T-Shirt', price: 24.99, cost: 12.50, margin: 12.49, sales: 15 },
  { id: 'P002', name: 'Shield of Faith Hoodie', price: 39.99, cost: 22.00, margin: 17.99, sales: 8 },
  { id: 'P003', name: 'Lion Heart Mug', price: 14.99, cost: 5.25, margin: 9.74, sales: 22 },
  { id: 'P004', name: 'Mountain Mover Cap', price: 19.99, cost: 8.75, margin: 11.24, sales: 12 },
];

export const statusColors = {
  'active': '#4CAF50',
  'in-development': '#FFC107',
  'needs-review': '#F44336'
};