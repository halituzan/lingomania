import { registerService } from "@/app/Services/auth";
import React, { useState } from "react";

const RegisterPage = () => {
  const [register, setRegister] = useState({
    firstName: "",
    lastName: "",
    email: "",
    userName: "",
    password: "",
  });

  const valueHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target instanceof HTMLInputElement) {
      setRegister({ ...register, [e.target.name]: e.target.value });
    }
  };

  const registerHandler = async () => {
    try {
      const reg = await registerService(register);
      console.log(reg);
      if (reg) {
        location.href = "/login";
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  return (
    <div className='flex items-center justify-center h-screen'>
      <div className='w-full max-w-md'>
        <form className='bg-slate-300 shadow-md rounded px-8 pt-6 pb-8 mb-4'>
          <div className='mb-4'>
            <label
              className='block text-gray-700 text-sm font-bold mb-2'
              htmlFor='userName'
            >
              Kullanıcı Adı
            </label>
            <input
              className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
              id='userName'
              name='userName'
              type='text'
              placeholder='Kullanıcı Adı'
              value={register.userName}
              onChange={valueHandler}
            />
          </div>
          <div className='mb-4 flex justify-between items-center'>
            <div className='w-[48%]'>
              <label
                className='block text-gray-700 text-sm font-bold mb-2'
                htmlFor='firstName'
              >
                Ad
              </label>
              <input
                className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                id='firstName'
                name='firstName'
                type='text'
                placeholder='Ad'
                value={register.firstName}
                onChange={valueHandler}
              />
            </div>
            <div className='w-[48%]'>
              <label
                className='block text-gray-700 text-sm font-bold mb-2'
                htmlFor='lastName'
              >
                Soyad
              </label>
              <input
                className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                id='lastName'
                name='lastName'
                type='text'
                placeholder='Soyad'
                value={register.lastName}
                onChange={valueHandler}
              />
            </div>
          </div>
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
              type='email'
              placeholder='Email'
              value={register.email}
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
              type='password'
              placeholder='*********'
              name='password'
              value={register.password}
              onChange={valueHandler}
            />
          </div>
          <div className='flex items-center justify-between'>
            <button
              className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
              type='button'
              onClick={registerHandler}
            >
              Register
            </button>
            <a
              className='inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800'
              href='/login'
            >
              Sign In
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
