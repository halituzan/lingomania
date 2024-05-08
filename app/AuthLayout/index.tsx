import React from "react";

type Props = {
  children: React.ReactNode;
};

const AuthLayout = ({ children }: Props) => {
  return <div>{children}</div>;
};

export default AuthLayout;
