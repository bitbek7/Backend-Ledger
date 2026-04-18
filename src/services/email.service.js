import nodemailer  from "nodemailer";

const transporter=nodemailer.createTransport({
    service:"gmail",
    auth:{
type:"OAuth2",
user:process.env.USER_EMAIL,
clientId:process.env.CLIENT_ID,
clientSecret:process.env.CLIENT_SECRET,
refreshToken:process.env.REFRESH_TOKEN,
},
})
 transporter.verify((error,succes)=>{
    if(error){
        console.log("Error on connecting to email server",error);
    }
    else{
        console.log("Email server is ready to send the message...");
    }
});


async function sendEmail(to,subject,text,html){
    try{
const info=await transporter.sendMail({
    from:`"Pujara Industry"<${process.env.USER_EMAIL}>`,
    to,
    subject,
    text,
    html
});
console.log("Message sent:%s",info.messageId);
console.log("Preview URL:%s",nodemailer.getTestMessageUrl(info));
    }
    catch(error){
console.error("Error on sending email:",error)
    }
}

//function to send the mail... while registration

async function userRegistrationMail(userEmail,name){
const subject="Welcome to Pujara Industry";
const text=`Hello ${name},\n\n Thankyou for registration, We'r excited to have you on board !!! you were selected for Our company boss Bibek's PA \n\n Best Regards,\n The Pujara Industry Team`;
const html=`<p>Hello ${name}</p>,<p> Thankyou for registration, We'r excited to have you on a board !!!</p><p> Best Regards,<br> Pujara Industry Team</p>`;
await sendEmail(userEmail,subject,text,html);
}

async function sendTransactions(userEmail,name,amount,toAccount){
    const subject="Transaction successfully";
    const text=`Hello ${name},\n\n Your transaction of amount ${amount} to account ${toAccount}was succcessfully transmitted.`;
    const html=`<p>Hello ${name},</p><p>\n\n Your transaction of amount ${amount} to account ${toAccount}was succcessfully transmitted.</p>`;
    await sendEmail(userEmail,subject,text,html);
}
async function sendTransactionsFailure(userEmail,name,amount,toAccount){
    const subject="Transaction Failed";
    const text=`Hello ${name},\n\n Your transaction of amount ${amount} to account ${toAccount}was failed`;
    const html=`<p>Hello ${name},</p><p>\n\n Your transaction of amount ${amount} to account ${toAccount}was failed.</p>`;
    await sendEmail(userEmail,subject,text,html);
}

export default {sendEmail,userRegistrationMail,sendTransactions,sendTransactionsFailure};