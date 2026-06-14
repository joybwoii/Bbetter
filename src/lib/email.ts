import nodemailer from 'nodemailer';

// Configure the transport layer using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || '', // Configure these in your .env
    pass: process.env.EMAIL_PASS || '', 
  },
});

/**
 * Sends an email notification
 * @param to Recipient email address
 * @param subject Subject of the email
 * @param html HTML content of the email
 */
export async function sendEmail(to: string, subject: string, html: string) {
  try {
    // If credentials aren't set up, just log the email to console for development
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('----------------------------------------------------');
      console.log(`[EMAIL MOCK] To: ${to}`);
      console.log(`[EMAIL MOCK] Subject: ${subject}`);
      console.log(`[EMAIL MOCK] Content:\n${html}`);
      console.log('----------------------------------------------------');
      console.log('To send real emails, set EMAIL_USER and EMAIL_PASS in your environment.');
      return { success: true, mocked: true };
    }

    const info = await transporter.sendMail({
      from: `"Bbetter Store" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

export function generateOrderPlacedEmailHtml(order: any) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #4F46E5;">Thank you for your order!</h2>
      <p>Hi ${order.shipping?.firstName || 'Customer'},</p>
      <p>Your order <strong>${order.orderNumber}</strong> has been successfully placed.</p>
      
      <h3 style="border-bottom: 1px solid #eee; padding-bottom: 8px;">Order Summary</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        ${order.items.map((item: any) => `
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
              ${item.quantity}x ${item.name}
            </td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">
              ₹${(item.price * item.quantity).toLocaleString('en-IN')}
            </td>
          </tr>
        `).join('')}
      </table>
      
      <p style="font-size: 1.2em; font-weight: bold; text-align: right;">
        Total: ₹${order.total.toLocaleString('en-IN')}
      </p>
      
      <p><strong>Shipping Address:</strong><br/>
        ${order.shipping?.address}, ${order.shipping?.apartment ? order.shipping?.apartment + ',' : ''}
        ${order.shipping?.city}, ${order.shipping?.state} - ${order.shipping?.pinCode}
      </p>
      
      <p>We'll notify you when your order ships.</p>
      <p>Best regards,<br/>The Bbetter Team</p>
    </div>
  `;
}

export function generateOrderStatusUpdateEmailHtml(order: any, newStatus: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #4F46E5;">Order Update</h2>
      <p>Hi ${order.shipping?.firstName || 'Customer'},</p>
      <p>The status of your order <strong>${order.orderNumber || order.id}</strong> has been updated to:</p>
      <h3 style="background: #F3F4F6; padding: 12px; border-radius: 6px; display: inline-block; color: #111;">
        ${newStatus}
      </h3>
      
      <p>You can track your order status anytime from our website.</p>
      <p>Best regards,<br/>The Bbetter Team</p>
    </div>
  `;
}
