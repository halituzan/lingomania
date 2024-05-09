import { NextApiRequest, NextApiResponse } from "next";
const getWord = require("tdk-all-api");

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { query } = req;
  try {
    const word = await getWord(query.word);
    res.status(200).json({
      word,
      status: true,
    });
  } catch (error) {
    console.log(error);
  }
};
export default handler;
