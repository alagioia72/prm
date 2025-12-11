// Resend email integration
import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return {apiKey: connectionSettings.settings.api_key, fromEmail: connectionSettings.settings.from_email};
}

export async function getResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail
  };
}

export async function sendVerificationEmail(toEmail: string, firstName: string, verificationToken: string) {
  try {
    const { client, fromEmail } = await getResendClient();
    const verificationUrl = `${process.env.REPLIT_DEV_DOMAIN ? 'https://' + process.env.REPLIT_DEV_DOMAIN : 'http://localhost:5000'}/verify-email?token=${verificationToken}`;
    
    await client.emails.send({
      from: fromEmail || 'noreply@resend.dev',
      to: toEmail,
      subject: 'Padel Club - Verifica la tua email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #16a34a;">Benvenuto su Padel Club!</h1>
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
    const { client, fromEmail } = await getResendClient();
    const tournamentsUrl = `${process.env.REPLIT_DEV_DOMAIN ? 'https://' + process.env.REPLIT_DEV_DOMAIN : 'http://localhost:5000'}/tournaments`;
    
    const genderLabel = tournamentGender === 'male' ? 'Maschile' : tournamentGender === 'female' ? 'Femminile' : 'Misto';
    const levelLabel = tournamentLevel === 'beginner' ? 'Principianti' : tournamentLevel === 'intermediate' ? 'Intermedio' : 'Avanzato';
    const dateStr = tournamentDate.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    
    await client.emails.send({
      from: fromEmail || 'noreply@resend.dev',
      to: toEmail,
      subject: `Padel Club - Nuovo torneo: ${tournamentName}`,
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
          <p style="color: #999; font-size: 12px;">Ricevi questa email perché sei iscritto a Padel Club e sei idoneo per questo torneo.</p>
        </div>
      `
    });
    return true;
  } catch (error) {
    console.error('Error sending tournament notification:', error);
    return false;
  }
}
