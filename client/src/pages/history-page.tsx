import { format } from "date-fns";
import AppLayout from "@/components/layout/app-layout";
import { useBookingHistory } from "@/hooks/use-booking";
import { Booking } from "@shared/schema";
import { Loader2, CalendarIcon, Clock, Users, Info, Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HistoryPage() {
  const { data: bookingHistory, isLoading, isError } = useBookingHistory();

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

  const isBookingPast = (date: string) => {
    const bookingDate = new Date(date);
    const today = new Date();
    return bookingDate < today;
  };

  const groupBookingsByMonth = (bookings: Booking[]) => {
    const grouped: { [key: string]: Booking[] } = {};
    
    bookings.forEach((booking) => {
      const monthKey = format(new Date(booking.date), "MMMM yyyy");
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(booking);
    });
    
    // Sort dates within each month
    Object.keys(grouped).forEach((monthKey) => {
      grouped[monthKey].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
    
    // Sort months in reverse chronological order
    return Object.entries(grouped)
      .sort(([monthA], [monthB]) => {
        const dateA = new Date(monthA);
        const dateB = new Date(monthB);
        return dateB.getTime() - dateA.getTime();
      })
      .map(([month, bookings]) => ({
        month,
        bookings,
      }));
  };

  return (
    <AppLayout>
      <div className="container mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Booking History</h2>

        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {isError && (
          <div className="text-center py-8">
            <p className="text-red-500">Error loading booking history. Please try again.</p>
          </div>
        )}

        {!isLoading && !isError && (!bookingHistory || bookingHistory.length === 0) && (
          <div className="text-center py-12 bg-background rounded-lg border border-border">
            <h3 className="text-lg font-medium mb-2">No Booking History</h3>
            <p className="text-gray-500">
              You don't have any past bookings.
            </p>
          </div>
        )}

        {!isLoading &&
          !isError &&
          bookingHistory &&
          bookingHistory.length > 0 &&
          groupBookingsByMonth(bookingHistory).map((group) => (
            <div key={group.month} className="mb-8">
              <h3 className="text-lg font-medium mb-4 border-b pb-2">{group.month}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.bookings.map((booking) => {
                  const { date, time } = formatDateAndTime(booking);
                  
                  return (
                    <Card key={booking.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex flex-col">
                          <div className="bg-primary/5 p-4">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium text-lg">{booking.roomName}</h4>
                              <Badge variant="outline" className="bg-background">
                                {format(new Date(booking.date), "MMM d")}
                              </Badge>
                            </div>
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
                              <div className="flex items-center text-sm text-gray-500">
                                <span>Status: </span>
                                {booking.status === "confirmed" ? (
                                  <span className="ml-1 flex items-center">
                                    <Check className="h-4 w-4 mr-1 text-green-500" />
                                    Completed
                                  </span>
                                ) : (
                                  <span className="ml-1 flex items-center">
                                    <X className="h-4 w-4 mr-1 text-red-500" />
                                    Cancelled
                                  </span>
                                )}
                              </div>
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
