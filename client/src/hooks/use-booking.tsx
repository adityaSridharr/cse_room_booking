import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { Booking, InsertBooking } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export function useBookings() {
  return useQuery<Booking[], Error>({
    queryKey: ["/api/bookings/user"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
}

export function useBookingHistory() {
  return useQuery<Booking[], Error>({
    queryKey: ["/api/bookings/history"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
}

export function useCreateBooking() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (booking: InsertBooking) => {
      const response = await apiRequest("POST", "/api/bookings", booking);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings/user"] });
      toast({
        title: "Booking created",
        description: "Your room has been successfully booked. Check your email for confirmation.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

export function useCancelBooking() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (bookingId: number) => {
      await apiRequest("DELETE", `/api/bookings/${bookingId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings/user"] });
      // Also invalidate all bookings query
      queryClient.invalidateQueries({ queryKey: ["/api/bookings/all"] });
      toast({
        title: "Booking cancelled",
        description: "Your booking has been successfully cancelled.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Cancellation failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

// Get all bookings (for admin view)
export interface BookingFilters {
  date?: string;
  roomType?: string;
  department?: string;
}

export function useAllBookings(filters: BookingFilters = {}) {
  const [filterParams, setFilterParams] = useState<URLSearchParams>(new URLSearchParams());
  
  // Update filter params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.date) params.append('date', filters.date);
    if (filters.roomType) params.append('roomType', filters.roomType);
    if (filters.department) params.append('department', filters.department);
    setFilterParams(params);
  }, [filters]);
  
  return useQuery<Booking[], Error>({
    queryKey: ["/api/bookings/all", filterParams.toString()],
    queryFn: async () => {
      const url = `/api/bookings/all${filterParams.toString() ? `?${filterParams.toString()}` : ''}`;
      const response = await apiRequest("GET", url);
      return await response.json();
    }
  });
}
