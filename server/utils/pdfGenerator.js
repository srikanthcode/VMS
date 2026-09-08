const PDFDocument = require('pdfkit');

const generateInvoice = (invoiceData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(24).font('Helvetica-Bold').text('VEHICLE MANAGEMENT SYSTEM', { align: 'center' });
      doc.fontSize(10).font('Helvetica').text('Professional Vehicle Service Center', { align: 'center' });
      doc.moveDown(0.5);

      // Line separator
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      // Invoice title and number
      doc.fontSize(18).font('Helvetica-Bold').text('INVOICE', { align: 'right' });
      doc.fontSize(10).font('Helvetica');
      doc.text(`Invoice #: ${invoiceData.invoiceNumber}`, { align: 'right' });
      doc.text(`Date: ${new Date(invoiceData.date).toLocaleDateString()}`, { align: 'right' });
      doc.moveDown(0.5);

      // Customer details
      doc.fontSize(12).font('Helvetica-Bold').text('BILL TO:');
      doc.fontSize(10).font('Helvetica');
      doc.text(`Name: ${invoiceData.customer.name}`);
      doc.text(`Email: ${invoiceData.customer.email}`);
      doc.text(`Phone: ${invoiceData.customer.phone}`);
      doc.moveDown(0.5);

      // Vehicle details
      doc.fontSize(12).font('Helvetica-Bold').text('VEHICLE DETAILS:');
      doc.fontSize(10).font('Helvetica');
      doc.text(`Number: ${invoiceData.vehicle.number}`);
      doc.text(`Brand: ${invoiceData.vehicle.brand} ${invoiceData.vehicle.model}`);
      doc.moveDown(0.5);

      // Service details
      doc.fontSize(12).font('Helvetica-Bold').text('SERVICE DETAILS:');
      doc.fontSize(10).font('Helvetica');
      doc.text(`Service: ${invoiceData.service.name}`);
      if (invoiceData.service.description) {
        doc.text(`Description: ${invoiceData.service.description}`);
      }
      doc.moveDown(0.5);

      // Line items header
      doc.fontSize(12).font('Helvetica-Bold').text('ITEMS:');
      doc.moveDown(0.2);

      // Table header
      const tableTop = doc.y;
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Description', 50, tableTop, { width: 300 });
      doc.text('Amount', 400, tableTop, { width: 150, align: 'right' });

      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
      doc.moveDown(0.5);

      // Table rows
      doc.font('Helvetica');
      invoiceData.items.forEach((item, index) => {
        const y = tableTop + 20 + (index * 20);
        doc.text(item.description, 50, y, { width: 300 });
        doc.text(`$${item.amount.toFixed(2)}`, 400, y, { width: 150, align: 'right' });
      });

      doc.moveDown(1);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      // Totals
      const totalsX = 400;
      const totalsWidth = 150;

      doc.fontSize(10).font('Helvetica');
      doc.text('Subtotal:', totalsX, doc.y, { width: totalsWidth - 80, align: 'left' });
      doc.text(`$${invoiceData.subtotal.toFixed(2)}`, totalsX + 80, doc.y - 14, { width: 70, align: 'right' });

      if (invoiceData.discount > 0) {
        doc.text('Discount:', totalsX, doc.y, { width: totalsWidth - 80, align: 'left' });
        doc.text(`-$${invoiceData.discount.toFixed(2)}`, totalsX + 80, doc.y - 14, { width: 70, align: 'right' });
      }

      doc.text(`Tax (${invoiceData.taxRate}%):`, totalsX, doc.y, { width: totalsWidth - 80, align: 'left' });
      doc.text(`$${invoiceData.tax.toFixed(2)}`, totalsX + 80, doc.y - 14, { width: 70, align: 'right' });

      if (invoiceData.additionalCharges > 0) {
        doc.text('Additional Charges:', totalsX, doc.y, { width: totalsWidth - 80, align: 'left' });
        doc.text(`$${invoiceData.additionalCharges.toFixed(2)}`, totalsX + 80, doc.y - 14, { width: 70, align: 'right' });
      }

      doc.moveDown(0.3);
      doc.moveTo(totalsX, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.3);

      doc.fontSize(14).font('Helvetica-Bold');
      doc.text('GRAND TOTAL:', totalsX, doc.y, { width: totalsWidth - 80, align: 'left' });
      doc.text(`$${invoiceData.grandTotal.toFixed(2)}`, totalsX + 80, doc.y - 18, { width: 70, align: 'right' });

      doc.moveDown(1);

      // Payment status
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Payment Status: ', 50, doc.y, { continued: true });
      doc.font('Helvetica').text(invoiceData.paymentStatus);

      doc.moveDown(2);

      // Footer
      doc.fontSize(8).font('Helvetica').text('Thank you for your business!', { align: 'center' });
      doc.text('For any queries, please contact support@vms.com', { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateInvoice };
