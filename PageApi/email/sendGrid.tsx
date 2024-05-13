import client from "@sendgrid/mail";
client.setApiKey(process.env.NEXT_PUBLIC_SND_API || "");

const sendGrid = async (type: string, email: string, data: any) => {
  let options = {
    to: email,
    from: "halit.uzan@gmail.com",
    templateId: "d-16866e78f55d49069411e9bcfc7bb7f8",
    dynamicTemplateData: { data },
  };

  if (type === "verify") {
    options.templateId = "d-16866e78f55d49069411e9bcfc7bb7f8";
    options.dynamicTemplateData = {
      data,
    };
  }

  console.log(options);
  return client
    .send(options)
    .then((r: any) => {
      console.log("E-Posta Gönderildi!");
    })
    .catch((e: any) => {
      console.log(e);
    });
};

export default sendGrid;
