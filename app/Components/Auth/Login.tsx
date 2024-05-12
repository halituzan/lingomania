import { loginService } from "@/app/Services/auth";
import { meService } from "@/app/Services/me";
import React, { useState } from "react";
import toast from "react-hot-toast";

type Props = {};

const Login = (props: Props) => {
  const [login, setLogin] = useState({
    email: "",
    password: "",
  });

  const valueHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target instanceof HTMLInputElement) {
      setLogin({ ...login, [e.target.name]: e.target.value });
    }
  };

  const loginHandler = async () => {
    try {
      const logN = await loginService(login);
      console.log(logN);
      if (logN) {
        const me = await meService();
        if (me.isActive) {
          location.href = "/";
        }
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  return (
    // ?
    <div className='flex items-center justify-center h-screen'>
      <div className='w-full max-w-md'>
        <form className='bg-slate-300 shadow-md rounded px-8 pt-6 pb-8 mb-4'>
          <div className='mb-4'>
            <label
              className='block text-gray-700 text-sm font-bold mb-2'
              htmlFor='email'
            >
              Email
            </label>
            <input
              className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
              id='email'
              name='email'
              type='text'
              placeholder='Email'
              value={login.email}
              onChange={valueHandler}
            />
          </div>
          <div className='mb-6'>
            <label
              className='block text-gray-700 text-sm font-bold mb-2'
              htmlFor='password'
            >
              Password
            </label>
            <input
              className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline'
              id='password'
              name='password'
              type='password'
              placeholder='******************'
              value={login.password}
              onChange={valueHandler}
            />
            <p className='text-red-500 text-xs italic'>
              Please enter a correct email and password.
            </p>
          </div>
          <div className='flex items-center justify-between'>
            <button
              className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
              type='button'
              onClick={loginHandler}
            >
              Sign In
            </button>
            <a
              className='inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800'
              href='/register'
            >
              Sign Up
            </a>
          </div>
        </form>
        <p className='text-center text-gray-500 text-xs'>
          &copy;2022 Lingomania. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
Login.displayName = "auth";
