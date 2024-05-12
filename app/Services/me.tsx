import toast from "react-hot-toast";
import Network from "../Helpers/Network";

export const meService = async () => {
  try {
    const { data } = await Network.getData("/info/me");
    return data;
  } catch (error: any) {
    console.log(error);
    if (error.response.status == 406) {
      location.href = "/login";
      toast.error(error.response.data.message)
    }
  }
};
