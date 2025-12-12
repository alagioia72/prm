import nodemailer from 'nodemailer';

// Use port 587 (STARTTLS) or 465 (SMTPS) - port 25 is often blocked by cloud providers
const smtpPort = parseInt(process.env.SMTP_PORT || '587');
const isSecure = smtpPort === 465;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gonetta.it',
  port: smtpPort,
  secure: isSecure,
  auth: {
    user: process.env.SMTP_USER || 'postmaster@gonetta.it',
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000
});

const fromEmail = process.env.SMTP_USER || 'postmaster@gonetta.it';

export async function sendVerificationEmail(toEmail: string, firstName: string, verificationToken: string) {
  try {
    const appDomain = process.env.APP_DOMAIN || process.env.REPLIT_DEV_DOMAIN || 'localhost:5000';
    const protocol = appDomain.includes('localhost') ? 'http' : 'https';
    const verificationUrl = `${protocol}://${appDomain}/verify-email?token=${verificationToken}`;
    
    await transporter.sendMail({
      from: `"GonettaGO" <${fromEmail}>`,
      to: toEmail,
      subject: 'GonettaGO - Verifica la tua email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #16a34a;">Benvenuto su GonettaGO!</h1>
          <p>Ciao ${firstName},</p>
          <p>Grazie per esserti registrato. Per completare la registrazione, clicca sul pulsante qui sotto per verificare la tua email:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Verifica Email
            </a>
          </div>
          <p>Se non riesci a cliccare il pulsante, copia e incolla questo link nel browser:</p>
          <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">Se non hai richiesto questa registrazione, puoi ignorare questa email.</p>
        </div>
      `
    });
    console.log(`Verification email sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
}

export async function sendTournamentNotification(
  toEmail: string,
  firstName: string,
  tournamentName: string,
  tournamentDate: Date,
  tournamentGender: string,
  tournamentLevel: string
) {
  try {
    const appDomain = process.env.APP_DOMAIN || process.env.REPLIT_DEV_DOMAIN || 'localhost:5000';
    const protocol = appDomain.includes('localhost') ? 'http' : 'https';
    const tournamentsUrl = `${protocol}://${appDomain}/tournaments`;
    
    const genderLabel = tournamentGender === 'male' ? 'Maschile' : tournamentGender === 'female' ? 'Femminile' : 'Misto';
    const levelLabel = tournamentLevel === 'beginner' ? 'Principianti' : tournamentLevel === 'intermediate' ? 'Intermedio' : 'Avanzato';
    const dateStr = tournamentDate.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    
    await transporter.sendMail({
      from: `"GonettaGO" <${fromEmail}>`,
      to: toEmail,
      subject: `GonettaGO - Nuovo torneo: ${tournamentName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #16a34a;">Nuovo Torneo Disponibile!</h1>
          <p>Ciao ${firstName},</p>
          <p>E' stato creato un nuovo torneo per il quale sei idoneo. Ecco i dettagli:</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #111; margin-top: 0;">${tournamentName}</h2>
            <p><strong>Data:</strong> ${dateStr}</p>
            <p><strong>Categoria:</strong> ${genderLabel} - ${levelLabel}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${tournamentsUrl}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Vai ai Tornei
            </a>
          </div>
          <p>Non perdere l'occasione di partecipare!</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">Ricevi questa email perché sei iscritto a GonettaGO e sei idoneo per questo torneo.</p>
        </div>
      `
    });
    console.log(`Tournament notification sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending tournament notification:', error);
    return false;
  }
}

export async function testSmtpConnection(): Promise<boolean> {
  try {
    console.log(`Testing SMTP connection to ${process.env.SMTP_HOST}:${smtpPort} (secure: ${isSecure})`);
    await transporter.verify();
    console.log('SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('SMTP connection failed:', error);
    return false;
  }
}
