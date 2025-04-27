import { db } from './db';
import { rooms, features, roomFeatures } from '@shared/schema';

async function seed() {
  console.log('Seeding database...');

  // Add rooms
  const roomsData = [
    { name: 'LH 102', building: 'Academic Block A, First Floor', capacity: 150, type: 'classroom', image_url: 'https://images.unsplash.com/photo-1517164850305-99a3e65bb47e' },
    { name: 'Conference Room 1', building: 'Administration Building, Ground Floor', capacity: 30, type: 'conference', image_url: 'https://images.unsplash.com/photo-1573167507387-6b4b98cb7c13' },
    { name: 'Lab 304', building: 'Academic Block B, Third Floor', capacity: 60, type: 'lab', image_url: 'https://images.unsplash.com/photo-1581092919535-605f55165fe0' },
    { name: 'Meeting Room 2A', building: 'Academic Block C, Second Floor', capacity: 15, type: 'meeting', image_url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2' },
    { name: 'LH 201', building: 'Academic Block A, Second Floor', capacity: 200, type: 'classroom', image_url: 'https://images.unsplash.com/photo-1508014924734-d75124b0f402' },
    { name: 'Research Lab 101', building: 'Research Complex, First Floor', capacity: 40, type: 'lab', image_url: 'https://images.unsplash.com/photo-1581094794329-c8112c4053a9' }
  ];
  
  // Insert rooms and collect their IDs
  const insertedRooms = await Promise.all(
    roomsData.map(room => db.insert(rooms).values(room).returning())
  );
  const roomIds = insertedRooms.map(room => room[0].id);
  
  // Add features
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
  const existingFeatures = await db.select().from(features);
  const existingFeatureNames = new Set(existingFeatures.map(f => f.name));
  
  const newFeatures = featuresData.filter(f => !existingFeatureNames.has(f.name));
  
  let featureIds = [];
  
  if (newFeatures.length > 0) {
    const insertedFeatures = await Promise.all(
      newFeatures.map(feature => db.insert(features).values(feature).returning())
    );
    const newFeatureIds = insertedFeatures.map(feature => feature[0].id);
    featureIds = [...existingFeatures.map(f => f.id), ...newFeatureIds];
  } else {
    featureIds = existingFeatures.map(f => f.id);
  }
  
  // Room feature associations
  // First clear existing associations to prevent duplicates
  await db.delete(roomFeatures);

  // ---------------------
  // // Insert features and collect their IDs
  // const insertedFeatures = await Promise.all(
  //   featuresData.map(feature => db.insert(features).values(feature).returning())
  // );
  // const featureIds = insertedFeatures.map(feature => feature[0].id);
  // ---------------------
  
  // Room feature associations
  const roomFeaturesData = [
    // LH 102
    { roomId: roomIds[0], featureId: featureIds[0] }, // Projector
    { roomId: roomIds[0], featureId: featureIds[1] }, // Whiteboard
    { roomId: roomIds[0], featureId: featureIds[2] }, // AC
    { roomId: roomIds[0], featureId: featureIds[6] }, // Wi-Fi
    { roomId: roomIds[0], featureId: featureIds[7] }, // Podium
    
    // Conference Room 1
    { roomId: roomIds[1], featureId: featureIds[1] }, // Whiteboard
    { roomId: roomIds[1], featureId: featureIds[2] }, // AC
    { roomId: roomIds[1], featureId: featureIds[3] }, // Video Conferencing
    { roomId: roomIds[1], featureId: featureIds[6] }, // Wi-Fi
    
    // Lab 304
    { roomId: roomIds[2], featureId: featureIds[2] }, // AC
    { roomId: roomIds[2], featureId: featureIds[4] }, // Smart Board
    { roomId: roomIds[2], featureId: featureIds[5] }, // Computer Workstations
    { roomId: roomIds[2], featureId: featureIds[6] }, // Wi-Fi
    
    // Meeting Room 2A
    { roomId: roomIds[3], featureId: featureIds[1] }, // Whiteboard
    { roomId: roomIds[3], featureId: featureIds[2] }, // AC
    { roomId: roomIds[3], featureId: featureIds[3] }, // Video Conferencing
    { roomId: roomIds[3], featureId: featureIds[6] }, // Wi-Fi
    
    // LH 201
    { roomId: roomIds[4], featureId: featureIds[0] }, // Projector
    { roomId: roomIds[4], featureId: featureIds[1] }, // Whiteboard
    { roomId: roomIds[4], featureId: featureIds[2] }, // AC
    { roomId: roomIds[4], featureId: featureIds[4] }, // Smart Board
    { roomId: roomIds[4], featureId: featureIds[6] }, // Wi-Fi
    { roomId: roomIds[4], featureId: featureIds[7] }, // Podium
    { roomId: roomIds[4], featureId: featureIds[8] }, // Wheelchair Accessible
    
    // Research Lab 101
    { roomId: roomIds[5], featureId: featureIds[2] }, // AC
    { roomId: roomIds[5], featureId: featureIds[5] }, // Computer Workstations
    { roomId: roomIds[5], featureId: featureIds[6] }, // Wi-Fi
    { roomId: roomIds[5], featureId: featureIds[8] }  // Wheelchair Accessible
  ];
  
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