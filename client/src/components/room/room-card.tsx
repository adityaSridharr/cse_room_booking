import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Room } from "@shared/schema";
import BookingModal from "./booking-modal";
import { Badge } from "@/components/ui/badge";

interface RoomWithFeatures extends Room {
  features: string[];
  available?: boolean;
}

interface RoomCardProps {
  room: RoomWithFeatures;
  isAvailable: boolean;
  date: string;
  startTime: string;
  endTime: string;
}

export default function RoomCard({ room, isAvailable, date, startTime, endTime }: RoomCardProps) {
  const [showModal, setShowModal] = useState(false);

  // Room type badge color
  const getBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'classroom':
        return 'bg-secondary';
      case 'meeting':
        return 'bg-accent';
      case 'lab':
        return 'bg-secondary';
      case 'conference':
        return 'bg-primary';
      default:
        return 'bg-secondary';
    }
  };

  // Default image URLs for different room types
  const getDefaultImage = (type: string) => {
    switch (type.toLowerCase()) {
      case 'classroom':
        return "https://images.unsplash.com/photo-1517531662282-8c42d6692d62?auto=format&fit=crop&w=600&h=350";
      case 'meeting':
        return "https://images.unsplash.com/photo-1577412647305-991150c7d163?auto=format&fit=crop&w=600&h=350";
      case 'lab':
        return "https://images.unsplash.com/photo-1496715976403-7e36dc43f17b?auto=format&fit=crop&w=600&h=350";
      case 'conference':
        return "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=600&h=350";
      default:
        return "https://images.unsplash.com/photo-1517531662282-8c42d6692d62?auto=format&fit=crop&w=600&h=350";
    }
  };

  return (
    <>
      <Card className="overflow-hidden flex flex-col h-full">
        <div className="relative">
          <img 
            src={room.imageUrl || getDefaultImage(room.type)} 
            alt={room.name} 
            className="w-full h-48 object-cover"
          />
          <div className={`absolute top-3 right-3 ${getBadgeColor(room.type)} text-white text-xs font-semibold px-2 py-1 rounded`}>
            {room.type}
          </div>
        </div>
        <CardContent className="p-4 flex-grow">
          <h3 className="font-semibold text-lg">{room.name}</h3>
          <div className="mt-2 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="text-gray-500 w-5 h-5 mr-1"
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
          <div className="mt-1 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="text-gray-500 w-5 h-5 mr-1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
              />
            </svg>
            <span className="text-sm">Features: {room.features?.join(', ') || 'None'}</span>
          </div>
          <div className="mt-3 flex items-center">
            {isAvailable ? (
              <>
                <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                <span className="text-sm font-medium text-green-600">Available</span>
              </>
            ) : (
              <>
                <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                <span className="text-sm font-medium text-red-600">Unavailable</span>
              </>
            )}
          </div>
        </CardContent>
        <CardFooter className="px-4 pb-4">
          {isAvailable ? (
            <Button 
              className="w-full bg-secondary hover:bg-opacity-90 text-white"
              onClick={() => setShowModal(true)}
            >
              Book Room
            </Button>
          ) : (
            <Button 
              className="w-full"
              variant="outline"
              disabled
            >
              Unavailable
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Booking Modal */}
      {showModal && (
        <BookingModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          room={room}
          date={date}
          startTime={startTime}
          endTime={endTime}
        />
      )}
    </>
  );
}
