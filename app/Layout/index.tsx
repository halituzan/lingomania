import React from "react";

type Props = {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  return (
    <div className=' min-h-screen flex flex-col justify-center items-start bg-black'>
      <main className='max-w-[1024px] mx-auto flex-1 pt-5 pb-20'>{children}</main>
    </div>
  );
};

export default Layout;
