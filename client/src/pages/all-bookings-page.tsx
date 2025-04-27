import { useState } from "react";
import { format } from "date-fns";
import { useAllBookings, BookingFilters } from "@/hooks/use-booking";
import { Booking } from "@shared/schema";
import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Building, Users, Clock, MapPin, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function AllBookingsPage() {
  const [filters, setFilters] = useState<BookingFilters>({});
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [roomType, setRoomType] = useState<string>("");
  const [department, setDepartment] = useState<string>("");

  // Apply filters
  const applyFilters = () => {
    const newFilters: BookingFilters = {};
    if (date) newFilters.date = format(date, "yyyy-MM-dd");
    if (roomType) newFilters.roomType = roomType;
    if (department) newFilters.department = department;
    setFilters(newFilters);
  };

  // Reset filters
  const resetFilters = () => {
    setDate(undefined);
    setRoomType("");
    setDepartment("");
    setFilters({});
  };

  // Fetch all bookings with filters
  const { data: bookings, isLoading, error } = useAllBookings(filters);

  // Format date and time for display
  const formatDateAndTime = (booking: Booking) => {
    const bookingDate = new Date(booking.date);
    return {
      date: format(bookingDate, "EEEE, MMMM do, yyyy"),
      startTime: booking.startTime,
      endTime: booking.endTime
    };
  };

  return (
    <AppLayout>
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">All Bookings</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter bookings by date, room type, or department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Date Filter */}
              <div>
                <label className="text-sm font-medium mb-1 block">Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* Room Type Filter */}
              <div>
                <label className="text-sm font-medium mb-1 block">Room Type</label>
                <Select value={roomType} onValueChange={setRoomType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="classroom">Classroom</SelectItem>
                    <SelectItem value="conference">Conference Room</SelectItem>
                    <SelectItem value="lab">Laboratory</SelectItem>
                    <SelectItem value="auditorium">Auditorium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Department Filter */}
              <div>
                <label className="text-sm font-medium mb-1 block">Department</label>
                <Input 
                  placeholder="Enter department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>
              
              {/* Filter Actions */}
              <div className="flex items-end space-x-2">
                <Button onClick={applyFilters} className="flex-1">Apply Filters</Button>
                <Button variant="outline" onClick={resetFilters}>Reset</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {isLoading ? (
          // Loading state
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex flex-col space-y-3">
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex space-x-2 mt-2">
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          // Error state
          <Card>
            <CardContent className="pt-6">
              <p className="text-destructive">Error loading bookings: {error.message}</p>
            </CardContent>
          </Card>
        ) : (
          // Booking list
          <div className="space-y-4">
            {bookings && bookings.length > 0 ? (
              bookings.map((booking) => {
                const { date, startTime, endTime } = formatDateAndTime(booking);
                return (
                  <Card key={booking.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between flex-wrap gap-4">
                        <div className="space-y-1">
                          <h3 className="text-lg font-medium">Room {booking.roomId}</h3>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <CalendarIcon className="mr-1 h-4 w-4" />
                            <span>{date}</span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="mr-1 h-4 w-4" />
                            <span>{startTime} - {endTime}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <User className="mr-1 h-4 w-4" />
                            <span className="font-medium">Booked by: User {booking.username}</span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Building className="mr-1 h-4 w-4" />
                            <span>Purpose: {booking.purpose}</span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Users className="mr-1 h-4 w-4" />
                            <span>Participants: {booking.attendees}</span>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <Badge variant={booking.status === "confirmed" ? "default" : booking.status === "cancelled" ? "destructive" : "outline"}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No bookings found matching your criteria.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}