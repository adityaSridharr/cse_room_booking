import nodemailer from "nodemailer";
import { Booking } from "@shared/schema";
import { format } from "date-fns";

// In a production app, you would use actual SMTP credentials
// For this demo, we'll create a mock transporter that logs to console
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.example.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "user@example.com",
    pass: process.env.SMTP_PASS || "password",
  },
});

// Fallback to console logging if email sending fails
const sendMailWithFallback = async (mailOptions: nodemailer.SendMailOptions) => {
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.log("Email sending failed, falling back to console log:");
    console.log("To:", mailOptions.to);
    console.log("Subject:", mailOptions.subject);
    console.log("HTML Content:", mailOptions.html);
    return false;
  }
};

export const sendBookingConfirmation = async (booking: Booking, userEmail: string) => {
  const formattedDate = format(new Date(booking.date), "MMMM dd, yyyy");
  const formattedStartTime = format(new Date(`2000-01-01T${booking.startTime}`), "h:mm a");
  const formattedEndTime = format(new Date(`2000-01-01T${booking.endTime}`), "h:mm a");

  const mailOptions = {
    from: process.env.SMTP_FROM || "roomsystem@iith.ac.in",
    to: userEmail,
    subject: "Room Booking Confirmation - IITH Room Booking System",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
        <div style="background-color: #0A2342; color: white; padding: 15px; text-align: center; border-radius: 5px 5px 0 0;">
          <h2 style="margin: 0;">Room Booking Confirmation</h2>
        </div>
        
        <div style="padding: 20px;">
          <p>Dear User,</p>
          
          <p>Your room booking has been confirmed. Here are the details:</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Room:</strong> ${booking.roomName}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${formattedStartTime} - ${formattedEndTime}</p>
            <p><strong>Purpose:</strong> ${booking.purpose}</p>
            <p><strong>Attendees:</strong> ${booking.attendees}</p>
            <p><strong>Booking ID:</strong> ${booking.id}</p>
          </div>
          
          <p>You can view or cancel this booking from your "My Bookings" section in the IITH Room Booking System.</p>
          
          <p>Thank you for using the IITH Room Booking System.</p>
          
          <p>Best regards,<br>IITH Room Booking System</p>
        </div>
        
        <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 5px 5px;">
          <p>This is an automated message, please do not reply directly to this email.</p>
        </div>
      </div>
    `,
  };

  return sendMailWithFallback(mailOptions);
};

export const sendBookingCancellation = async (booking: Booking, userEmail: string) => {
  const formattedDate = format(new Date(booking.date), "MMMM dd, yyyy");
  const formattedStartTime = format(new Date(`2000-01-01T${booking.startTime}`), "h:mm a");
  const formattedEndTime = format(new Date(`2000-01-01T${booking.endTime}`), "h:mm a");

  const mailOptions = {
    from: process.env.SMTP_FROM || "roomsystem@iith.ac.in",
    to: userEmail,
    subject: "Room Booking Cancellation - IITH Room Booking System",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
        <div style="background-color: #0A2342; color: white; padding: 15px; text-align: center; border-radius: 5px 5px 0 0;">
          <h2 style="margin: 0;">Room Booking Cancellation</h2>
        </div>
        
        <div style="padding: 20px;">
          <p>Dear User,</p>
          
          <p>Your room booking has been cancelled. Here are the details of the cancelled booking:</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Room:</strong> ${booking.roomName}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${formattedStartTime} - ${formattedEndTime}</p>
            <p><strong>Booking ID:</strong> ${booking.id}</p>
          </div>
          
          <p>If you did not cancel this booking or have any questions, please contact the system administrator.</p>
          
          <p>Thank you for using the IITH Room Booking System.</p>
          
          <p>Best regards,<br>IITH Room Booking System</p>
        </div>
        
        <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 5px 5px;">
          <p>This is an automated message, please do not reply directly to this email.</p>
        </div>
      </div>
    `,
  };

  return sendMailWithFallback(mailOptions);
};
