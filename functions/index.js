const functions = require('firebase-functions');

const nodemailer = require('nodemailer');
const gmailEmail = encodeURIComponent(functions.config().gmail.email);
const gmailPassword = encodeURIComponent(functions.config().gmail.password);
const mailTransport = nodemailer.createTransport(
		`smtps://${gmailEmail}:${gmailPassword}@smtp.gmail.com`);

const APP_NAME = 'eBookShare Web Application';


// exports.sendWelcomeEmail = functions.auth.user().onCreate(event => {
// 	const user = event.data;
// 	const email = user.email;
// 	const displayName = user.displayName;

// 	return sendWelcomeEmail(email, displayName);
// });

// function sendWelcomeEmail(email, displayName) {

// 	const mailOptions = {
// 		from: `${APP_NAME} <noreply@firebase.com>`,
// 		to: email
// 	};

// 	mailOptions.subject = `Welcome to ${APP_NAME}!`;
// 	mailOptions.text = `Hey ${displayName || ''}! Welcome to ${APP_NAME}. Thank you for registering!`;
// 	return mailTransport.sendMail(mailOptions).then(() => {
// 		console.log('A welcome email was sent to:', email);
// 	});
// }

exports.createFirestoreAuthor = functions.firestore.document("authors/{authorId}").onCreate(event => {
	
	var newAuthor = event.data.data().userName;

   	console.log("Firestore Auth Object: ", event.data);
});

exports.deleteFirestoreAuthor = functions.firestore.document("authors/{authorId}").onDelete(event => {
	
	var newAuthor = event.data.data().userName;

   	console.log("Firestore Auth Object: ", event.data);
});


exports.createRTDBAuthor = functions.database.ref("authors/{authorId}").onWrite(event => {
	
   	console.log("RTDB Auth Object: ", event.auth);
});