import { useEffect, useState } from "react";
import { meService } from "../Services/me";
import Home from "./Home";
import Loader from "./Loader";
type Props = {};

interface Info {
  isActive: boolean;
}

const MainComponent = (props: Props) => {
  const [info, setInfo] = useState<Info | null>(null);

  const checkMe = async () => {
    try {
      const data = await meService();
      setInfo(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkMe();
  }, []);
  return info && info?.isActive ? <Home /> : <Loader />;
  // return <Home />;
};

export default MainComponent;
