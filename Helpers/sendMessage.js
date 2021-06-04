// const Nexmo = require("nexmo");
const Vonage = require('@vonage/server-sdk')

module.exports = (sender, number, message) => {
  return new Promise((resolve, reject) => {
    try {
      const nexmo = new Vonage({
        apiKey: process.env.NEXMO_KEY,
        apiSecret: process.env.NEXMO_SECRET,
      });

      const from = "Explorehub";
      const to = parseInt(number);
      const text = message;

      nexmo.message.sendSms(from, to, text, (err, responseData) => {
        if (err) {
          console.log(err);
        } else {
          if (responseData.messages[0]['status'] === "0") {
            resolve(true)
            console.log("Message sent successfully.");
          } else {
            resolve(false)
            console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
          }
        }
      })
      resolve(true);
    } catch (err) {
      console.error("error in sending sms: ", err);
      reject(err);
    }
  });
};
