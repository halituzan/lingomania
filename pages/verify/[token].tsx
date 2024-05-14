import Loader from "@/app/Components/Loader";
import Network from "@/app/Helpers/Network";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

type Props = {};

const Verify = (props: Props) => {
  const [verify, setVerify] = useState(0);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const { token } = router.query;

  const verifyToken = async () => {
    try {
      const data = await Network.getData("info/get-token?accessToken=" + token);
      console.log(data);
      setMessage(data.message);
      setVerify(data.status);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (token) {
      verifyToken();
    }
  }, [token]);
  console.log(verify);

  return (
    <div className='w-96 rounded-lg bg-white h-52 flex justify-center items-center'>
      {verify == 0 ? (
        <Loader color='black' />
      ) : (
        <div className='flex flex-col justify-center items-center'>
          <p className='text-2xl font-semibold text-center'>{message}</p>
          {verify == 1 || verify == 3 ? (
            <a
              href='/login'
              className='p-4 rounded-lg bg-black text-white mt-4'
            >
              Giriş Sayfası
            </a>
          ) : (
            <a href='/' className='p-4 rounded-lg bg-black text-white mt-4'>
              Ana Sayfa
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default Verify;
