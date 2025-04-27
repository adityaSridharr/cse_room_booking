import { useState } from "react";
import { format } from "date-fns";
import AppLayout from "@/components/layout/app-layout";
import { useBookings, useCancelBooking } from "@/hooks/use-booking";
import { Booking } from "@shared/schema";
import { Loader2, CalendarIcon, Clock, Users, Info, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function BookingsPage() {
  const { data: bookings, isLoading, isError } = useBookings();
  const cancelBookingMutation = useCancelBooking();
  const [cancelBookingId, setCancelBookingId] = useState<number | null>(null);

  const handleCancelBooking = (bookingId: number) => {
    setCancelBookingId(bookingId);
  };

  const confirmCancelBooking = () => {
    if (cancelBookingId) {
      cancelBookingMutation.mutate(cancelBookingId);
      setCancelBookingId(null);
    }
  };

  const formatDateAndTime = (booking: Booking) => {
    const date = new Date(booking.date);
    const formattedDate = format(date, "EEEE, MMMM d, yyyy");
    
    const startTime = format(new Date(`2000-01-01T${booking.startTime}`), "h:mm a");
    const endTime = format(new Date(`2000-01-01T${booking.endTime}`), "h:mm a");
    
    return {
      date: formattedDate,
      time: `${startTime} - ${endTime}`,
    };
  };

  const groupBookingsByDate = (bookings: Booking[]) => {
    const grouped: { [key: string]: Booking[] } = {};
    
    bookings.forEach((booking) => {
      const dateKey = booking.date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(booking);
    });
    
    // Sort dates
    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
      .map(([date, bookings]) => ({
        date,
        bookings,
      }));
  };

  return (
    <AppLayout>
      <div className="container mx-auto">
        <h2 className="text-2xl font-semibold mb-6">My Bookings</h2>

        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {isError && (
          <div className="text-center py-8">
            <p className="text-red-500">Error loading bookings. Please try again.</p>
          </div>
        )}

        {!isLoading && !isError && (!bookings || bookings.length === 0) && (
          <div className="text-center py-12 bg-background rounded-lg border border-border">
            <h3 className="text-lg font-medium mb-2">No Upcoming Bookings</h3>
            <p className="text-gray-500 mb-6">
              You don't have any upcoming room bookings.
            </p>
            <Button href="/" asChild>
              <a>Book a Room</a>
            </Button>
          </div>
        )}

        {!isLoading &&
          !isError &&
          bookings &&
          bookings.length > 0 &&
          groupBookingsByDate(bookings).map((group) => (
            <div key={group.date} className="mb-8">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5 text-primary" />
                {format(new Date(group.date), "EEEE, MMMM d, yyyy")}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.bookings.map((booking) => {
                  const { time } = formatDateAndTime(booking);
                  
                  return (
                    <Card key={booking.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex flex-col">
                          <div className="bg-primary/10 p-4">
                            <h4 className="font-medium text-lg">{booking.roomName}</h4>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <Clock className="mr-1 h-4 w-4" />
                              <span>{time}</span>
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <div className="flex items-start mb-2">
                              <Info className="mr-2 h-4 w-4 text-gray-500 mt-1" />
                              <div>
                                <p className="text-sm font-medium">Purpose</p>
                                <p className="text-sm text-gray-600">{booking.purpose}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start">
                              <Users className="mr-2 h-4 w-4 text-gray-500 mt-1" />
                              <div>
                                <p className="text-sm font-medium">Attendees</p>
                                <p className="text-sm text-gray-600">{booking.attendees} people</p>
                              </div>
                            </div>
                            
                            <div className="mt-4 flex justify-end">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    className="flex items-center"
                                    onClick={() => handleCancelBooking(booking.id)}
                                  >
                                    <X className="mr-1 h-4 w-4" />
                                    Cancel Booking
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to cancel this booking? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>No, keep booking</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={confirmCancelBooking}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Yes, cancel booking
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
      </div>
    </AppLayout>
  );
}
