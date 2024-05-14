import accessControl from "./accessControl";
import methodHandle from "./method";
import userControl from "./user";

export const errorHandle = (
  token: string,
  res: any,
  req: any,
  method: string
) => {
  accessControl(token, res);
  const userId = userControl(token, res);
  methodHandle(res, req, method);
  return userId;
};
