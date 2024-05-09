import React from "react";

type Props = {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  return (
    <div className=' min-h-screen flex flex-col justify-center items-center bg-black'>
      <main className='w-full md:max-w-[1024px] md:w-[500px] mx-4 md:mx-auto flex-1 pt-5 pb-20 flex justify-center'>{children}</main>
    </div>
  );
};

export default Layout;
