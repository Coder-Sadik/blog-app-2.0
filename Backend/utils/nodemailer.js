import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.GMAIL_USER,
		pass: process.env.GMAIL_PASS,
	},
});

export const sendEmail = (to, subject, text, html) => {
	const mailOptions = {
		from: process.env.GMAIL_USER,
		to,
		subject,
		text,
		html,
	};

	return transporter.sendMail(mailOptions);
};
