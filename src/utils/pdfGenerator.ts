import { jsPDF } from 'jspdf';
import { RideBooking, LogisticsBooking, DigitalSlip } from '../types';

export const generateBookingReceiptPdf = (booking: RideBooking) => {
  const doc = new jsPDF();

  // Company Header
  doc.setFillColor(18, 18, 18);
  doc.rect(0, 0, 210, 36, 'F');

  // Orange accent bar
  doc.setFillColor(255, 140, 0);
  doc.rect(0, 36, 210, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('SAWARI SETU (सवारी सेतु)', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 179, 0);
  doc.text('Safar Aasaan, Saath Sabka | Official Booking & Insurance Receipt', 14, 26);
  doc.setTextColor(200, 200, 200);
  doc.text('24x7 Helpline: +91 9450985355 | Email: sawarisetu@gmail.com', 14, 32);

  // Receipt meta
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PASSENGER RIDE RECEIPT', 14, 48);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Booking Ref: ${booking.id}`, 14, 56);
  doc.text(`Date & Time: ${booking.bookingTime}`, 14, 62);
  doc.text(`Start OTP: ${booking.otp}`, 150, 56);
  doc.text(`Payment Status: ${booking.paymentStatus.toUpperCase()}`, 150, 62);

  // Line separator
  doc.setDrawColor(220, 220, 220);
  doc.line(14, 67, 196, 67);

  // Passenger & Vehicle Info Box
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(14, 72, 182, 38, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.text('Passenger Details:', 20, 80);
  doc.text('Vehicle & Driver Details:', 110, 80);

  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${booking.passengerName}`, 20, 88);
  doc.text(`Phone: ${booking.passengerPhone}`, 20, 94);
  doc.text(`Service Mode: ${booking.mode.toUpperCase()}`, 20, 100);

  doc.text(`Vehicle: ${booking.vehicleNumber || 'Assigned Near Pickup'}`, 110, 88);
  doc.text(`Driver: ${booking.driverName || 'Sawari Setu Fleet Partner'}`, 110, 94);
  doc.text(`Driver Contact: ${booking.driverPhone || '+91 9450985355'}`, 110, 100);

  // Route Info
  doc.setFont('helvetica', 'bold');
  doc.text('Route Information:', 14, 120);
  doc.setFont('helvetica', 'normal');
  doc.text(`Pickup Point: ${booking.pickup}`, 20, 128);
  doc.text(`Destination: ${booking.destination}`, 20, 136);
  doc.text(`Estimated Distance: ${booking.distanceKm} km`, 20, 144);

  // Fare Breakdown Table
  doc.setFillColor(235, 238, 242);
  doc.rect(14, 150, 182, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('Description', 20, 157);
  doc.text('Amount (INR)', 160, 157);

  doc.setFont('helvetica', 'normal');
  const baseOrDistance = booking.baseFare ? booking.baseFare : Math.round(booking.totalFare * 0.8);
  doc.text(`Base & Distance Fare (${booking.distanceKm} km)`, 20, 166);
  doc.text(`Rs. ${(booking.totalFare - (booking.weatherSurge || 0) - (booking.nightSurge || 0)).toFixed(2)}`, 160, 166);

  let currentY = 173;
  if (booking.weatherSurge) {
    doc.text('Inclement Weather Surge (+Flat Rs. 200)', 20, currentY);
    doc.text(`Rs. ${booking.weatherSurge.toFixed(2)}`, 160, currentY);
    currentY += 7;
  }

  if (booking.nightSurge) {
    doc.text('Night Hours Transit Surge (+Flat Rs. 200)', 20, currentY);
    doc.text(`Rs. ${booking.nightSurge.toFixed(2)}`, 160, currentY);
    currentY += 7;
  }

  doc.text('Toll Tax (Included on route):', 20, currentY);
  doc.setTextColor(34, 139, 34);
  doc.text('INCLUDED (Rs. 0 separate)', 140, currentY);
  doc.setTextColor(30, 30, 30);
  currentY += 7;

  const is0Percent = booking.isInitial6Months !== false;
  doc.setFontSize(8.5);
  doc.setTextColor(100, 100, 100);
  doc.text(
    is0Percent
      ? 'Commission Policy: 0% Platform Margin (100% of ride fare goes directly to driver)'
      : 'Commission Policy: Standard 15% Platform Deduction, 85% Driver Share',
    20,
    currentY
  );
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  currentY += 8;

  doc.setDrawColor(255, 140, 0);
  doc.setLineWidth(0.5);
  doc.line(14, currentY, 196, currentY);
  currentY += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL FARE PAYABLE (All Inclusive):', 20, currentY);
  doc.text(`Rs. ${booking.totalFare.toFixed(2)}`, 160, currentY);

  // Safety & Legal Compliance Notice
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(
    'Legal & Safety Policy: Every passenger ride is covered by Sawari Setu accidental transit protection.',
    14,
    220
  );
  doc.text(
    'For any mid-ride assistance or safety alert, dial SOS in app or emergency police 112 / helpline 9450985355.',
    14,
    226
  );
  doc.text(
    'Sawari Setu Private Limited | Regd. Office: Dashmi Ka Bag, Sirsa, Meja, Prayagraj - 212305, UP',
    14,
    232
  );

  // Official Stamp simulation
  doc.setDrawColor(255, 140, 0);
  doc.roundedRect(140, 245, 55, 24, 2, 2, 'D');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 140, 0);
  doc.text('SAWARI SETU VERIFIED', 145, 253);
  doc.setFont('helvetica', 'normal');
  doc.text('Digitally Signed Stamp', 148, 259);
  doc.text('Security ID: SS-VER-9450', 147, 265);

  doc.save(`SawariSetu_Receipt_${booking.id}.pdf`);
};

export const generateLogisticsInvoicePdf = (booking: LogisticsBooking) => {
  const doc = new jsPDF();

  // Header
  doc.setFillColor(18, 18, 18);
  doc.rect(0, 0, 210, 38, 'F');

  doc.setFillColor(255, 140, 0);
  doc.rect(0, 38, 210, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('SAWARI SETU LOGISTICS (माल सेतु)', 14, 18);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 179, 0);
  doc.text('Goods Transport Consignment & Tax Invoice | e-Way Bill Compliant', 14, 26);
  doc.setTextColor(200, 200, 200);
  doc.text('GSTIN: 09AAACS8920K1Z4 | Reg. Office: Dashmi Ka Bag, Sirsa, Meja, Prayagraj 212305 | Helpline: +91 9450985355', 14, 33);

  // Invoice Details
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('FREIGHT TAX INVOICE & LORRY RECEIPT (LR)', 14, 49);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`LR Number: ${booking.lrNumber}`, 14, 57);
  doc.text(`e-Way Bill: ${booking.ewayBillNumber}`, 14, 63);
  doc.text(`Booking Date: ${booking.bookingTime}`, 14, 69);

  doc.text(`Consignment ID: ${booking.id}`, 130, 57);
  doc.text(`Fleet Mode: ${booking.vehicleType.toUpperCase().replace('_', ' ')}`, 130, 63);
  doc.text(`Status: ${booking.status.toUpperCase()}`, 130, 69);

  doc.setDrawColor(210, 210, 210);
  doc.line(14, 73, 196, 73);

  // Consignment Information
  doc.setFillColor(247, 248, 250);
  doc.roundedRect(14, 78, 182, 48, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.text('Consignor / Sender Details:', 20, 86);
  doc.text('Consignment & Carrier Specs:', 110, 86);

  doc.setFont('helvetica', 'normal');
  doc.text(`Sender: ${booking.senderName}`, 20, 94);
  doc.text(`Contact: ${booking.senderPhone}`, 20, 100);
  doc.text(`Origin: ${booking.pickup}`, 20, 106);
  doc.text(`Destination: ${booking.destination}`, 20, 112);
  doc.text(`Distance: ${booking.distanceKm} km`, 20, 118);

  doc.text(`Goods Type: ${booking.goodsDescription}`, 110, 94);
  doc.text(`Category: ${booking.goodsCategory}`, 110, 100);
  doc.text(`Declared Goods Value: Rs. ${booking.goodsValue.toLocaleString('en-IN')}`, 110, 106);
  doc.text(`Vehicle No: ${booking.vehicleNumber || 'UP32-BT-9450'}`, 110, 112);
  doc.text(`Driver Contact: ${booking.driverPhone || '+91 9450985355'}`, 110, 118);

  // Financial Table
  doc.setFillColor(235, 238, 242);
  doc.rect(14, 134, 182, 9, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('Billing Description', 20, 140);
  doc.text('Amount (INR)', 160, 140);

  doc.setFont('helvetica', 'normal');
  doc.text('Base Freight & Mileage Charge', 20, 151);
  doc.text(`Rs. ${booking.baseFreight.toFixed(2)}`, 160, 151);

  doc.text(
    `Transit Comprehensive Insurance (${booking.transitInsuranceOpted ? 'Cover Active' : 'Not Opted'})`,
    20,
    159
  );
  doc.text(`Rs. ${booking.insuranceAmount.toFixed(2)}`, 160, 159);

  doc.text('GST applicable on Road Freight (5% RCM / Forward)', 20, 167);
  doc.text(`Rs. ${booking.gstAmount.toFixed(2)}`, 160, 167);

  doc.setDrawColor(255, 140, 0);
  doc.setLineWidth(0.7);
  doc.line(14, 173, 196, 173);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TOTAL FREIGHT CHARGES (INCL. TAXES):', 20, 182);
  doc.text(`Rs. ${booking.totalAmount.toFixed(2)}`, 160, 182);

  // Legal declaration
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(90, 90, 90);
  doc.text(
    'Terms of Carriage: Goods booked subject to conditions of Carriage by Road Act, 2007.',
    14,
    198
  );
  doc.text(
    'Consignor declares that the shipment contains no contraband, hazardous, or illegal articles under Indian Law.',
    14,
    204
  );
  doc.text(
    'Data Retention: In compliance with statutory laws, this consignment log is preserved for 5 years in Sawari Setu cloud.',
    14,
    210
  );

  // Stamps
  doc.setDrawColor(255, 140, 0);
  doc.roundedRect(20, 225, 75, 28, 2, 2, 'D');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 140, 0);
  doc.text('SAWARI SETU DISPATCHED', 24, 234);
  doc.setFont('helvetica', 'normal');
  doc.text('Authorized Freight Hub Office', 24, 241);
  doc.text('Ref: SS-LOG-UP32', 24, 248);

  doc.setDrawColor(50, 50, 50);
  doc.roundedRect(120, 225, 70, 28, 2, 2, 'D');
  doc.setTextColor(50, 50, 50);
  doc.setFont('helvetica', 'bold');
  doc.text('CONSIGNOR SIGNATURE', 124, 234);
  doc.setFont('helvetica', 'normal');
  doc.text('Verified with OTP & e-Way Bill', 124, 241);
  doc.text(`Sender: ${booking.senderName}`, 124, 248);

  doc.save(`SawariSetu_Logistics_Invoice_${booking.lrNumber}.pdf`);
};

export const generateDriverDigitalSlipPdf = (slip: DigitalSlip) => {
  const doc = new jsPDF({
    unit: 'mm',
    format: [105, 160], // Pocket notepad format for drivers
  });

  // Dark header
  doc.setFillColor(18, 18, 18);
  doc.rect(0, 0, 105, 24, 'F');

  doc.setFillColor(255, 140, 0);
  doc.rect(0, 24, 105, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('सवारी सेतु - ड्राइवर पर्ची', 10, 12);

  doc.setFontSize(7.5);
  doc.setTextColor(255, 180, 50);
  doc.setFont('helvetica', 'normal');
  doc.text('Digital Driver Notepad Slip & Stamp', 10, 19);

  // Slip Info
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Slip ID: ${slip.slipId}`, 10, 33);
  doc.setFont('helvetica', 'normal');
  doc.text(`Trip Ref: ${slip.tripId}`, 10, 38);
  doc.text(`Date: ${slip.timestamp}`, 10, 43);

  // Driver details
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(8, 48, 89, 26, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.text(`Driver: ${slip.driverName}`, 12, 54);
  doc.setFont('helvetica', 'normal');
  doc.text(`ID: ${slip.driverId} | Vehicle: ${slip.vehicleNumber}`, 12, 60);
  doc.text(`Distance: ${slip.distanceKm} km | Mode: ${slip.paymentMode}`, 12, 66);
  doc.text(`From: ${slip.pickup.slice(0, 24)}...`, 12, 71);

  // Financial Breakdown
  doc.setFont('helvetica', 'bold');
  doc.text('Financial Settlement:', 10, 82);

  doc.setFont('helvetica', 'normal');
  doc.text('Gross Trip Fare:', 10, 88);
  doc.text(`Rs. ${slip.grossAmount.toFixed(2)}`, 75, 88);

  const commLabel = slip.commissionPercent === 0 
    ? 'Platform Fee (0% Offer/Festival):' 
    : `Platform Commission (${slip.commissionPercent}%):`;

  doc.text(commLabel, 10, 94);
  doc.text(
    slip.platformFee === 0 ? 'Rs. 0.00 (FREE)' : `- Rs. ${slip.platformFee.toFixed(2)}`,
    75,
    94
  );

  if (slip.schemeTitle) {
    doc.setFontSize(6.5);
    doc.setTextColor(255, 140, 0);
    doc.text(`Scheme: ${slip.schemeTitle.slice(0, 32)}`, 10, 98);
    doc.setFontSize(9);
    doc.setTextColor(30, 30, 30);
  }

  doc.setDrawColor(255, 140, 0);
  doc.line(10, 101, 95, 101);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 128, 0);
  const earnLabel = slip.commissionPercent === 0 ? 'DRIVER NET EARNING (100%):' : 'DRIVER NET EARNING:';
  doc.text(earnLabel, 10, 107);
  doc.text(`Rs. ${slip.driverShare.toFixed(2)}`, 75, 107);

  // Digital Stamp Seal
  doc.setDrawColor(255, 140, 0);
  doc.roundedRect(20, 115, 65, 24, 2, 2, 'D');
  doc.setTextColor(255, 140, 0);
  doc.setFontSize(8.5);
  doc.text('★ SAWARI SETU OFFICIAL ★', 23, 122);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Settlement Approved & Recorded', 25, 128);
  doc.text(`Auth Seal: ${slip.stampSignature}`, 27, 134);

  doc.setTextColor(120, 120, 120);
  doc.setFontSize(6.5);
  doc.text('Helpline: 9450985355 | sawarisetu@gmail.com', 15, 148);

  doc.save(`Driver_Slip_${slip.slipId}.pdf`);
};
