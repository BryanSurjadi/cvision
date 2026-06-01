import { transporter } from '../config/nodemailer'
import { env } from '../config/env'

const LOGO_URL = 'https://res.cloudinary.com/dmpjjnfdj/image/upload/v1780311591/cvision_logo_ewwfxa.png'

const emailWrapper = (content: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #f8fafc; padding: 24px; text-align: center;">
      <img src="${LOGO_URL}" alt="CVision" style="height: 180px; object-fit: contain;" />
    </div>
    <div style="padding: 32px;">
      ${content}
    </div>
    <div style="background-color: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; color: #94a3b8; font-size: 12px;">© 2026 CVision. All rights reserved.</p>
    </div>
  </div>
`

export const emailService = {
  sendVerified: async (to: string, targetRole: string) => {
    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject: 'CVision - Your CV has been verified successfully',
      html: emailWrapper(`
        <h2 style="color: #0f172a; margin-top: 0;">🎉 Great news!</h2>
        <p style="color: #334155;">Your CV targeting <strong>${targetRole}</strong> has been verified and is now visible to HR recruiters on CVision.</p>
        <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px 16px; margin: 24px 0; border-radius: 4px;">
          <p style="margin: 0; color: #16a34a; font-weight: bold;">Your profile is now live in the talent pool.</p>
        </div>
        <p style="color: #334155;">Good luck with your job search!</p>
        <br/>
        <p style="color: #64748b;">— The CVision Team</p>
      `)
    })
  },

  sendRejected: async (to: string, targetRole: string, reason: string) => {
    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject: 'CVision - Update on your CV submission',
      html: emailWrapper(`
        <h2 style="color: #0f172a; margin-top: 0;">Update on your submission</h2>
        <p style="color: #334155;">Your CV targeting <strong>${targetRole}</strong> was not verified.</p>
        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; margin: 24px 0; border-radius: 4px;">
          <p style="margin: 0; color: #dc2626;"><strong>Reason:</strong> ${reason}</p>
        </div>
        <p style="color: #334155;">You may resubmit an updated CV at any time.</p>
        <br/>
        <p style="color: #64748b;">— The CVision Team</p>
      `)
    })
  }
}