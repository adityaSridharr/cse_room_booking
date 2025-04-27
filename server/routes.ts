import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { sendBookingConfirmation, sendBookingCancellation } from "./mailer";
import { z } from "zod";
import { bookingSchema, roomFilterSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Room management routes
  app.get("/api/rooms", async (req, res) => {
    try {
      const rooms = await storage.getRooms();
      res.json(rooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      res.status(500).json({ message: "Failed to fetch rooms" });
    }
  });

  app.get("/api/rooms/filter", async (req, res) => {
    try {
      const filterInput = {
        date: req.query.date as string | undefined,
        startTime: req.query.startTime as string | undefined,
        endTime: req.query.endTime as string | undefined,
        capacity: req.query.capacity ? parseInt(req.query.capacity as string) : undefined,
        type: req.query.type as string | undefined,
      };

      // Validate filter inputs
      const parsedFilter = roomFilterSchema.parse(filterInput);
      const rooms = await storage.getRoomsByFilter(parsedFilter);
      
      // Get features for each room
      const roomsWithFeatures = await Promise.all(
        rooms.map(async (room) => {
          const features = await storage.getRoomFeatures(room.id);
          return {
            ...room,
            features: features.map(f => f.name),
          };
        })
      );
      
      res.json(roomsWithFeatures);
    } catch (error) {
      console.error("Error filtering rooms:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid filter parameters", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to filter rooms" });
    }
  });

  app.get("/api/rooms/:id", async (req, res) => {
    try {
      const roomId = parseInt(req.params.id);
      const room = await storage.getRoomById(roomId);
      
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      
      // Get room features
      const features = await storage.getRoomFeatures(roomId);
      
      res.json({
        ...room,
        features: features.map(f => f.name),
      });
    } catch (error) {
      console.error("Error fetching room:", error);
      res.status(500).json({ message: "Failed to fetch room" });
    }
  });

  app.get("/api/rooms/:id/availability", async (req, res) => {
    try {
      const roomId = parseInt(req.params.id);
      const { date, startTime, endTime } = req.query;
      
      if (!date || !startTime || !endTime) {
        return res.status(400).json({ message: "Missing date, startTime, or endTime parameters" });
      }
      
      const isAvailable = await storage.checkRoomAvailability(
        roomId,
        date as string,
        startTime as string,
        endTime as string
      );
      
      res.json({ available: isAvailable });
    } catch (error) {
      console.error("Error checking room availability:", error);
      res.status(500).json({ message: "Failed to check room availability" });
    }
  });

  // Booking management routes
  app.post("/api/bookings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      // Validate booking input
      const bookingInput = {
        ...req.body,
        userId: req.user.id,
      };
      
      const parsedBooking = bookingSchema.parse(bookingInput);
      
      // Check room availability
      const isAvailable = await storage.checkRoomAvailability(
        parsedBooking.roomId,
        parsedBooking.date,
        parsedBooking.startTime,
        parsedBooking.endTime
      );
      
      if (!isAvailable) {
        return res.status(409).json({ message: "Room is not available for the selected time slot" });
      }
      
      // Create booking
      const booking = await storage.createBooking(parsedBooking);
      
      // Send confirmation email
      await sendBookingConfirmation(booking, req.user.username);
      
      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid booking parameters", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.get("/api/bookings/user", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const bookings = await storage.getUserBookings(req.user.id);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get("/api/bookings/history", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const bookings = await storage.getUserBookingHistory(req.user.id);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching booking history:", error);
      res.status(500).json({ message: "Failed to fetch booking history" });
    }
  });

  app.get("/api/bookings/all", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      // Parse filter parameters
      const filters = {
        date: req.query.date as string | undefined,
        roomType: req.query.roomType as string | undefined,
        department: req.query.department as string | undefined,
      };
      
      const allBookings = await storage.getAllBookings(filters);
      res.json(allBookings);
    } catch (error) {
      console.error("Error fetching all bookings:", error);
      res.status(500).json({ message: "Failed to fetch all bookings" });
    }
  });

  app.delete("/api/bookings/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const bookingId = parseInt(req.params.id);
      
      // Verify the booking exists and belongs to the user
      const booking = await storage.getBookingById(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      if (booking.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to cancel this booking" });
      }
      
      // Cancel the booking
      const cancelledBooking = await storage.cancelBooking(bookingId);
      
      if (cancelledBooking) {
        // Send cancellation email
        await sendBookingCancellation(cancelledBooking, req.user.username);
      }
      
      res.json({ success: true, booking: cancelledBooking });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      res.status(500).json({ message: "Failed to cancel booking" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
