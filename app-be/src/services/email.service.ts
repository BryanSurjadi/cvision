import { transporter } from '../config/nodemailer'
import { env } from '../config/env'

export const emailService = {
  sendVerified: async (to: string, targetRole: string) => {
    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject: 'CVision - Your CV has been verified successfully',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Great news!</h2>
          <p>Your CV targeting <strong>${targetRole}</strong> has been verified and is now visible to HR recruiters on CVision.</p>
          <p>Good luck with your job search!</p>
          <br/>
          <p>— The CVision Team</p>
        </div>
      `
    })
  },

  sendRejected: async (to: string, targetRole: string, reason: string) => {
    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject: 'CVision - Your CV has been rejected',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Update on your submission</h2>
          <p>Your CV targeting <strong>${targetRole}</strong> was not verified.</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p>You may resubmit an updated CV at any time.</p>
          <br/>
          <p>— The CVision Team</p>
        </div>
      `
    })
  }


}