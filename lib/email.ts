import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function sendNotificationEmail(onboarding: any) {
  const restaurantName = onboarding.restaurant?.name || 'Unbekannt';
  const stadt = onboarding.restaurant?.stadt || 'Unbekannt';
  const kontaktName = onboarding.kontakt?.inhaberName || 'Unbekannt';
  const handynummer = onboarding.kontakt?.handynummer || 'Unbekannt';
  const kassensystem = onboarding.technik?.kassensystem || 'Unbekannt';
  const anzahlTische = onboarding.tische?.anzahlGesamt || 'Unbekannt';
  const verkaeuferId = onboarding.verkaeuferName || onboarding.verkaeuferId || 'Unbekannt';
  
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/${onboarding._id}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #FF6B35; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f5f5f5; padding: 20px; border-radius: 0 0 8px 8px; }
          .info-row { margin: 10px 0; }
          .label { font-weight: bold; color: #666; }
          .button { 
            display: inline-block; 
            background: #FF6B35; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 6px; 
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🟢 Neues Restaurant: ${restaurantName} – ${stadt}</h1>
          </div>
          <div class="content">
            <h2>Neue Onboarding-Einreichung</h2>
            
            <div class="info-row">
              <span class="label">Restaurant:</span> ${restaurantName}
            </div>
            <div class="info-row">
              <span class="label">Stadt:</span> ${stadt}
            </div>
            <div class="info-row">
              <span class="label">Ansprechpartner:</span> ${kontaktName}
            </div>
            <div class="info-row">
              <span class="label">Handynummer:</span> ${handynummer}
            </div>
            <div class="info-row">
              <span class="label">Kassensystem:</span> ${kassensystem}
            </div>
            <div class="info-row">
              <span class="label">Anzahl Tische:</span> ${anzahlTische}
            </div>
            <div class="info-row">
              <span class="label">Verkäufer:</span> ${verkaeuferId}
            </div>
            
            <a href="${dashboardUrl}" class="button">Im Dashboard ansehen</a>
          </div>
        </div>
      </body>
    </html>
  `;
  
  const text = `
Neues Restaurant: ${restaurantName} – ${stadt}

Restaurant: ${restaurantName}
Stadt: ${stadt}
Ansprechpartner: ${kontaktName}
Handynummer: ${handynummer}
Kassensystem: ${kassensystem}
Anzahl Tische: ${anzahlTische}
Verkäufer: ${verkaeuferId}

Im Dashboard ansehen: ${dashboardUrl}
  `;
  
  try {
    if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY !== 'SG.YOUR_API_KEY_HERE') {
      const msg = {
        to: process.env.EMAIL_TO || 'firas.hattab@gmx.de',
        from: process.env.EMAIL_FROM || 'onboarding@oriido.com', // Must be verified sender in SendGrid
        subject: `🟢 Neues Restaurant: ${restaurantName} – ${stadt}`,
        text: text,
        html: html,
      };
      
      await sgMail.send(msg);
      console.log('Email sent successfully via SendGrid');
    } else {
      console.log('Email would be sent (SendGrid not configured):');
      console.log(`To: ${process.env.EMAIL_TO || 'firas.hattab@gmx.de'}`);
      console.log(`Subject: 🟢 Neues Restaurant: ${restaurantName} – ${stadt}`);
    }
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw the error - we don't want to break the submission if email fails
    // Just log it and continue
  }
}