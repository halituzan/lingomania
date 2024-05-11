import { NextApiRequest, NextApiResponse } from "next";

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  // Token'i silme işlemi
  res.setHeader(
    "Set-Cookie",
    "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
  );

  // Yönlendirme işlemi
  res.writeHead(302, { Location: "/login" });
  res.end();
};
export default handler;
