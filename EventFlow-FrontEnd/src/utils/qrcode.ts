/**
 * Generate QR Code for event check-in
 * Uses qrcode.react library (would need to be installed)
 * For now, uses a simple data URL approach
 */
export function generateQRCodeURL(eventId: string): string {
  const eventURL = `${window.location.origin}/events/${eventId}/checkin`;

  // For production, use a proper QR code library like qrcode.react or qrcode
  // This is a placeholder that generates a URL to an external QR code API
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(eventURL)}`;
}

export function downloadQRCode(eventId: string, eventTitle: string) {
  const qrURL = generateQRCodeURL(eventId);

  const link = document.createElement('a');
  link.href = qrURL;
  link.download = `qrcode-${eventTitle.replace(/\s+/g, '-').toLowerCase()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
