import { pgTable, text, serial, integer, boolean, timestamp, date, time, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(), // Email address
  password: text("password").notNull(),
  name: text("name"),
  department: text("department"),
});

export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  department: true,
});

// Room schema
export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  building: text("building").notNull(),
  type: text("type").notNull(), // classroom, meeting, lab, conference
  capacity: integer("capacity").notNull(),
  imageUrl: text("image_url"),
});

export const roomsRelations = relations(rooms, ({ many }) => ({
  bookings: many(bookings),
  features: many(roomFeatures),
}));

export const insertRoomSchema = createInsertSchema(rooms);

// Room features schema
export const features = pgTable("features", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const insertFeatureSchema = createInsertSchema(features);

// Room-Feature relationship schema
export const roomFeatures = pgTable("room_features", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull().references(() => rooms.id, { onDelete: "cascade" }),
  featureId: integer("feature_id").notNull().references(() => features.id, { onDelete: "cascade" }),
});

export const roomFeaturesRelations = relations(roomFeatures, ({ one }) => ({
  room: one(rooms, {
    fields: [roomFeatures.roomId],
    references: [rooms.id],
  }),
  feature: one(features, {
    fields: [roomFeatures.featureId],
    references: [features.id],
  }),
}));

export const insertRoomFeatureSchema = createInsertSchema(roomFeatures);

// Booking schema
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  roomId: integer("room_id").notNull().references(() => rooms.id, { onDelete: "cascade" }),
  roomName: text("room_name").notNull(), // Denormalized for convenience
  date: date("date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  purpose: text("purpose").notNull(),
  attendees: integer("attendees").notNull(),
  status: text("status").default("confirmed").notNull(), // 'confirmed', 'cancelled', 'pending'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  room: one(rooms, {
    fields: [bookings.roomId],
    references: [rooms.id],
  }),
}));

export const bookingSchema = createInsertSchema(bookings);

// Room filter schema for search/filtering
export const roomFilterSchema = z.object({
  date: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  capacity: z.number().optional(),
  type: z.string().optional(), // 'all', 'classroom', 'meeting', 'lab', 'conference'
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Room = typeof rooms.$inferSelect;
export type InsertRoom = z.infer<typeof insertRoomSchema>;

export type Feature = typeof features.$inferSelect;
export type InsertFeature = z.infer<typeof insertFeatureSchema>;

export type RoomFeature = typeof roomFeatures.$inferSelect;
export type InsertRoomFeature = z.infer<typeof insertRoomFeatureSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof bookingSchema>;

export type RoomFilter = z.infer<typeof roomFilterSchema>;
