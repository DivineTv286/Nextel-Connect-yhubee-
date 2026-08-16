export default async function handler(req, res) {
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const apiKey = process.env.BREVO_API_KEY;
        const senderEmail = process.env.SENDER_EMAIL || "raphealemmanuel411@gmail.com";

        const contactsResponse = await fetch('https://api.brevo.com/v3/contacts', {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'api-key': apiKey
            }
        });

        const contactsData = await contactsResponse.json();
        const users = contactsData.contacts || [];
        
        for (const user of users) {
            const attributes = user.attributes || {};
            const fullName = `${attributes.FIRSTNAME || ''} ${attributes.LASTNAME || ''}`.trim() || 'Valued User';
            const planName = attributes.PLAN || 'Standard Plan';

            await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': apiKey,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    sender: { name: "NEXTEL CONNECT", email: senderEmail },
                    to: [{ email: user.email, name: fullName }],
                    subject: "Daily Reminder: Complete Your NEXTEL CONNECT Activation 🚀",
                    htmlContent: `
                        <div style="font-family: 'Poppins', Arial, sans-serif; background-color: #071a0f; color: #ffffff; padding: 30px; border-radius: 12px; max-width: 600px; margin: auto;">
                            <h2 style="color: #C9A84C; margin-bottom: 5px;">NEXTEL CONNECT</h2>
                            <p style="font-size: 1.1rem; margin-top: 0;">Dear <strong>${fullName}</strong>,</p>
                            
                            <p>This is a daily reminder that your <strong>NEXTEL CONNECT</strong> account is still <strong>pending activation</strong>.</p>
                            
                            <div style="background: rgba(255,255,255,0.05); padding: 15px 20px; border-radius: 8px; margin: 20px 0; border: 1px solid rgba(201,168,76,0.3);">
                                <p style="margin: 5px 0;"><strong>Selected Plan:</strong> ${planName}</p>
                            </div>

                            <h3 style="color: #C9A84C; border-bottom: 1px solid rgba(201,168,76,0.2); padding-bottom: 5px;">Complete Your Activation</h3>
                            <p>Kindly complete your one-time activation payment using the official bank channel below:</p>

                            <div style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px; margin: 15px 0;">
                                <p style="margin: 3px 0;"><strong>Bank Name:</strong> MONIEPOINT MFB</p>
                                <p style="margin: 3px 0;"><strong>Account Number:</strong> 5079537285</p>
                                <p style="margin: 3px 0;"><strong>Account Name:</strong> NEXTEL</p>
                            </div>

                            <div style="text-align: center; margin: 30px 0;">
                                <a href="https://nextel-connect.vercel.app/payment.html" style="background-color: #C9A84C; color: #071a0f; padding: 12px 25px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">📤 SUBMIT PAYMENT PROOF</a>
                            </div>

                            <p style="font-size: 0.9rem; color: rgba(255,255,255,0.8);">If you have already made your payment, kindly ignore this reminder.</p>
                            
                            <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 25px 0;">
                            <p style="color: rgba(255,255,255,0.5); font-size: 0.8rem; text-align: center;">The NEXTEL Team</p>
                        </div>
                    `
                })
            });
        }

        return res.status(200).json({ success: true, message: 'Daily reminders sent successfully!' });
    } catch (error) {
        console.error('Cron Error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
}
