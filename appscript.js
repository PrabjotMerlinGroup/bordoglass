// Google Apps Script for Bordoglass Contact & Configurator Forms
// Saves to Google Sheets and sends confirmation emails

// CONFIGURATION
const SPREADSHEET_ID = '1DokxKxCRhsaCpdnXQcaOpc7hfML7Yf6tJM2-wHJhPWg';
const CONTACT_SHEET_NAME = 'Contact Enquiries';
const CONFIGURATOR_SHEET_NAME = 'Configurator Quotes';
const GLASS_SHEETS_SHEET_NAME = 'Glass Sheets Orders';
const BUSINESS_EMAIL = 'info@bordoglass.co.uk';
const NOTIFICATION_EMAIL = '007prabs@gmail.com'; // Your email for notifications

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Determine which form submitted based on formType field
    if (data.formType === 'configurator') {
      return handleConfiguratorSubmission(data);
    } else if (data.formType === 'glass-sheets-order') {
      return handleGlassSheetsOrder(data);
    } else {
      return handleContactSubmission(data);
    }

  } catch (error) {
    console.error('Error:', error);
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// CONTACT FORM HANDLER
// ============================================
function handleContactSubmission(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(CONTACT_SHEET_NAME);

  // Create sheet if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet(CONTACT_SHEET_NAME);
    setupContactHeaders(sheet);
  }

  // Check if headers exist
  if (sheet.getLastRow() === 0) {
    setupContactHeaders(sheet);
  }

  const projectTypeLabels = {
    'residential': 'Residential',
    'commercial': 'Commercial Office',
    'retail': 'Retail Space',
    'hospitality': 'Hospitality',
    'other': 'Other'
  };

  // Append row to spreadsheet
  sheet.appendRow([
    new Date(),
    data.firstName || '',
    data.lastName || '',
    data.email || '',
    data.phone || '',
    data.company || '',
    projectTypeLabels[data.projectType] || data.projectType || '',
    data.message || '',
    data.newsletter ? 'Yes' : 'No',
    'New'
  ]);

  // Send email notifications
  sendContactBusinessNotification(data);
  sendContactCustomerConfirmation(data);

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'success', message: 'Contact form submitted successfully' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function setupContactHeaders(sheet) {
  sheet.appendRow([
    'Timestamp',
    'First Name',
    'Last Name',
    'Email',
    'Phone',
    'Company',
    'Project Type',
    'Message',
    'Newsletter',
    'Status'
  ]);

  const headerRange = sheet.getRange(1, 1, 1, 10);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#8B1538');
  headerRange.setFontColor('#FFFFFF');
  sheet.setFrozenRows(1);
}

// ============================================
// CONFIGURATOR FORM HANDLER
// ============================================
function handleConfiguratorSubmission(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(CONFIGURATOR_SHEET_NAME);

  // Create sheet if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet(CONFIGURATOR_SHEET_NAME);
    setupConfiguratorHeaders(sheet);
  }

  // Check if headers exist
  if (sheet.getLastRow() === 0) {
    setupConfiguratorHeaders(sheet);
  }

  const designTypeLabels = {
    'hinged': 'Hinged Door',
    'sliding': 'Sliding Door',
    'pivot': 'Pivot Door',
    'partition': 'Partition'
  };

  const glassTypeLabels = {
    'clear': 'Clear Glass',
    'frosted': 'Frosted Glass',
    'tinted': 'Tinted Glass',
    'mirror': 'Mirror Glass'
  };

  // Append row to spreadsheet
  sheet.appendRow([
    new Date(),
    data.name || '',
    data.email || '',
    data.phone || '',
    data.company || '',
    designTypeLabels[data.designType] || data.designType || '',
    data.frameColor || '',
    glassTypeLabels[data.glassType] || data.glassType || '',
    data.glassThickness || '',
    data.width || '',
    data.height || '',
    data.notes || '',
    'New Quote Request'
  ]);

  // Send email notifications
  sendConfiguratorBusinessNotification(data);
  sendConfiguratorCustomerConfirmation(data);

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'success', message: 'Quote request submitted successfully' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function setupConfiguratorHeaders(sheet) {
  sheet.appendRow([
    'Timestamp',
    'Name',
    'Email',
    'Phone',
    'Company',
    'Design Type',
    'Frame Color',
    'Glass Type',
    'Glass Thickness',
    'Width (mm)',
    'Height (mm)',
    'Notes',
    'Status'
  ]);

  const headerRange = sheet.getRange(1, 1, 1, 13);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#1a1a1a');
  headerRange.setFontColor('#FFFFFF');
  sheet.setFrozenRows(1);
}

// ============================================
// CONTACT FORM EMAILS
// ============================================
function sendContactBusinessNotification(data) {
  try {
    const subject = `New Contact Enquiry: ${data.firstName} ${data.lastName}`;

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1a1a1a; color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; letter-spacing: 2px;">BORDOGLASS</h1>
          <p style="margin: 10px 0 0 0; color: #8B1538;">New Contact Enquiry</p>
        </div>

        <div style="padding: 30px; background-color: #f8f8f8;">
          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1a1a1a; margin-top: 0; border-bottom: 2px solid #8B1538; padding-bottom: 10px;">Customer Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; font-weight: bold; width: 35%; color: #666;">Name:</td>
                <td style="padding: 10px 0;">${data.firstName} ${data.lastName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #666;">Email:</td>
                <td style="padding: 10px 0;"><a href="mailto:${data.email}" style="color: #8B1538;">${data.email || 'Not provided'}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #666;">Phone:</td>
                <td style="padding: 10px 0;"><a href="tel:${data.phone}" style="color: #8B1538;">${data.phone || 'Not provided'}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #666;">Company:</td>
                <td style="padding: 10px 0;">${data.company || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #666;">Project Type:</td>
                <td style="padding: 10px 0;">${data.projectType || 'Not specified'}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #666;">Newsletter:</td>
                <td style="padding: 10px 0;">${data.newsletter ? 'Yes' : 'No'}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border-left: 4px solid #8B1538;">
            <h3 style="margin: 0 0 15px 0; color: #1a1a1a;">Message</h3>
            <p style="margin: 0; color: #666; line-height: 1.6;">${data.message || 'No message provided'}</p>
          </div>

          <div style="margin-top: 20px; text-align: center;">
            <a href="https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}"
               style="display: inline-block; background-color: #8B1538; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px;">
              View All Enquiries
            </a>
          </div>
        </div>

        <div style="background-color: #1a1a1a; color: #999; padding: 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">Enquiry received: ${new Date().toLocaleString('en-GB')}</p>
        </div>
      </div>
    `;

    const plainBody = `
NEW CONTACT ENQUIRY - BORDOGLASS
================================

CUSTOMER DETAILS:
- Name: ${data.firstName} ${data.lastName}
- Email: ${data.email || 'Not provided'}
- Phone: ${data.phone || 'Not provided'}
- Company: ${data.company || 'Not provided'}
- Project Type: ${data.projectType || 'Not specified'}
- Newsletter: ${data.newsletter ? 'Yes' : 'No'}

MESSAGE:
${data.message || 'No message provided'}

Enquiry Time: ${new Date().toLocaleString('en-GB')}

View spreadsheet: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}
    `;

    MailApp.sendEmail({
      to: NOTIFICATION_EMAIL,
      cc: BUSINESS_EMAIL,
      subject: subject,
      body: plainBody,
      htmlBody: htmlBody
    });

    console.log('Contact business notification sent');

  } catch (error) {
    console.error('Error sending contact business notification:', error);
  }
}

function sendContactCustomerConfirmation(data) {
  try {
    if (!data.email) {
      console.log('No customer email provided, skipping confirmation email');
      return;
    }

    const subject = 'Thank you for contacting Bordoglass';

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1a1a1a; color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; letter-spacing: 2px;">BORDOGLASS</h1>
          <p style="margin: 10px 0 0 0; color: #8B1538;">Thank you for your enquiry</p>
        </div>

        <div style="padding: 30px; background-color: #f8f8f8;">
          <p style="font-size: 16px; color: #333; margin-bottom: 25px;">
            Dear ${data.firstName},<br><br>
            Thank you for getting in touch with Bordoglass. We've received your enquiry and our team will get back to you within 24 hours.
          </p>

          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border-left: 4px solid #8B1538; margin-bottom: 25px;">
            <h3 style="color: #1a1a1a; margin-top: 0;">Your Enquiry Details</h3>
            <table style="width: 100%;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Project Type:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">${data.projectType || 'Not specified'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Message:</td>
                <td style="padding: 8px 0; color: #333;">${data.message || 'No message'}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #8B1538; margin-top: 0;">Contact Us</h3>
            <p style="margin: 10px 0; color: #ffffff;">
              <strong>Phone:</strong> <a href="tel:01217929167" style="color: #8B1538; text-decoration: none;">0121 792 9167</a><br>
              <strong>Email:</strong> <a href="mailto:info@bordoglass.co.uk" style="color: #8B1538; text-decoration: none;">info@bordoglass.co.uk</a><br>
              <strong>Address:</strong> Ogden Road, Wheatley Hills, Doncaster DN2 4SG
            </p>
          </div>

          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            In the meantime, why not explore our <a href="https://bordoglass.co.uk/products.html" style="color: #8B1538;">product range</a> or use our <a href="https://bordoglass.co.uk/index.html#configurator" style="color: #8B1538;">online configurator</a> to design your perfect glass system.
          </p>
        </div>

        <div style="background-color: #1a1a1a; color: #999; padding: 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">Bordoglass Ltd - Ultra-Slim Glass Partitions & Doors</p>
          <p style="margin: 5px 0 0 0;">This is an automated confirmation. Please do not reply to this email.</p>
        </div>
      </div>
    `;

    const plainBody = `
THANK YOU FOR CONTACTING BORDOGLASS
===================================

Dear ${data.firstName},

Thank you for getting in touch with Bordoglass. We've received your enquiry and our team will get back to you within 24 hours.

YOUR ENQUIRY DETAILS:
- Project Type: ${data.projectType || 'Not specified'}
- Message: ${data.message || 'No message'}

CONTACT US:
Phone: 0121 792 9167
Email: info@bordoglass.co.uk
Address: Ogden Road, Wheatley Hills, Doncaster DN2 4SG

Thank you for considering Bordoglass!

This is an automated confirmation email.
    `;

    MailApp.sendEmail({
      to: data.email,
      subject: subject,
      body: plainBody,
      htmlBody: htmlBody,
      name: 'Bordoglass',
      replyTo: BUSINESS_EMAIL
    });

    console.log('Contact customer confirmation sent to:', data.email);

  } catch (error) {
    console.error('Error sending contact customer confirmation:', error);
  }
}

// ============================================
// CONFIGURATOR FORM EMAILS
// ============================================
function sendConfiguratorBusinessNotification(data) {
  try {
    const subject = `New Quote Request: ${data.name} - ${data.designType || 'Glass System'}`;

    const designTypeLabels = {
      'hinged': 'Hinged Door',
      'sliding': 'Sliding Door',
      'pivot': 'Pivot Door',
      'partition': 'Partition'
    };

    const glassTypeLabels = {
      'clear': 'Clear Glass',
      'frosted': 'Frosted Glass',
      'tinted': 'Tinted Glass',
      'mirror': 'Mirror Glass'
    };

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1a1a1a; color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; letter-spacing: 2px;">BORDOGLASS</h1>
          <p style="margin: 10px 0 0 0; color: #8B1538;">New Quote Request from Configurator</p>
        </div>

        <div style="padding: 30px; background-color: #f8f8f8;">
          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1a1a1a; margin-top: 0; border-bottom: 2px solid #8B1538; padding-bottom: 10px;">Customer Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; font-weight: bold; width: 35%; color: #666;">Name:</td>
                <td style="padding: 10px 0;">${data.name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #666;">Email:</td>
                <td style="padding: 10px 0;"><a href="mailto:${data.email}" style="color: #8B1538;">${data.email}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #666;">Phone:</td>
                <td style="padding: 10px 0;"><a href="tel:${data.phone}" style="color: #8B1538;">${data.phone}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #666;">Company:</td>
                <td style="padding: 10px 0;">${data.company || 'Not provided'}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1a1a1a; margin-top: 0; border-bottom: 2px solid #8B1538; padding-bottom: 10px;">Configuration Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; font-weight: bold; width: 35%; color: #666;">Design Type:</td>
                <td style="padding: 10px 0; color: #8B1538; font-weight: bold;">${designTypeLabels[data.designType] || data.designType}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #666;">Frame Color:</td>
                <td style="padding: 10px 0;">${data.frameColor}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #666;">Glass Type:</td>
                <td style="padding: 10px 0;">${glassTypeLabels[data.glassType] || data.glassType}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #666;">Glass Thickness:</td>
                <td style="padding: 10px 0;">${data.glassThickness}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #666;">Dimensions:</td>
                <td style="padding: 10px 0; font-weight: bold;">${data.width}mm x ${data.height}mm</td>
              </tr>
            </table>
          </div>

          ${data.notes ? `
          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border-left: 4px solid #8B1538; margin-bottom: 20px;">
            <h3 style="margin: 0 0 15px 0; color: #1a1a1a;">Additional Notes</h3>
            <p style="margin: 0; color: #666; line-height: 1.6;">${data.notes}</p>
          </div>
          ` : ''}

          <div style="margin-top: 20px; text-align: center;">
            <a href="https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}"
               style="display: inline-block; background-color: #8B1538; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px;">
              View All Quote Requests
            </a>
          </div>
        </div>

        <div style="background-color: #1a1a1a; color: #999; padding: 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">Quote request received: ${new Date().toLocaleString('en-GB')}</p>
        </div>
      </div>
    `;

    const plainBody = `
NEW QUOTE REQUEST - BORDOGLASS CONFIGURATOR
===========================================

CUSTOMER DETAILS:
- Name: ${data.name}
- Email: ${data.email}
- Phone: ${data.phone}
- Company: ${data.company || 'Not provided'}

CONFIGURATION:
- Design Type: ${designTypeLabels[data.designType] || data.designType}
- Frame Color: ${data.frameColor}
- Glass Type: ${glassTypeLabels[data.glassType] || data.glassType}
- Glass Thickness: ${data.glassThickness}
- Dimensions: ${data.width}mm x ${data.height}mm

ADDITIONAL NOTES:
${data.notes || 'None'}

Request Time: ${new Date().toLocaleString('en-GB')}

View spreadsheet: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}
    `;

    MailApp.sendEmail({
      to: NOTIFICATION_EMAIL,
      cc: BUSINESS_EMAIL,
      subject: subject,
      body: plainBody,
      htmlBody: htmlBody
    });

    console.log('Configurator business notification sent');

  } catch (error) {
    console.error('Error sending configurator business notification:', error);
  }
}

function sendConfiguratorCustomerConfirmation(data) {
  try {
    if (!data.email) {
      console.log('No customer email provided, skipping confirmation email');
      return;
    }

    const designTypeLabels = {
      'hinged': 'Hinged Door',
      'sliding': 'Sliding Door',
      'pivot': 'Pivot Door',
      'partition': 'Partition'
    };

    const glassTypeLabels = {
      'clear': 'Clear Glass',
      'frosted': 'Frosted Glass',
      'tinted': 'Tinted Glass',
      'mirror': 'Mirror Glass'
    };

    const subject = 'Your Bordoglass Quote Request';

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1a1a1a; color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; letter-spacing: 2px;">BORDOGLASS</h1>
          <p style="margin: 10px 0 0 0; color: #8B1538;">Quote Request Received</p>
        </div>

        <div style="padding: 30px; background-color: #f8f8f8;">
          <p style="font-size: 16px; color: #333; margin-bottom: 25px;">
            Dear ${data.name},<br><br>
            Thank you for using our configurator to design your glass system. We've received your quote request and our team will prepare a personalized quote within 24 hours.
          </p>

          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border-left: 4px solid #8B1538; margin-bottom: 25px;">
            <h3 style="color: #1a1a1a; margin-top: 0;">Your Configuration</h3>
            <table style="width: 100%;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Design Type:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #8B1538;">${designTypeLabels[data.designType] || data.designType}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Frame Color:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">${data.frameColor}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Glass Type:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">${glassTypeLabels[data.glassType] || data.glassType}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Glass Thickness:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">${data.glassThickness}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Dimensions:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">${data.width}mm x ${data.height}mm</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #1a1a1a; margin-top: 0;">What Happens Next?</h3>
            <ol style="margin: 10px 0; padding-left: 20px; color: #666;">
              <li style="margin-bottom: 8px;">Our team will review your configuration</li>
              <li style="margin-bottom: 8px;">We'll calculate exact pricing and lead times</li>
              <li style="margin-bottom: 8px;">You'll receive a detailed quote within 24 hours</li>
              <li style="margin-bottom: 8px;">We'll contact you to discuss any questions</li>
            </ol>
          </div>

          <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #8B1538; margin-top: 0;">Contact Us</h3>
            <p style="margin: 10px 0; color: #ffffff;">
              <strong>Phone:</strong> <a href="tel:01217929167" style="color: #8B1538; text-decoration: none;">0121 792 9167</a><br>
              <strong>Email:</strong> <a href="mailto:info@bordoglass.co.uk" style="color: #8B1538; text-decoration: none;">info@bordoglass.co.uk</a><br>
              <strong>Showroom:</strong> Ogden Road, Wheatley Hills, Doncaster DN2 4SG
            </p>
          </div>

          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            Visit our <a href="https://bordoglass.co.uk/products.html" style="color: #8B1538;">showroom</a> to see our ultra-slim glass systems in person, or browse our full <a href="https://bordoglass.co.uk/products.html" style="color: #8B1538;">product range</a>.
          </p>
        </div>

        <div style="background-color: #1a1a1a; color: #999; padding: 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">Bordoglass Ltd - Ultra-Slim Glass Partitions & Doors</p>
          <p style="margin: 5px 0 0 0;">This is an automated confirmation. Please do not reply to this email.</p>
        </div>
      </div>
    `;

    const plainBody = `
YOUR BORDOGLASS QUOTE REQUEST
=============================

Dear ${data.name},

Thank you for using our configurator to design your glass system. We've received your quote request and our team will prepare a personalized quote within 24 hours.

YOUR CONFIGURATION:
- Design Type: ${designTypeLabels[data.designType] || data.designType}
- Frame Color: ${data.frameColor}
- Glass Type: ${glassTypeLabels[data.glassType] || data.glassType}
- Glass Thickness: ${data.glassThickness}
- Dimensions: ${data.width}mm x ${data.height}mm

WHAT HAPPENS NEXT:
1. Our team will review your configuration
2. We'll calculate exact pricing and lead times
3. You'll receive a detailed quote within 24 hours
4. We'll contact you to discuss any questions

CONTACT US:
Phone: 0121 792 9167
Email: info@bordoglass.co.uk
Showroom: Ogden Road, Wheatley Hills, Doncaster DN2 4SG

Thank you for choosing Bordoglass!

This is an automated confirmation email.
    `;

    MailApp.sendEmail({
      to: data.email,
      subject: subject,
      body: plainBody,
      htmlBody: htmlBody,
      name: 'Bordoglass',
      replyTo: BUSINESS_EMAIL
    });

    console.log('Configurator customer confirmation sent to:', data.email);

  } catch (error) {
    console.error('Error sending configurator customer confirmation:', error);
  }
}

// ============================================
// GLASS SHEETS ORDER HANDLER
// ============================================
function handleGlassSheetsOrder(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(GLASS_SHEETS_SHEET_NAME);

  // Create sheet if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet(GLASS_SHEETS_SHEET_NAME);
    setupGlassSheetsHeaders(sheet);
  }

  // Check if headers exist
  if (sheet.getLastRow() === 0) {
    setupGlassSheetsHeaders(sheet);
  }

  // Append row to spreadsheet
  sheet.appendRow([
    new Date(),
    data.name || '',
    data.email || '',
    data.phone || '',
    data.address || '',
    data.glassType || '',
    data.quantity || '',
    data.totalSheets || '',
    data.totalPrice || '',
    data.sheetSizes || '',
    data.notes || '',
    'New Order'
  ]);

  // Send email notifications
  sendGlassSheetsBusinessNotification(data);
  sendGlassSheetsCustomerConfirmation(data);

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'success', message: 'Glass sheets order submitted successfully' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function setupGlassSheetsHeaders(sheet) {
  sheet.appendRow([
    'Timestamp',
    'Name',
    'Email',
    'Phone',
    'Delivery Address',
    'Glass Type',
    'Quantity (Sets)',
    'Total Sheets',
    'Total Price',
    'Sheet Sizes',
    'Notes',
    'Status'
  ]);

  const headerRange = sheet.getRange(1, 1, 1, 12);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#c9a962');
  headerRange.setFontColor('#0d0d0d');
  sheet.setFrozenRows(1);
}

function sendGlassSheetsBusinessNotification(data) {
  try {
    const subject = `New Glass Sheets Order: ${data.name} - ${data.glassType} x${data.quantity}`;

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1a1a1a; color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; letter-spacing: 2px;">BORDOGLASS</h1>
          <p style="margin: 10px 0 0 0; color: #c9a962;">New Glass Sheets Order</p>
        </div>

        <div style="padding: 30px; background-color: #f8f8f8;">
          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1a1a1a; margin-top: 0; border-bottom: 2px solid #c9a962; padding-bottom: 10px;">Customer Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; font-weight: bold; width: 35%; color: #666;">Name:</td>
                <td style="padding: 10px 0;">${data.name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #666;">Email:</td>
                <td style="padding: 10px 0;"><a href="mailto:${data.email}" style="color: #8B1538;">${data.email}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #666;">Phone:</td>
                <td style="padding: 10px 0;"><a href="tel:${data.phone}" style="color: #8B1538;">${data.phone}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #666;">Delivery Address:</td>
                <td style="padding: 10px 0;">${data.address}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1a1a1a; margin-top: 0; border-bottom: 2px solid #c9a962; padding-bottom: 10px;">Order Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; font-weight: bold; width: 35%; color: #666;">Glass Type:</td>
                <td style="padding: 10px 0; color: #8B1538; font-weight: bold;">${data.glassType}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #666;">Quantity:</td>
                <td style="padding: 10px 0;">${data.quantity} set(s)</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #666;">Total Sheets:</td>
                <td style="padding: 10px 0;">${data.totalSheets} sheets</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #666;">Sheet Sizes:</td>
                <td style="padding: 10px 0;">${data.sheetSizes}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #666;">Total Price:</td>
                <td style="padding: 10px 0; font-weight: bold; font-size: 1.2em; color: #c9a962;">${data.totalPrice}</td>
              </tr>
            </table>
          </div>

          ${data.notes ? `
          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border-left: 4px solid #c9a962; margin-bottom: 20px;">
            <h3 style="margin: 0 0 15px 0; color: #1a1a1a;">Additional Notes</h3>
            <p style="margin: 0; color: #666; line-height: 1.6;">${data.notes}</p>
          </div>
          ` : ''}

          <div style="margin-top: 20px; text-align: center;">
            <a href="https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}"
               style="display: inline-block; background-color: #c9a962; color: #0d0d0d; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              View All Orders
            </a>
          </div>
        </div>

        <div style="background-color: #1a1a1a; color: #999; padding: 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">Order received: ${new Date().toLocaleString('en-GB')}</p>
        </div>
      </div>
    `;

    const plainBody = `
NEW GLASS SHEETS ORDER - BORDOGLASS
===================================

CUSTOMER DETAILS:
- Name: ${data.name}
- Email: ${data.email}
- Phone: ${data.phone}
- Delivery Address: ${data.address}

ORDER DETAILS:
- Glass Type: ${data.glassType}
- Quantity: ${data.quantity} set(s)
- Total Sheets: ${data.totalSheets}
- Sheet Sizes: ${data.sheetSizes}
- Total Price: ${data.totalPrice}

ADDITIONAL NOTES:
${data.notes || 'None'}

Order Time: ${new Date().toLocaleString('en-GB')}

View spreadsheet: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}
    `;

    MailApp.sendEmail({
      to: NOTIFICATION_EMAIL,
      cc: BUSINESS_EMAIL,
      subject: subject,
      body: plainBody,
      htmlBody: htmlBody
    });

    console.log('Glass sheets business notification sent');

  } catch (error) {
    console.error('Error sending glass sheets business notification:', error);
  }
}

function sendGlassSheetsCustomerConfirmation(data) {
  try {
    if (!data.email) {
      console.log('No customer email provided, skipping confirmation email');
      return;
    }

    const subject = 'Your Bordoglass Glass Sheets Order';

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1a1a1a; color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; letter-spacing: 2px;">BORDOGLASS</h1>
          <p style="margin: 10px 0 0 0; color: #c9a962;">Order Confirmation</p>
        </div>

        <div style="padding: 30px; background-color: #f8f8f8;">
          <p style="font-size: 16px; color: #333; margin-bottom: 25px;">
            Dear ${data.name},<br><br>
            Thank you for your glass sheets order. We've received your order and our team will contact you within 24 hours to confirm delivery arrangements and payment.
          </p>

          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border-left: 4px solid #c9a962; margin-bottom: 25px;">
            <h3 style="color: #1a1a1a; margin-top: 0;">Your Order Summary</h3>
            <table style="width: 100%;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Glass Type:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #8B1538;">${data.glassType}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Quantity:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">${data.quantity} set(s) (${data.totalSheets} sheets)</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Sheet Sizes:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">${data.sheetSizes}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Total:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #c9a962; font-size: 1.2em;">${data.totalPrice}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Delivery Address:</td>
                <td style="padding: 8px 0; color: #333;">${data.address}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #1a1a1a; margin-top: 0;">What Happens Next?</h3>
            <ol style="margin: 10px 0; padding-left: 20px; color: #666;">
              <li style="margin-bottom: 8px;">Our team will review your order</li>
              <li style="margin-bottom: 8px;">We'll contact you within 24 hours to confirm delivery</li>
              <li style="margin-bottom: 8px;">Payment details will be provided</li>
              <li style="margin-bottom: 8px;">Your glass will be carefully packed and dispatched</li>
            </ol>
          </div>

          <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #c9a962; margin-top: 0;">Contact Us</h3>
            <p style="margin: 10px 0; color: #ffffff;">
              <strong>Phone:</strong> <a href="tel:01217929167" style="color: #c9a962; text-decoration: none;">0121 792 9167</a><br>
              <strong>Email:</strong> <a href="mailto:info@bordoglass.co.uk" style="color: #c9a962; text-decoration: none;">info@bordoglass.co.uk</a><br>
              <strong>Address:</strong> Ogden Road, Wheatley Hills, Doncaster DN2 4SG
            </p>
          </div>

          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            If you have any questions about your order, please don't hesitate to contact us.
          </p>
        </div>

        <div style="background-color: #1a1a1a; color: #999; padding: 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">Bordoglass Ltd - Ultra-Slim Glass Partitions & Doors</p>
          <p style="margin: 5px 0 0 0;">This is an automated confirmation. Please do not reply to this email.</p>
        </div>
      </div>
    `;

    const plainBody = `
YOUR BORDOGLASS GLASS SHEETS ORDER
==================================

Dear ${data.name},

Thank you for your glass sheets order. We've received your order and our team will contact you within 24 hours to confirm delivery arrangements and payment.

YOUR ORDER SUMMARY:
- Glass Type: ${data.glassType}
- Quantity: ${data.quantity} set(s) (${data.totalSheets} sheets)
- Sheet Sizes: ${data.sheetSizes}
- Total: ${data.totalPrice}
- Delivery Address: ${data.address}

WHAT HAPPENS NEXT:
1. Our team will review your order
2. We'll contact you within 24 hours to confirm delivery
3. Payment details will be provided
4. Your glass will be carefully packed and dispatched

CONTACT US:
Phone: 0121 792 9167
Email: info@bordoglass.co.uk
Address: Ogden Road, Wheatley Hills, Doncaster DN2 4SG

Thank you for choosing Bordoglass!

This is an automated confirmation email.
    `;

    MailApp.sendEmail({
      to: data.email,
      subject: subject,
      body: plainBody,
      htmlBody: htmlBody,
      name: 'Bordoglass',
      replyTo: BUSINESS_EMAIL
    });

    console.log('Glass sheets customer confirmation sent to:', data.email);

  } catch (error) {
    console.error('Error sending glass sheets customer confirmation:', error);
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function doGet() {
  return ContentService
    .createTextOutput('Bordoglass API is live. Contact: contact form, Configurator: quote requests.')
    .setMimeType(ContentService.MimeType.TEXT);
}

// Test function for contact form
function testContactForm() {
  const testData = {
    formType: 'contact',
    firstName: 'Test',
    lastName: 'Customer',
    email: NOTIFICATION_EMAIL,
    phone: '07123456789',
    company: 'Test Company Ltd',
    projectType: 'residential',
    message: 'This is a test enquiry from the contact form.',
    newsletter: true
  };

  handleContactSubmission(testData);
  console.log('Test contact form submitted!');
}

// Test function for configurator form
function testConfiguratorForm() {
  const testData = {
    formType: 'configurator',
    name: 'Test User',
    email: NOTIFICATION_EMAIL,
    phone: '07123456789',
    company: 'Test Company',
    designType: 'hinged',
    frameColor: 'RAL 9005 - Jet Black',
    glassType: 'clear',
    glassThickness: '8mm Tempered',
    width: '1000',
    height: '2100',
    notes: 'This is a test quote request from the configurator.'
  };

  handleConfiguratorSubmission(testData);
  console.log('Test configurator form submitted!');
}

// Authorization function
function authorizeScript() {
  MailApp.getRemainingDailyQuota();
  SpreadsheetApp.openById(SPREADSHEET_ID);
  console.log('Authorization complete!');
}

// Web App URL (update after deploying):
// https://script.google.com/macros/s/AKfycbwwxro1E2bLBq6xNmCg_tHe6u8RaJY6vU4UWtd_jwZReiezCEO2geJ0b8hcr08S2bzFFA/exec
