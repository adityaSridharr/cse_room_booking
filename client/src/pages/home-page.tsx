import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/app-layout";
import RoomFilters from "@/components/room/room-filters";
import RoomCard from "@/components/room/room-card";
import { RoomFilter } from "@shared/schema";
import { useFilteredRooms } from "@/hooks/use-room";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function HomePage() {
  const [filters, setFilters] = useState<RoomFilter>({});
  const [sortBy, setSortBy] = useState<string>("name");
  const { data: rooms, isLoading, isError } = useFilteredRooms(filters);

  const handleFilterChange = (newFilters: RoomFilter) => {
    setFilters(newFilters);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  // Sort rooms based on selected option
  const sortedRooms = rooms ? [...rooms].sort((a, b) => {
    switch (sortBy) {
      case "capacity":
        return b.capacity - a.capacity;
      case "type":
        return a.type.localeCompare(b.type);
      case "name":
      default:
        return a.name.localeCompare(b.name);
    }
  }) : [];

  return (
    <AppLayout>
      <h2 className="text-2xl font-semibold mb-6">Book a Room</h2>

      {/* Filters & Rooms Container */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Section */}
        <RoomFilters onFilterChange={handleFilterChange} />

        {/* Rooms List */}
        <div className="flex-grow">
          {/* Room Count & Sort */}
          <div className="flex justify-between items-center mb-5">
            <div className="text-sm text-gray-600">
              {isLoading ? (
                "Loading rooms..."
              ) : (
                <span>
                  Showing <span className="font-medium">{sortedRooms.length}</span> available rooms
                </span>
              )}
            </div>
            
            <div className="flex items-center">
              <label className="text-sm mr-2">Sort by:</label>
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="capacity">Capacity</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="text-center py-8">
              <p className="text-red-500">
                Error loading rooms. Please try again.
              </p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && sortedRooms.length === 0 && (
            <div className="text-center py-8 bg-background rounded-lg border border-border">
              <p className="text-gray-500">
                No rooms match your current filters. Try adjusting your search criteria.
              </p>
            </div>
          )}

          {/* Room Grid */}
          {!isLoading && !isError && sortedRooms.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {sortedRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  isAvailable={true}
                  date={filters.date || ""}
                  startTime={filters.startTime || ""}
                  endTime={filters.endTime || ""}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
