import Network from "@/app/Helpers/Network";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

type Props = {};

const Verify = (props: Props) => {
  const [verify, setVerify] = useState(false);
  const router = useRouter();
  const { token } = router.query;

  const verifyToken = async () => {
    try {
      const data = await Network.getData("info/get-token?accessToken=" + token);
      console.log(data);

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

  return (
    <div className='w-96 rounded-lg bg-white h-52 flex justify-center items-center'>
      {!verify ? (
        <div className='flex flex-col justify-center items-center'>
          <p className='text-2xl font-semibold'>Token Geçersiz.</p>
          <a href='/' className='p-4 rounded-lg bg-black text-white mt-4'>
            Ana Sayfa
          </a>
        </div>
      ) : (
        <div className='flex flex-col justify-center items-center'>
          <p className='text-2xl font-semibold'>Email Doğrulandı.</p>
          <a href='/login' className='p-4 rounded-lg bg-black text-white mt-4'>
            Giriş Yap
          </a>
        </div>
      )}
    </div>
  );
};

export default Verify;
