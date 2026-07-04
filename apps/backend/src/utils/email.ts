import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM || "ngawidian@gmail.com";

export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string,
) {
  const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
  const verifyLink = `${FRONTEND_URL}/verify-email?token=${token}`;

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: to,
    subject: "Verify your email address",
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
           <h2>Halo, ${name}!</h2>
           <p>Terima kasih telah mendaftar. Silakan verifikasi email Anda dengan mengklik tombol di bawah:</p>
           <a href="${verifyLink}"
              style="display: inline-block; padding: 12px 24px; background: #000; color: #fff;
                     text-decoration: none; border-radius: 0; margin: 16px 0;">
             Verifikasi Email
           </a>
           <p style="color: #666; font-size: 14px;">
             Atau salin link berikut ke browser:<br/>
             <span style="color: #888;">${verifyLink}</span>
           </p>
           <p style="color: #666; font-size: 14px;">
             Link ini berlaku selama 24 jam.
           </p>
         </div>
       `,
  });

  if (error) {
    console.error("Failed to send verification email:", error);
    throw new Error("Failed to send verification email");
  }

  console.log(
    "[Email Service] Verification email sent to: ",
    to,
    "id: ",
    data?.id,
  );
  return data;
}
