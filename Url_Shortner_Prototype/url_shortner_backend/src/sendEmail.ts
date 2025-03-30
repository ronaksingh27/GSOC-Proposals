import { Resend } from 'resend';

async function sendEmail(to: any, magicLink: string) {

    const resend = new Resend(env.RESEND_API_KEY);
  
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: ['litrunner55@gmail.com'],
      subject: 'Hello World',
      html: `
          <div style="font-family: Arial, sans-serif; text-align: center;">
            <h2>Login to Your Account</h2>
            <p>Click the button below to log in:</p>
            <a href="${magicLink}" 
               style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Log In
            </a>
            <p>If you didn’t request this, you can safely ignore this email.</p>
          </div>
        `,
    });
  
    if (error) {
      console.error('Failed to send email:', error);
      return { success: false, error };
    }
  
    console.log('Magic Link sent:', data);
    console.log("magiclink: ", magicLink);
    return { success: true, data };
  }
  

    export default sendEmail;