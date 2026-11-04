
const nodemailer = require("nodemailer");

// Gmail SMTP configuration
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

// Send order confirmation email
const sendOrderConfirmation = async (customerEmail, order) => {
    try {
        const itemsHTML = order.items.map((item) => `
            <tr>
                <td style="padding:10px;border-bottom:1px solid #ddd;">
                    ${item.food_name}
                </td>
                <td style="padding:10px;border-bottom:1px solid #ddd;">
                    ${item.quantity}
                </td>
                <td style="padding:10px;border-bottom:1px solid #ddd;">
                    ₹${Number(item.subtotal).toFixed(2)}
                </td>
            </tr>
        `).join("");

        const pickupTime = new Date(order.pickup_time)
            .toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: "Asia/Kolkata"
            });

        const mailOptions = {
            from: `"FoodHub" <${process.env.EMAIL_USER}>`,
            to: customerEmail,
            subject: `FoodHub Order Confirmation - ${order.order_number}`,
            html: `
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
                    <h2 style="color:#e85d04;">FoodHub</h2>

                    <h3>Thank you for your order, ${order.customer_name}!</h3>

                    <p>Your pickup order has been successfully confirmed.</p>

                    <p><strong>Order Number:</strong> ${order.order_number}</p>

                    <h3>Order Details</h3>

                    <table style="width:100%;border-collapse:collapse;">
                        <thead>
                            <tr>
                                <th align="left">Food Item</th>
                                <th align="left">Quantity</th>
                                <th align="left">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHTML}
                        </tbody>
                    </table>

                    <h3>Total: ₹${Number(order.total_amount).toFixed(2)}</h3>

                    <p><strong>Pickup Time:</strong> ${pickupTime}</p>
                    <p><strong>Payment:</strong> Cash on Pickup</p>

                    <hr />

                    <p>Thank you for choosing FoodHub!</p>
                </div>
            `
        };

        const result = await transporter.sendMail(mailOptions);

        console.log("Order confirmation email sent:", result.messageId);

        return {
            success: true,
            messageId: result.messageId
        };

    } catch (error) {
        console.error("Email notification failed:", error.message);

        return {
            success: false,
            error: error.message
        };
    }
};

module.exports = {
    sendOrderConfirmation
};
