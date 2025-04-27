import { useState } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Room, bookingSchema, InsertBooking } from "@shared/schema";
import { useCreateBooking } from "@/hooks/use-booking";
import { useAuth } from "@/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface RoomWithFeatures extends Room {
  features: string[];
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: RoomWithFeatures;
  date: string;
  startTime: string;
  endTime: string;
}

// Create a custom booking form schema
const bookingFormSchema = z.object({
  purpose: z.string().min(3, "Purpose is required and must be at least 3 characters"),
  attendees: z.number({
    required_error: "Number of attendees is required",
    invalid_type_error: "Number of attendees must be a number",
  }).int().min(1, "At least 1 attendee is required").refine(
    (val) => val !== undefined, 
    { message: "Number of attendees is required" }
  ),
  agreeToPolicy: z.boolean().refine((val) => val === true, {
    message: "You must agree to the booking policy",
  }),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

export default function BookingModal({
  isOpen,
  onClose,
  room,
  date,
  startTime,
  endTime,
}: BookingModalProps) {
  const { user } = useAuth();
  const createBookingMutation = useCreateBooking();
  
  // Format date for display
  const formattedDate = format(new Date(date), "MMMM dd, yyyy");
  
  // Format times for display
  const formattedStartTime = format(new Date(`2000-01-01T${startTime}`), "h:mm a");
  const formattedEndTime = format(new Date(`2000-01-01T${endTime}`), "h:mm a");

  // Setup form with react-hook-form and zod validation
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      purpose: "",
      attendees: undefined,
      agreeToPolicy: false,
    },
  });

  const onSubmit = (data: BookingFormValues) => {
    if (!user) return;

    // Prepare booking data
    const bookingData: InsertBooking = {
      userId: user.id,
      username: user.name,
      roomId: room.id,
      roomName: room.name,
      date,
      startTime,
      endTime,
      purpose: data.purpose,
      attendees: data.attendees,
    };

    createBookingMutation.mutate(bookingData, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  // Get default image URLs for different room types
  const getDefaultImage = (type: string) => {
    switch (type.toLowerCase()) {
      case 'classroom':
        return "https://images.unsplash.com/photo-1517531662282-8c42d6692d62?auto=format&fit=crop&w=150&h=150";
      case 'meeting':
        return "https://images.unsplash.com/photo-1577412647305-991150c7d163?auto=format&fit=crop&w=150&h=150";
      case 'lab':
        return "https://images.unsplash.com/photo-1496715976403-7e36dc43f17b?auto=format&fit=crop&w=150&h=150";
      case 'conference':
        return "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=150&h=150";
      default:
        return "https://images.unsplash.com/photo-1517531662282-8c42d6692d62?auto=format&fit=crop&w=150&h=150";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Book a Room</DialogTitle>
        </DialogHeader>
        
        <div className="mb-4">
          <h4 className="font-medium text-lg">{room.name}</h4>
          <p className="text-sm text-gray-600">{room.type}</p>
        </div>
        
        <div className="mb-4 flex items-center">
          <div className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-md overflow-hidden">
            <img
              src={room.imageUrl || getDefaultImage(room.type)}
              alt="Room thumbnail"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="ml-4">
            <div className="flex items-center mb-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-4 h-4 mr-1 text-gray-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span className="text-sm">Capacity: {room.capacity} people</span>
            </div>
            <div className="flex items-center mb-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-4 h-4 mr-1 text-gray-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm">{formattedDate}</span>
            </div>
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-4 h-4 mr-1 text-gray-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm">{formattedStartTime} - {formattedEndTime}</span>
            </div>
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purpose of Booking</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Class, Meeting, Conference" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="attendees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Attendees</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter number of attendees" 
                      min={1} 
                      max={room.capacity}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="agreeToPolicy"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm">
                      I agree to the <a href="#" className="text-secondary hover:underline">booking policy</a>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createBookingMutation.isPending}
              >
                {createBookingMutation.isPending ? "Confirming..." : "Confirm Booking"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
