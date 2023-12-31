'use client';

import LoginFormValue from '@/interfaces/ILoginFormValue';
import IFormSubmit from '@/interfaces/IFormSubmit';
import { fetchApiLogin, fetchApiRegister } from '@/utils/userAPI';
import { ChangeEvent, FormEvent, ReactPropTypes, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppContext from '@/context/AppContext';

export default function RegisterForm(props: any) {
  const router = useRouter();
  const [formValues, setFormValues] = useState<LoginFormValue>({
    username: '',
    password: '',
  });
  const [errorModal, setErrorModal] = useState<string>('');
  const { user, setUser } = useContext(AppContext);

  const submitFunction = async (e: FormEvent<HTMLFormElement>): Promise<IFormSubmit> => {
    e.preventDefault();
    const payload = {
      username: formValues.username,
      password: formValues.password,
    };

    setUser(payload.username);

    let login = null;
    let register = null;

    try {
      if (props.buttonType === 'login') {
        login = await fetchApiLogin(payload);
      } else {
        register = await fetchApiRegister(payload);
      }

      if (register && register.status === 'ERROR') {
        console.log(register)
        setErrorModal(register.error.issues[0].message);
      }
      if (login && login.status === 'ERROR') {
        setErrorModal('Verify your username or password');
      }

      return { status: 'SUCCESSFULL', message: 'Form successfully submited' };
    } catch (e) {
      return { status: 'ERROR', message: 'Impossible to submit form' };
    } finally {
      if (register !== null && register.status === 'SUCCESSFUL') {
        props.closeFunction();
      }

      if (login !== null && login.status === 'SUCCESSFUL') {
        const token = JSON.stringify(login.token);

        document.cookie = `token=${token}`;
        router.push('/');
      }
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setErrorModal('')
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  return (
    <form
      onSubmit={submitFunction}
      className={`flex flex-col justify-center items-center w-[450px] h-64 ${
        props.buttonType === 'login' ? 'bg-green-500' : 'bg-blue-500'
      }`}
    >
      <fieldset className="flex flex-col items-center w-[400px] h-56 bg-zinc-800">
        <p className="absolute overflow-hidden">{errorModal}</p>
        <div className="flex flex-col justify-evenly items-center mt-4 h-[150px]">
          <input
            className="w-44 rounded text-black"
            type="text"
            placeholder="username"
            name="username"
            value={formValues.username}
            onChange={handleChange}
          />
          <input
            className="w-44 rounded text-black"
            type="password"
            placeholder="password"
            name="password"
            value={formValues.password}
            onChange={handleChange}
          />
        </div>
        <button
          type="submit"
          className={`border-2 rounded p-1 w-24 ${
            props.buttonType === 'login' ? 'bg-green-500' : 'bg-blue-500'
          }`}
        >
          {props.buttonType === 'login' ? 'Log in' : 'Register'}
        </button>
      </fieldset>
    </form>
  );
}
