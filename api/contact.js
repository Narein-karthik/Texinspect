import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_LENGTHS = { name: 100, email: 254, company: 160, improvement: 2000 };

function getAdminDb() {
  if (getApps().length === 0) {
    const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
    if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
      throw new Error('Firebase Admin environment variables are not configured.');
    }

    initializeApp({
      credential: cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  }

  return getFirestore();
}

function normalizeSingleLine(value, maxLength) {
  return value.trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

function normalizeMultiline(value, maxLength) {
  return value.trim().replace(/\r\n/g, '\n').slice(0, maxLength);
}

function readInquiry(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;

  const name = typeof body.name === 'string' ? normalizeSingleLine(body.name, MAX_LENGTHS.name) : '';
  const email = typeof body.email === 'string' ? normalizeSingleLine(body.email, MAX_LENGTHS.email).toLowerCase() : '';
  const company = typeof body.company === 'string' ? normalizeSingleLine(body.company, MAX_LENGTHS.company) : '';
  const improvement = typeof body.improvement === 'string' ? normalizeMultiline(body.improvement, MAX_LENGTHS.improvement) : '';

  if (!name || !email || !company || !improvement || !EMAIL_PATTERN.test(email)) return null;
  return { name, email, company, improvement };
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function sendNotification(inquiry, submittedAt) {
  const { RESEND_API_KEY, CONTACT_NOTIFICATION_EMAIL, CONTACT_FROM_EMAIL } = process.env;
  if (!RESEND_API_KEY || !CONTACT_NOTIFICATION_EMAIL || !CONTACT_FROM_EMAIL) {
    throw new Error('Resend environment variables are not configured.');
  }

  const text = [
    'New TexInspect Walkthrough Request',
    '',
    `Name: ${inquiry.name}`,
    `Work Email: ${inquiry.email}`,
    `Company: ${inquiry.company}`,
    '',
    'What they would like TexInspect to help improve:',
    inquiry.improvement,
    '',
    'Submitted through: TexInspect Website',
    `Submitted at: ${submittedAt.toISOString()}`,
  ].join('\n');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: CONTACT_FROM_EMAIL,
      to: [CONTACT_NOTIFICATION_EMAIL],
      reply_to: inquiry.email,
      subject: `New TexInspect Walkthrough Request - ${inquiry.company}`,
      text,
      html: `<h2>New TexInspect Walkthrough Request</h2><p><strong>Name:</strong> ${escapeHtml(inquiry.name)}</p><p><strong>Work Email:</strong> ${escapeHtml(inquiry.email)}</p><p><strong>Company:</strong> ${escapeHtml(inquiry.company)}</p><p><strong>What they would like TexInspect to help improve:</strong><br>${escapeHtml(inquiry.improvement).replace(/\n/g, '<br>')}</p><p><strong>Submitted through:</strong> TexInspect Website<br><strong>Submitted at:</strong> ${submittedAt.toISOString()}</p>`,
    }),
  });

  if (!response.ok) throw new Error(`Resend returned ${response.status}.`);
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ success: false });
  }

  // Hidden from people; bots that fill it are accepted without creating a lead.
  if (typeof request.body?.website === 'string' && request.body.website.trim()) {
    return response.status(200).json({ success: true });
  }

  const inquiry = readInquiry(request.body);
  if (!inquiry) return response.status(400).json({ success: false });

  const submittedAt = new Date();
  let requestRef;

  try {
    requestRef = await getAdminDb().collection('walkthrough_requests').add({
      ...inquiry,
      source: 'texinspect-website',
      status: 'new',
      emailNotificationStatus: 'pending',
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Unable to store walkthrough request.', error);
    return response.status(500).json({ success: false });
  }

  try {
    await sendNotification(inquiry, submittedAt);
    await requestRef.update({ emailNotificationStatus: 'sent' });
  } catch (error) {
    console.error('Walkthrough request was stored, but notification email failed.', error);
    try {
      await requestRef.update({ emailNotificationStatus: 'failed' });
    } catch (updateError) {
      console.error('Unable to update walkthrough notification status.', updateError);
    }
  }

  // A saved lead is a successful user submission even when email delivery has a temporary issue.
  return response.status(201).json({ success: true });
}
