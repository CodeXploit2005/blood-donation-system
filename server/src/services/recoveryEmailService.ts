import nodemailer from 'nodemailer';

export const recoveryEmailConfigured = (): boolean => {

  if (process.env.EMAIL_PROVIDER === 'emailjs') {
    return !!(process.env.EMAILJS_SERVICE_ID && process.env.EMAILJS_TEMPLATE_ID && process.env.EMAILJS_PUBLIC_KEY && process.env.EMAILJS_PRIVATE_KEY);
  }
  return !!(process.env.SMTP_HOST && process.env.SMTP_FROM);
};

export const sendRecoveryEmail = async (email: string, name: string, otp: string): Promise<void> => {
  if (process.env.EMAIL_PROVIDER === 'emailjs') {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(15_000),
      body: JSON.stringify({
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        accessToken: process.env.EMAILJS_PRIVATE_KEY,
        template_params: {
          email, to_email: email, to_name: name, name,
          otp, code: otp,
          // EmailJS One-Time Password template renders this six-digit code.
          passcode: otp, time: '10 phút', expires_minutes: '10',
          app_name: 'Nhịp Sống',
          message: `Mã OTP đặt lại mật khẩu Nhịp Sống có hiệu lực 10 phút: ${otp}`,
        },
      }),
    });
    if (!response.ok) {
      // Never log the request body, API keys, recipient, or reset URL.
      const text = await response.text();
      const hint = /non-browser/i.test(text) ? 'Enable server API requests in EmailJS Account Security.' : 'Check EmailJS service, template recipient variables, keys and quota.';
      throw new Error(`EmailJS HTTP ${response.status}. ${hint}`);
    }
    return;
  }
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    ...(process.env.SMTP_USER ? { auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } } : {}),
  });
  await transport.sendMail({
    from: process.env.SMTP_FROM, to: email, subject: 'Nhịp Sống — Đặt lại mật khẩu',
    text: `Bạn đã yêu cầu đặt lại mật khẩu Nhịp Sống.\n\nNhập mã OTP sau trong vòng 10 phút:\n${otp}\n\nNếu không yêu cầu, bạn có thể bỏ qua email này.`,
  });
};
