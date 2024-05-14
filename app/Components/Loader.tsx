import React from "react";
import { Icon } from "@iconify/react";

const Loader = ({ color = "white" }: { color?: string }) => {
  return (
    <div className='flex items-center justify-center flex-1'>
      <Icon
        icon='line-md:loading-twotone-loop'
        fontSize={"3rem"}
        className='text-4xl'
        color={color}
      />
    </div>
  );
};

export default Loader;
