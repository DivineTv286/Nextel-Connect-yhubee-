const SibApiV3Sdk = require('sib-api-v3-sdk');

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
    }

    const { fullName, email, planName, amount } = req.body;

    if (!email || !fullName) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    try {
        // Initialize Brevo client
        const defaultClient = SibApiV3Sdk.ApiClient.instance;
        const apiKey = defaultClient.authentications['api-key'];
        apiKey.apiKey = process.env.BREVO_API_KEY; // Pulled securely from Vercel Environment Variables

        const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

        const sendSvcEmail = new SibApiV3Sdk.SendSmtpEmail();

        sendSvcEmail.subject = "Welcome to Nextel Connect! Account Activated";
        sendSvcEmail.sender = { 
            name: "Nextel Connect", 
            email: process.env.SENDER_EMAIL || "raphealemmanuel411@gmail.com" 
        };
        sendSvcEmail.to = [{ email: email, name: fullName }];
        sendSvcEmail.htmlContent = `
            <div style="font-family: 'Poppins', Arial, sans-serif; background-color: #071a0f; color: #ffffff; padding: 40px; border-radius: 12px;">
                <h2 style="color: #C9A84C;">Welcome, ${fullName}!</h2>
                <p>Your Nextel Connect account has been successfully set up and activated.</p>
                <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid rgba(201,168,76,0.2);">
                    <p style="margin: 5px 0;"><strong>Package:</strong> ${planName}</p>
                    <p style="margin: 5px 0;"><strong>Activation Fee:</strong> ₦${amount.toLocaleString()}</p>
                </div>
                <p>You can now log in to your dashboard and start earning from your telecommunication network stream.</p>
                <p style="color: rgba(255,255,255,0.5); font-size: 0.85rem; margin-top: 30px;">&copy; 2026 Nextel Connect. All Rights Reserved.</p>
            </div>
        `;

        await apiInstance.sendTransacEmail(sendSvcEmail);

        return res.status(200).json({ success: true, message: 'Welcome email sent successfully!' });

    } catch (error) {
        console.error('Brevo API Error:', error);
        return res.status(500).json({ success: false, message: error.message || 'Failed to send email' });
    }
}
