import client from "@sendgrid/mail";
client.setApiKey(process.env.NEXT_PUBLIC_SND_API || "");

const sendGrid = async (type: string, email: string, data: any) => {
  let options = {
    to: email,
    from: "halit.uzan@gmail.com",
    templateId: "",
    dynamicTemplateData: {},
  };
  const msg = {
    to: "halit.uzan@gmail.com", // Change to your recipient
    from: email, // Change to your verified sender
    subject: "Sending with SendGrid is Fun",
    text: "and easy to do anywhere, even with Node.js",
    html: "<strong>and easy to do anywhere, even with Node.js</strong>",
  };

  if (type === "verify") {
    options.templateId = "";
    options.dynamicTemplateData = {
      message: data.message,
    };
  }

  console.log(options);
  return client
    .send(msg)
    .then((r: any) => {
      console.log("E-Posta Gönderildi!");
    })
    .catch((e: any) => {
      console.log(e);
    });
};

export default sendGrid;
