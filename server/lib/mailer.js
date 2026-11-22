const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

/**
 * Sends an email notification to the bride & groom whenever a guest leaves a voice note.
 * Attaches the audio file directly so it can be played with one tap in Gmail / mobile mail.
 */
async function sendVoiceNoteNotification({
  guestName,
  guestSlug,
  attending,
  pax,
  wish,
  voiceFilePath,
  voiceMime,
  voiceDuration
}) {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;
  const recipient = process.env.NOTIFICATION_EMAIL || gmailUser;

  // Gracefully fallback if Gmail is not yet configured in .env
  if (!gmailUser || !gmailPassword) {
    console.log(
      `[Mailer] Voice note saved locally for "${guestName}". To enable instant Gmail notification with audio attachment, configure GMAIL_USER and GMAIL_APP_PASSWORD in your .env file.`
    );
    return { sent: false, reason: 'unconfigured' };
  }

  // Ensure file exists
  if (!voiceFilePath || !fs.existsSync(voiceFilePath)) {
    console.warn(`[Mailer] Voice file not found at ${voiceFilePath}`);
    return { sent: false, reason: 'file_not_found' };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPassword.replace(/\s+/g, '') // remove any spaces in Google App Password
      }
    });

    const isAttending = attending === 1 || attending === true || attending === '1';
    const ext = voiceMime && voiceMime.includes('mp4') ? 'mp4' : (voiceMime && voiceMime.includes('ogg') ? 'ogg' : 'webm');
    const safeGuestName = (guestName || 'Tamu').replace(/[^a-zA-Z0-9_-]/g, '_');
    const attachmentFilename = `Voicenote-${safeGuestName}-${guestSlug || 'tamu'}.${ext}`;

    const baseUrl = (process.env.APP_URL || (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : 'http://localhost:3000')).replace(/\/+$/, '');
    const adminRsvpUrl = `${baseUrl}/admin/rsvps`;

    const mailOptions = {
      from: `"Farabi & Syifa Wedding" <${gmailUser}>`,
      to: recipient,
      subject: `💍 Pesan Suara Privat Baru: ${guestName} (${isAttending ? 'Hadir' : 'Tidak Hadir'})`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
          <div style="background: linear-gradient(135deg, #0A1325 0%, #152544 100%); color: #ffffff; padding: 26px 20px; text-align: center;">
            <div style="font-size: 26px; margin-bottom: 6px;">💍</div>
            <h1 style="margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 0.04em;">Farabi &amp; Syifa</h1>
            <p style="margin: 4px 0 0; font-size: 13px; color: #cbd5e1; letter-spacing: 0.08em; text-transform: uppercase;">Pesan Suara Privat Baru</p>
          </div>
          <div style="padding: 26px 22px;">
            <p style="font-size: 15px; margin-top: 0; color: #1e293b; line-height: 1.5;">
              Hai <strong>Farabi &amp; Syifa</strong>, ada pesan suara privat baru yang dikirimkan oleh tamu undangan untuk kalian:
            </p>
            <div style="background: #f8fafc; border-radius: 10px; padding: 18px; border-left: 4px solid #1E3A8A; margin: 20px 0;">
              <p style="margin: 4px 0; font-size: 14px; color: #334155;"><strong>Nama Tamu:</strong> ${guestName}</p>
              <p style="margin: 4px 0; font-size: 14px; color: #334155;"><strong>Konfirmasi:</strong> <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; background: ${isAttending ? '#dcfce7; color: #166534;' : '#fee2e2; color: #991b1b;'}">${isAttending ? '✓ Hadir' : '✗ Tidak Hadir'}</span></p>
              ${isAttending ? `<p style="margin: 4px 0; font-size: 14px; color: #334155;"><strong>Jumlah Pax:</strong> ${pax || 1} orang</p>` : ''}
              ${voiceDuration ? `<p style="margin: 4px 0; font-size: 14px; color: #334155;"><strong>Durasi Pesan Suara:</strong> ${voiceDuration} detik</p>` : ''}
              ${wish ? `<div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed #cbd5e1;"><strong style="font-size: 13px; color: #64748b;">Doa &amp; Pesan Tertulis:</strong><p style="margin: 6px 0 0; font-size: 14px; color: #1e293b; font-style: italic;">“${wish}”</p></div>` : ''}
            </div>
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 14px; margin: 20px 0; font-size: 13.5px; color: #1e3a8a;">
              🎙️ <strong>File audio dilampirkan langsung pada email ini (<code>${attachmentFilename}</code>)</strong>.<br>
              Anda dapat langsung memutarnya di layar HP atau mengunduhnya untuk disimpan sebagai kenang-kenangan.
            </div>
            <div style="text-align: center; margin-top: 26px;">
              <a href="${adminRsvpUrl}" style="display: inline-block; background: #0A1325; color: #ffffff; text-decoration: none; padding: 11px 22px; border-radius: 8px; font-size: 13px; font-weight: 600; letter-spacing: 0.03em;">
                Buka Admin Dashboard RSVP →
              </a>
            </div>
          </div>
          <div style="background: #f1f5f9; padding: 14px; text-align: center; font-size: 11.5px; color: #64748b;">
            Pesan ini dikirimkan otomatis oleh sistem Undangan Farabi &amp; Syifa. Pesan suara ini bersifat privat.
          </div>
        </div>
      `,
      attachments: [
        {
          filename: attachmentFilename,
          path: voiceFilePath,
          contentType: voiceMime || 'audio/webm'
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Mailer] Voice note notification emailed to ${recipient} (messageId: ${info.messageId})`);
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.error('[Mailer] Failed to send email notification:', err.message);
    return { sent: false, error: err.message };
  }
}

module.exports = { sendVoiceNoteNotification };

