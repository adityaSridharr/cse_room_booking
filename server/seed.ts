import { db } from './db';
import { rooms, features, roomFeatures, type Room, type Feature } from '@shared/schema';

async function seed() {
  console.log('Seeding database...');
  
  // Clear existing data first
  console.log('Clearing existing room data...');
  await db.delete(roomFeatures); // Delete associations first due to foreign key constraints
  await db.delete(rooms);        // Then delete the rooms
  
  // Add rooms
  console.log('Adding rooms...');
  const roomsData = [
    { name: 'CS-001: Lecture Hall 1', building: 'CSE Block, Ground Floor', capacity: 200, type: 'classroom', image_url: 'https://images.unsplash.com/photo-1508014924734-d75124b0f402' },
    { name: 'CS-002: Lecture Hall 2', building: 'CSE Block, Ground Floor', capacity: 200, type: 'classroom', image_url: 'https://images.unsplash.com/photo-1508014924734-d75124b0f402' },
    { name: 'CS-003: Lecture Hall 3', building: 'CSE Block, Ground Floor', capacity: 200, type: 'classroom', image_url: 'https://images.unsplash.com/photo-1508014924734-d75124b0f402' },
    { name: 'CS-004: Seminar Hall 1', building: 'CSE Block, Ground Floor', capacity: 100, type: 'seminar', image_url: 'https://images.unsplash.com/photo-1573167507387-6b4b98cb7c13' },
    { name: 'CS-005: Data Center', building: 'CSE Block, Ground Floor', capacity: 30, type: 'lab', image_url: 'https://images.unsplash.com/photo-1581092919535-605f55165fe0' },
    { name: 'CS-101: Meeting Room 1', building: 'CSE Block, First Floor', capacity: 20, type: 'meeting', image_url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2' },
    { name: 'CS-105: Conference Room 1', building: 'CSE Block, First Floor', capacity: 30, type: 'conference', image_url: 'https://images.unsplash.com/photo-1573167507387-6b4b98cb7c13' },
    { name: 'CS-107: Research Lab 1', building: 'CSE Block, First Floor', capacity: 40, type: 'lab', image_url: 'https://images.unsplash.com/photo-1581094794329-c8112c4053a9' },
    { name: 'CS-108: Research Lab 2', building: 'CSE Block, First Floor', capacity: 40, type: 'lab', image_url: 'https://images.unsplash.com/photo-1581094794329-c8112c4053a9' },
    { name: 'CS-109: Teaching Lab 1', building: 'CSE Block, First Floor', capacity: 60, type: 'lab', image_url: 'https://images.unsplash.com/photo-1581092919535-605f55165fe0' },
    { name: 'CS-201: Meeting Room 2', building: 'CSE Block, Second Floor', capacity: 20, type: 'meeting', image_url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2' },
    { name: 'CS-202: Conference Room 2', building: 'CSE Block, Second Floor', capacity: 30, type: 'conference', image_url: 'https://images.unsplash.com/photo-1573167507387-6b4b98cb7c13' },
    { name: 'CS-206: Seminar Hall 2', building: 'CSE Block, Second Floor', capacity: 100, type: 'seminar', image_url: 'https://images.unsplash.com/photo-1573167507387-6b4b98cb7c13' },
    { name: 'CS-204: Seminar Hall 3', building: 'CSE Block, Second Floor', capacity: 100, type: 'seminar', image_url: 'https://images.unsplash.com/photo-1573167507387-6b4b98cb7c13' },
    { name: 'CS-207: Research Lab 3', building: 'CSE Block, Second Floor', capacity: 40, type: 'lab', image_url: 'https://images.unsplash.com/photo-1581094794329-c8112c4053a9' },
    { name: 'CS-208: Research Lab 4', building: 'CSE Block, Second Floor', capacity: 40, type: 'lab', image_url: 'https://images.unsplash.com/photo-1581094794329-c8112c4053a9' },
    { name: 'CS-209: Teaching Lab 2', building: 'CSE Block, Second Floor', capacity: 60, type: 'lab', image_url: 'https://images.unsplash.com/photo-1581092919535-605f55165fe0' },
    { name: 'CS-301: Meeting Room 3', building: 'CSE Block, Third Floor', capacity: 20, type: 'meeting', image_url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2' },
    { name: 'CS-317: Research Lab 5', building: 'CSE Block, Third Floor', capacity: 40, type: 'lab', image_url: 'https://images.unsplash.com/photo-1581094794329-c8112c4053a9' },
    { name: 'CS-318: Research Lab 6', building: 'CSE Block, Third Floor', capacity: 40, type: 'lab', image_url: 'https://images.unsplash.com/photo-1581094794329-c8112c4053a9' },
    { name: 'CS-319: Research Lab 7', building: 'CSE Block, Third Floor', capacity: 40, type: 'lab', image_url: 'https://images.unsplash.com/photo-1581094794329-c8112c4053a9' },
    { name: 'CS-320: Research Lab 8', building: 'CSE Block, Third Floor', capacity: 40, type: 'lab', image_url: 'https://images.unsplash.com/photo-1581094794329-c8112c4053a9' },
    { name: 'CS-411: Research Lab 9', building: 'CSE Block, Fourth Floor', capacity: 40, type: 'lab', image_url: 'https://images.unsplash.com/photo-1581094794329-c8112c4053a9' },
    { name: 'CS-412: Research Lab 10', building: 'CSE Block, Fourth Floor', capacity: 40, type: 'lab', image_url: 'https://images.unsplash.com/photo-1581094794329-c8112c4053a9' },
    { name: 'CS-400: Meeting Room 4', building: 'CSE Block, Fourth Floor', capacity: 20, type: 'meeting', image_url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2' },
    { name: 'CS-500: Meeting Room 5', building: 'CSE Block, Fifth Floor', capacity: 20, type: 'meeting', image_url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2' },
    { name: 'CS-600: Meeting Room 6', building: 'CSE Block, Sixth Floor', capacity: 20, type: 'meeting', image_url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2' }
  ];
  
  // Insert rooms and collect their IDs
  const insertedRooms = await Promise.all(
    roomsData.map(room => db.insert(rooms).values(room).returning())
  );
  const roomIds: number[] = insertedRooms.map(room => room[0].id);
  
  // Get or create features
  console.log('Setting up features...');
  const featuresData = [
    { name: 'Projector' },
    { name: 'Whiteboard' },
    { name: 'Air Conditioning' },
    { name: 'Video Conferencing' },
    { name: 'Smart Board' },
    { name: 'Computer Workstations' },
    { name: 'Wi-Fi' },
    { name: 'Podium' },
    { name: 'Wheelchair Accessible' }
  ];
  
  // Check existing features
  const existingFeatures: Feature[] = await db.select().from(features);
  const existingFeatureNames = new Set(existingFeatures.map(f => f.name));
  
  const newFeatures = featuresData.filter(f => !existingFeatureNames.has(f.name));
  
  let featureIds: number[] = [];
  
  if (newFeatures.length > 0) {
    const insertedFeatures = await Promise.all(
      newFeatures.map(feature => db.insert(features).values(feature).returning())
    );
    const newFeatureIds = insertedFeatures.map(feature => feature[0].id);
    featureIds = [...existingFeatures.map(f => f.id), ...newFeatureIds];
  } else {
    featureIds = existingFeatures.map(f => f.id);
  }
  
  // Create room feature associations
  console.log('Adding room-feature associations...');
  const roomFeaturesData: { roomId: number; featureId: number }[] = [];
  
  // Helper function to assign features based on room type
  const assignFeaturesToRoom = (roomId: number, roomType: string, index: number) => {
    // Common features for all rooms
    roomFeaturesData.push(
      { roomId, featureId: featureIds[2] }, // Air Conditioning
      { roomId, featureId: featureIds[6] }  // Wi-Fi
    );
    
    // Features based on room type
    switch(roomType) {
      case 'classroom':
        roomFeaturesData.push(
          { roomId, featureId: featureIds[0] }, // Projector
          { roomId, featureId: featureIds[1] }, // Whiteboard
          { roomId, featureId: featureIds[7] }  // Podium
        );
        break;
      case 'seminar':
        roomFeaturesData.push(
          { roomId, featureId: featureIds[0] }, // Projector
          { roomId, featureId: featureIds[1] }, // Whiteboard
          { roomId, featureId: featureIds[3] }, // Video Conferencing
          { roomId, featureId: featureIds[7] }  // Podium
        );
        break;
      case 'conference':
        roomFeaturesData.push(
          { roomId, featureId: featureIds[1] }, // Whiteboard
          { roomId, featureId: featureIds[3] }, // Video Conferencing
          { roomId, featureId: featureIds[4] }  // Smart Board
        );
        break;
      case 'meeting':
        roomFeaturesData.push(
          { roomId, featureId: featureIds[1] }, // Whiteboard
          { roomId, featureId: featureIds[3] }  // Video Conferencing
        );
        break;
      case 'lab':
        roomFeaturesData.push(
          { roomId, featureId: featureIds[5] }  // Computer Workstations
        );
        
        // Add Smart Board to some labs (odd-indexed)
        if (index % 2 === 1) {
          roomFeaturesData.push(
            { roomId, featureId: featureIds[4] }  // Smart Board
          );
        }
        
        // Make research labs wheelchair accessible
        if (roomsData[index].name.includes('Research Lab')) {
          roomFeaturesData.push(
            { roomId, featureId: featureIds[8] }  // Wheelchair Accessible
          );
        }
        break;
    }
    
    // Make some ground floor rooms wheelchair accessible
    if (roomsData[index].building.includes('Ground Floor') && index % 2 === 0) {
      // Check if this association doesn't already exist
      const hasAccessibility = roomFeaturesData.some(rf => 
        rf.roomId === roomId && rf.featureId === featureIds[8]
      );
      
      if (!hasAccessibility) {
        roomFeaturesData.push(
          { roomId, featureId: featureIds[8] }  // Wheelchair Accessible
        );
      }
    }
  };
  
  // Assign features to all rooms
  roomsData.forEach((room, index) => {
    assignFeaturesToRoom(roomIds[index], room.type, index);
  });
  
  // Insert room-feature associations
  await db.insert(roomFeatures).values(roomFeaturesData);
  
  console.log('Database seeded successfully!');
}

seed()
  .catch(e => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });