import { users, rooms, bookings, features, roomFeatures, type User, type InsertUser, type Room, type InsertRoom, type Booking, type InsertBooking, type Feature, type InsertFeature, type RoomFeature, type InsertRoomFeature } from "@shared/schema";
import session from "express-session";
import * as connectPgSimple from "connect-pg-simple";
import { eq, and, gte, lte, inArray, sql } from "drizzle-orm";
import { db } from "./db";
import postgres from "postgres";

const PostgresSessionStore = connectPgSimple.default(session);

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Room management
  getRooms(): Promise<Room[]>;
  getRoomById(id: number): Promise<Room | undefined>;
  getRoomsByFilter(filters: RoomFilter): Promise<Room[]>;
  getRoomFeatures(roomId: number): Promise<Feature[]>;
  
  // Booking management
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookingById(id: number): Promise<Booking | undefined>;
  getUserBookings(userId: number): Promise<Booking[]>;
  getUserBookingHistory(userId: number): Promise<Booking[]>;
  getAllBookings(filters: BookingFilters): Promise<Booking[]>;
  cancelBooking(id: number): Promise<Booking | undefined>;
  checkRoomAvailability(roomId: number, date: string, startTime: string, endTime: string): Promise<boolean>;
  
  // Session store
  sessionStore: any; // Using any to avoid TS issues with the session store types
}

export type RoomFilter = {
  date?: string;
  startTime?: string;
  endTime?: string;
  capacity?: number;
  type?: string;
};

export type BookingFilters = {
  date?: string;
  roomType?: string;
  department?: string;
};

export class DatabaseStorage implements IStorage {
  sessionStore: any; // Using any for session store type to avoid TS errors

  constructor() {
    // Create PostgreSQL session store
    this.sessionStore = new PostgresSessionStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true
    });
  }

  // User management
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Room management
  async getRooms(): Promise<Room[]> {
    return db.select().from(rooms);
  }

  async getRoomById(id: number): Promise<Room | undefined> {
    const [room] = await db.select().from(rooms).where(eq(rooms.id, id));
    return room;
  }

  async getRoomsByFilter(filters: RoomFilter): Promise<Room[]> {
    // Build filters dynamically
    const conditions = [];
    
    if (filters.capacity) {
      conditions.push(gte(rooms.capacity, filters.capacity));
    }
    
    if (filters.type && filters.type !== 'all') {
      conditions.push(eq(rooms.type, filters.type));
    }
    
    // Fetch rooms with filters applied
    const roomsList = conditions.length > 0 
      ? await db.select().from(rooms).where(and(...conditions))
      : await db.select().from(rooms);
    
    // If date and time filters are provided, filter out booked rooms
    if (filters.date && filters.startTime && filters.endTime) {
      const bookedRoomIds = await this.getBookedRoomIds(
        filters.date,
        filters.startTime,
        filters.endTime
      );
      
      return roomsList.filter(room => !bookedRoomIds.includes(room.id));
    }
    
    return roomsList;
  }

  private async getBookedRoomIds(
    date: string,
    startTime: string,
    endTime: string
  ): Promise<number[]> {
    const conflictingBookings = await db
      .select({ roomId: bookings.roomId })
      .from(bookings)
      .where(
        and(
          eq(bookings.date, date),
          sql`(
            (${bookings.startTime} < ${endTime} AND ${bookings.endTime} > ${startTime})
          )`,
          // Only consider confirmed bookings
          eq(bookings.status, 'confirmed')
        )
      );
    
    return conflictingBookings.map(booking => booking.roomId);
  }

  async getRoomFeatures(roomId: number): Promise<Feature[]> {
    const featuresJoin = await db
      .select({
        feature: features
      })
      .from(roomFeatures)
      .innerJoin(features, eq(roomFeatures.featureId, features.id))
      .where(eq(roomFeatures.roomId, roomId));
    
    return featuresJoin.map(join => join.feature);
  }

  // Booking management
  async createBooking(booking: InsertBooking): Promise<Booking> {
    // Check if room is available first
    const isAvailable = await this.checkRoomAvailability(
      booking.roomId,
      booking.date,
      booking.startTime,
      booking.endTime
    );
    
    if (!isAvailable) {
      throw new Error("Room is not available for the selected time slot");
    }
    
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async getBookingById(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async getUserBookings(userId: number): Promise<Booking[]> {
    // Get current date in ISO format (YYYY-MM-DD)
    const currentDate = new Date().toISOString().split('T')[0];
    
    return db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.userId, userId),
          gte(bookings.date, currentDate),
          // Only return confirmed bookings for upcoming bookings
          eq(bookings.status, 'confirmed')
        )
      )
      .orderBy(bookings.date, bookings.startTime);
  }

  async getUserBookingHistory(userId: number): Promise<Booking[]> {
    // Get current date in ISO format (YYYY-MM-DD)
    const currentDate = new Date().toISOString().split('T')[0];
    
    return db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.userId, userId),
          lte(bookings.date, currentDate)
          // Include both confirmed and cancelled bookings in history
        )
      )
      .orderBy(bookings.date, bookings.startTime);
  }
  
  async getAllBookings(filters: BookingFilters): Promise<Booking[]> {
    const conditions = [];
    
    // Apply date filter if provided
    if (filters.date) {
      conditions.push(eq(bookings.date, filters.date));
    }
    
    // Join with rooms table if we need to filter by room type
    if (filters.roomType && filters.roomType !== 'all') {
      // For now, use a subquery approach
      const roomsOfType = db
        .select({ id: rooms.id })
        .from(rooms)
        .where(eq(rooms.type, filters.roomType));
      
      const roomIds = await roomsOfType;
      if (roomIds.length > 0) {
        conditions.push(inArray(bookings.roomId, roomIds.map(r => r.id)));
      }
    }
    
    // Unfortunately we can't directly filter by department as it's not in the schema
    // We would need to join with users table if we had department info there
    
    // Get all bookings with filters applied
    return conditions.length > 0
      ? await db.select().from(bookings).where(and(...conditions)).orderBy(bookings.date, bookings.startTime)
      : await db.select().from(bookings).orderBy(bookings.date, bookings.startTime);
  }

  async cancelBooking(id: number): Promise<Booking | undefined> {
    // Instead of deleting, update the status to 'cancelled'
    const [cancelledBooking] = await db
      .update(bookings)
      .set({ status: 'cancelled' })
      .where(eq(bookings.id, id))
      .returning();
    
    return cancelledBooking;
  }

  async checkRoomAvailability(
    roomId: number,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<boolean> {
    const conflictingBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.roomId, roomId),
          eq(bookings.date, date),
          sql`(
            (${bookings.startTime} < ${endTime} AND ${bookings.endTime} > ${startTime})
          )`,
          // Only consider confirmed bookings
          eq(bookings.status, 'confirmed')
        )
      );
    
    return conflictingBookings.length === 0;
  }
}

export const storage = new DatabaseStorage();
