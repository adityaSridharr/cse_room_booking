import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { Room, RoomFilter } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface RoomWithFeatures extends Room {
  features: string[];
}

export function useRooms() {
  return useQuery<RoomWithFeatures[], Error>({
    queryKey: ["/api/rooms"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
}

export function useFilteredRooms(filters: RoomFilter = {}) {
  const queryParams = new URLSearchParams();
  
  if (filters.date) queryParams.append("date", filters.date);
  if (filters.startTime) queryParams.append("startTime", filters.startTime);
  if (filters.endTime) queryParams.append("endTime", filters.endTime);
  if (filters.capacity) queryParams.append("capacity", filters.capacity.toString());
  if (filters.type) queryParams.append("type", filters.type);

  const queryUrl = `/api/rooms/filter?${queryParams.toString()}`;
  
  return useQuery<RoomWithFeatures[], Error>({
    queryKey: [queryUrl],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: Object.keys(filters).length > 0,
  });
}

export function useRoom(id: number | undefined) {
  return useQuery<RoomWithFeatures, Error>({
    queryKey: [`/api/rooms/${id}`],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!id,
  });
}

export function useRoomAvailability(roomId: number, date: string, startTime: string, endTime: string) {
  const queryParams = new URLSearchParams({
    date,
    startTime,
    endTime,
  });

  return useQuery<{ available: boolean }, Error>({
    queryKey: [`/api/rooms/${roomId}/availability?${queryParams.toString()}`],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!roomId && !!date && !!startTime && !!endTime,
  });
}
