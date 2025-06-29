import React from "react";

type Props = {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  return (
    <div className=' min-h-screen flex flex-col justify-center items-center bg-black'>
      <main className='w-full flex-1 flex justify-center'>{children}</main>
    </div>
  );
};

export default Layout;
