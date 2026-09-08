const generateBookingId = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `VMS-${year}-${random}`;
};

const generateInvoiceNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `INV-${year}-${random}`;
};

const generateTransactionId = () => {
  const random = Math.floor(10000000 + Math.random() * 90000000);
  return `TXN-${random}`;
};

module.exports = {
  generateBookingId,
  generateInvoiceNumber,
  generateTransactionId
};
