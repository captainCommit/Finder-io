const admin = require('firebase-admin')
const alNum = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
var firebaseConfig = {
    "projectId": "website-x-special",
    "databaseURL": "https://website-x-special.firebaseio.com",
    "storageBucket": "website-x-special.appspot.com",
    "locationId": "us-central",
    "apiKey": "AIzaSyBKuDMZFvbFaU0W3MFM0Pheol81ZT2kPns",
    "authDomain": "website-x-special.firebaseapp.com",
    "messagingSenderId": "1041529498751"
};
admin.initializeApp(firebaseConfig)



const functions = require('firebase-functions');
const nodemailer = require('nodemailer')
const cors = require('cors')({ origin: true });
const database = admin.database()


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: functions.config().gmail.user,
      pass: functions.config().gmail.password // naturally, replace both with your real credentials or an application-specific password
    }
});



function randomString(length,chars) 
{
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}



exports.createUser = functions.database.ref('InviteRequests/{uid}').onCreate(async (snap)=>{

    var data = snap.val()
    const email = data.email;
    const password = randomString(10,alNum)
    try{
        var user = await admin.auth().createUser({
            email: email,
            emailVerified: false,
            password: password,
            displayName: email,
        })
        const mailOptions = {
            from: functions.config().gmail.user,
            to: email,
            subject: "Account Details",
            html: "Hi "+email+",<br>Your account has been created successfully.<br>Please do not share your password with anyone.<br>Thank you for using our service<br>Your Login Credentials are : <br>Email : <b>"+email+"</b><br>Password : <b>"+password+"</b><br><h2>Happy Finding</h2>"
        } 
        var x = await transporter.sendMail(mailOptions)
    }
    catch(e)
    {
        console.log(e)
        const mailOptions = {
            from: functions.config().gmail.user,
            to: email,
            subject: "Error",
            html: "Your account could not be created. Please try registering again.<br> Error Code : "+e.code+"<br> Error Message : "+e.message+"<br><h4>Happy Finding</h4>"
        } 
        var y = await transporter.sendMail(mailOptions)
    }
    finally{
        console.log('Done')
    }
})