import { NextResponse } from 'next/server';
import { apiURL } from '@/utils/apiUrl';
import MailComposer from 'nodemailer/lib/mail-composer';
import { generateInvoicePdfBuffer } from '@/lib/pdf/generateInvoicePdf';

export const runtime = 'nodejs';

export async function POST(req, { params }) {
  const authz = req.headers.get('authorization');
  if (!authz) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params; 
  const body = await req.json().catch(() => ({}));
  const { to, subject, text } = body;

  if (!to || !subject || !text) {
    return NextResponse.json({ error: 'Missing to/subject/text' }, { status: 400 });
  }

  // 1) Get invoice
  const invRes = await fetch(`${apiURL}/v1/invoices/${id}`, {
    headers: { 'Content-Type': 'application/json', Authorization: authz },
    cache: 'no-store',
  });
  if (!invRes.ok) {
    const e = await invRes.json().catch(() => ({}));
    return NextResponse.json({ error: e.error || 'Upstream error' }, { status: invRes.status });
  }
  const invData = await invRes.json();
  const invoice = invData.invoice;

  // 2) Generate PDF buffer
  const pdfBuf = await generateInvoicePdfBuffer({ id, authz });

  // 3) Get company + email settings 
  const compRes = await fetch(`${apiURL}/v1/company`, {
    headers: { 'Content-Type': 'application/json', Authorization: authz },
    cache: 'no-store',
  });
  if (!compRes.ok) {
    const e = await compRes.json().catch(() => ({}));
    return NextResponse.json({ error: e.error || 'Upstream error' }, { status: compRes.status });
  }
  const company = (await compRes.json()).company;

  const emailRes = await fetch(`${apiURL}/v1/email`, {
    headers: { 'Content-Type': 'application/json', Authorization: authz },
    cache: 'no-store',
  });
  if (!emailRes.ok) {
    const e = await emailRes.json().catch(() => ({}));
    return NextResponse.json({ error: e.error || 'Upstream error' }, { status: emailRes.status });
  }
  const emailSettings = (await emailRes.json()).email;

  const from = company?.email;
  const token = emailSettings?.api_key;
  if (!from || !token) {
    return NextResponse.json({ error: 'Missing from email or token' }, { status: 500 });
  }

  // 4) Build raw MIME email with PDF attachment
  const filename = `invoice-${invoice?.invoice_number ?? id}.pdf`;

  const mail = new MailComposer({
    from,
    to,
    subject,
    text,
    attachments: [
      {
        filename,
        content: pdfBuf,
        contentType: 'application/pdf',
      },
    ],
  });

  const rawBuffer = await mail.compile().build();
  const raw = rawBuffer.toString('utf8');

  // 5) Send via ForwardEmail (Basic auth; token as username, empty password)
  const basic = Buffer.from(`${token}:`).toString('base64');

  const form = new URLSearchParams();
  form.set('raw', raw);

  console.log('Sending email via ForwardEmail to:', to);
  console.log('Email subject:', subject);
  console.log('Email from:', from);
  console.log('Email attachment filename:', filename);
  console.log('Email size (bytes):', rawBuffer.length);
  console.log('Using ForwardEmail API token:', token);

  const feRes = await fetch('https://api.forwardemail.net/v1/emails', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form,
  });

  if (!feRes.ok) {
    const msg = await feRes.text().catch(() => '');
    return NextResponse.json({ error: msg || 'ForwardEmail send failed' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
