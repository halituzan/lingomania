import toast from "react-hot-toast";
import Network from "../Helpers/Network";

export const loginService = async (body: {
  email: string;
  password: string;
}) => {
  try {
    const data = await Network.postData("/auth/login?device=web", body);
    return data;
  } catch (error: any) {
    toast.error(error.response.data.message);
    console.log(error);
  }
};
export const registerService = async (body: {
  email: string;
  password: string;
  userName: string;
}) => {
  try {
    const data = await Network.postData("/auth/register", body);
    return data;
  } catch (error: any) {
    toast.error(error.response.data.message);
    console.log(error);
  }
};
