import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { RoomFilter } from "@shared/schema";
interface RoomFiltersProps {
  onFilterChange: (filters: RoomFilter) => void;
}
// Function to format time strings


export default function RoomFilters({ onFilterChange }: RoomFiltersProps) {
  // Format hours and minutes into a time string HH:MM:00
  const formatTimeString = (hours: number, minutes: number) => {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
  };
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();
  const [filters, setFilters] = useState<RoomFilter>({
    date: today,
    startTime: formatTimeString(currentHour, currentMinute),
    endTime: formatTimeString(currentHour + 1, currentMinute),
    capacity: 10,
    type: 'all',
  });

  const [capacityValue, setCapacityValue] = useState(50);
  
  // Parse times for the time picker
  const parseTimeString = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    return {
      hours: parseInt(hours, 10),
      minutes: parseInt(minutes, 10)
    };
  };

  const startTimeParsed = parseTimeString(filters.startTime!);
  const endTimeParsed = parseTimeString(filters.endTime!);

  

  // Room type options
  const roomTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'classroom', label: 'Classroom' },
    { value: 'meeting', label: 'Meeting Room' },
    { value: 'lab', label: 'Laboratory' },
    { value: 'conference', label: 'Conference Hall' },
  ];

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, date: e.target.value });
  };

  // const handleStartHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const hours = parseInt(e.target.value, 10);
  //   if (hours >= 0 && hours <= 23) {
  //     const newTime = formatTimeString(hours, startTimeParsed.minutes);
  //     setFilters({ ...filters, startTime: newTime });
  //   }
  // };
  const handleStartHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty value or valid numbers
    if (value === '' || (parseInt(value, 10) >= 0 && parseInt(value, 10) <= 23)) {
      const hours = value === '' ? 0 : parseInt(value, 10);
      const newTime = formatTimeString(hours, startTimeParsed.minutes);
      setFilters({ ...filters, startTime: newTime });
    }
  };

  // const handleStartMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const minutes = parseInt(e.target.value, 10);
  //   if (minutes >= 0 && minutes <= 59) {
  //     const newTime = formatTimeString(startTimeParsed.hours, minutes);
  //     setFilters({ ...filters, startTime: newTime });
  //   }
  // };
  const handleStartMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty value or valid numbers
    if (value === '' || (parseInt(value, 10) >= 0 && parseInt(value, 10) <= 59)) {
      const minutes = value === '' ? 0 : parseInt(value, 10);
      const newTime = formatTimeString(startTimeParsed.hours, minutes);
      setFilters({ ...filters, startTime: newTime });
    }
  };

  // const handleEndHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const hours = parseInt(e.target.value, 10);
  //   if (hours >= 0 && hours <= 23) {
  //     const newTime = formatTimeString(hours, endTimeParsed.minutes);
  //     setFilters({ ...filters, endTime: newTime });
  //   }
  // };
  const handleEndHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty value or valid numbers
    if (value === '' || (parseInt(value, 10) >= 0 && parseInt(value, 10) <= 23)) {
      const hours = value === '' ? 0 : parseInt(value, 10);
      const newTime = formatTimeString(hours, endTimeParsed.minutes);
      setFilters({ ...filters, endTime: newTime });
    }
  };

  // const handleEndMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const minutes = parseInt(e.target.value, 10);
  //   if (minutes >= 0 && minutes <= 59) {
  //     const newTime = formatTimeString(endTimeParsed.hours, minutes);
  //     setFilters({ ...filters, endTime: newTime });
  //   }
  // };
  const handleEndMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty value or valid numbers
    if (value === '' || (parseInt(value, 10) >= 0 && parseInt(value, 10) <= 59)) {
      const minutes = value === '' ? 0 : parseInt(value, 10);
      const newTime = formatTimeString(endTimeParsed.hours, minutes);
      setFilters({ ...filters, endTime: newTime });
    }
  };

  const handleRoomTypeChange = (value: string) => {
    setFilters({ ...filters, type: value });
  };

  const handleCapacityChange = (value: number[]) => {
    setCapacityValue(value[0]);
    setFilters({ ...filters, capacity: value[0] });
  };

  const handleApplyFilters = () => {
    onFilterChange(filters);
  };

  // Apply default filters on first render
  useEffect(() => {
    onFilterChange(filters);
  }, []);

  // Format time for display
  const formatTimeDisplay = (hours: number, minutes: number) => {
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <Card className="lg:w-80">
      <CardContent className="p-5">
        <h3 className="font-semibold text-lg mb-4">Filters</h3>
        
        <div className="mb-4">
          <Label className="block text-sm font-medium mb-2">Date</Label>
          <Input
            type="date"
            className="w-full rounded-lg bg-background p-3"
            value={filters.date}
            onChange={handleDateChange}
            min={today}
          />
        </div>
        
        <div className="mb-4">
          <Label className="block text-sm font-medium mb-2">Start Time</Label>
          <div className="flex items-center bg-background rounded-md border border-input p-2">
            <Clock className="h-4 w-4 text-muted-foreground mr-2" />
            <div className="flex items-center space-x-1">
              <Input 
                type="number" 
                min="00" 
                max="23" 
                value={startTimeParsed.hours}
                onChange={handleStartHourChange}
                className="w-14 text-center p-1" 
              />
              <span className="text-muted-foreground">:</span>
              <Input 
                type="number" 
                min="00" 
                max="59" 
                value={startTimeParsed.minutes}
                onChange={handleStartMinuteChange}
                className="w-14 text-center p-1" 
                step={5}
              />
              <span className="text-muted-foreground ml-1">
                {startTimeParsed.hours >= 12 ? 'PM' : 'AM'}
              </span>
            </div>
            {/* <div className="ml-auto text-xs text-muted-foreground">
              {formatTimeDisplay(startTimeParsed.hours, startTimeParsed.minutes)}
            </div> */}
          </div>
        </div>
        
        <div className="mb-4">
          <Label className="block text-sm font-medium mb-2">End Time</Label>
          <div className="flex items-center bg-background rounded-md border border-input p-2">
            <Clock className="h-4 w-4 text-muted-foreground mr-2" />
            <div className="flex items-center space-x-1">
              <Input 
                type="number" 
                min="00" 
                max="23" 
                value={endTimeParsed.hours}
                onChange={handleEndHourChange}
                className="w-14 text-center p-1" 
              />
              <span className="text-muted-foreground">:</span>
              <Input 
                type="number" 
                min="00" 
                max="59" 
                value={endTimeParsed.minutes}
                onChange={handleEndMinuteChange}
                className="w-14 text-center p-1" 
                step={5}
              />
              <span className="text-muted-foreground ml-1">
                {endTimeParsed.hours >= 12 ? 'PM' : 'AM'}
              </span>
            </div>
            {/* <div className="ml-auto text-xs text-muted-foreground">
              {formatTimeDisplay(endTimeParsed.hours, endTimeParsed.minutes)}
            </div> */}
          </div>
        </div>
        
        <div className="mb-4">
          <Label className="block text-sm font-medium mb-2">Room Type</Label>
          <Select
            value={filters.type}
            onValueChange={handleRoomTypeChange}
          >
            <SelectTrigger className="w-full bg-background">
              <SelectValue placeholder="Select room type" />
            </SelectTrigger>
            <SelectContent>
              {roomTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="mb-6">
          <Label className="block text-sm font-medium mb-2">Capacity</Label>
          <div className="flex items-center">
            <div className="flex-grow">
              <Slider
                value={[capacityValue]}
                min={10}
                max={300}
                step={10}
                onValueChange={handleCapacityChange}
              />
            </div>
            <span className="ml-2 min-w-[40px] text-center">{capacityValue}</span>
          </div>
        </div>
        
        <Button
          className="w-full"
          onClick={handleApplyFilters}
        >
          Apply Filters
        </Button>
      </CardContent>
    </Card>
  );
}