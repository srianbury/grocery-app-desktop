import React, { useState, useContext } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { AuthenticationContext } from '../Authentication';
import * as CONSTANTS from '../../constants';
import Spinner from '../Spinner'
import Error from '../Error'

const FormContainer = ({ children }) => (
  <div className="container">
    <div className="row">
      <div className="col-lg-8 offset-lg-2">{children}</div>
    </div>
  </div>
);

const SwitchForm = ({ text, handleToggle, buttonText}) => (
  <h6 className='mt-2'>
    <span className="align-middle">{text}{' '}</span>
    <span>
      <button
        type="button"
        className="btn btn-link p-0"
        onClick={handleToggle}
      >
        {buttonText}
      </button>
    </span>
  </h6>
)

const LoginBase = () => {
  const [alreadyAUser, setAlreadyAUser] = useState(true);
  function handleToggle() {
    setAlreadyAUser((prev) => !prev);
  }
  return (
    <div>
      {alreadyAUser ? (
        <LoginContainer handleToggle={handleToggle} />
      ) : (
        <SignUpContainer handleToggle={handleToggle} />
      )}
    </div>
  );
};

const SignUpContainer = ({ handleToggle }) => {
  const { setUser } = useContext(AuthenticationContext);

  const SignupSchema = yup.object().shape({
    username: yup.string()
      .min(2, 'Username must be at least 2 characters')
      .max(21, 'Username must be less than 21 characters')
      .required('Required'),
    email: yup.string()
      .email('Invalid email')
      .required('Required'),
    password: yup.string()
      .min(10, 'Password must be at least 10 characters')
      .max(30, 'Password must be less than 30 characters')
      .required('Required'),
    verifyPassword: yup.mixed().test('match', 'Passwords do not match.', function(){
      return this.parent.password === this.parent.verifyPassword
    })
  });

  async function handleSignUp(values, { setStatus, setSubmitting }) {
    try {
      const response = await fetch(`${CONSTANTS.API_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: values.username,
          password: values.password,
          email: values.email,
        }),
      });
      const result = await response.json();
      if(response.status === 200){
        setUser(result);
      }

      if(response.status === 400){
        setStatus({
          message: result.message
        })
      }
    } catch (e) {
      setStatus({
        message: 'Sign up failed.', // TODO: add more specific reason here
      });
      setSubmitting(false);
    }
  }

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
      email: '',
      verifyPassword: '',
    },
    validationSchema: SignupSchema,
    onSubmit: handleSignUp,
  });

  return (
    <SignUpView
      formik={formik}
      handleSignUp={handleSignUp}
      handleToggle={handleToggle}
    />
  );
};

const SignUpView = ({ formik, handleSignUp, handleToggle }) => (
  <FormContainer>
    <form onSubmit={formik.handleSubmit}>
      <h1>Sign Up</h1>

      {formik.status && <Error message={formik.status.message} />}

      <div className="form-group">
        <label htmlFor="username">Username</label>
        <input
          name="username"
          type="text"
          placeholder="Username"
          className="form-control"
          value={formik.values.username}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.username && formik.errors.username && (
          <Error message={formik.errors.username} />
        )}
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          name="email"
          type="text"
          placeholder="Email"
          className="form-control"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.email && formik.errors.email && (
          <Error message={formik.errors.email} />
        )}
      </div>

      <div className="form-group">
        <label htmlFor="username">Password</label>
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="form-control"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.password && formik.errors.password && (
          <Error message={formik.errors.password} />
        )}
      </div>

      <div className="form-group">
        <label htmlFor="verifyPassword">Verify Password</label>
        <input
          name="verifyPassword"
          type="password"
          placeholder="Verify Password"
          className="form-control"
          value={formik.values.verifyPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.verifyPassword && formik.errors.verifyPassword && (
          <Error message={formik.errors.verifyPassword} />
        )}
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={formik.isSubmitting}
      >
        {formik.isSubmitting ? <Spinner /> : 'Sign Up'}
      </button>

      <SwitchForm 
        text="Already a user?"
        handleToggle={handleToggle}
        buttonText='Login'
      />
    </form>
  </FormContainer>
);

const LoginContainer = ({ handleToggle }) => {
  const { setUser } = useContext(AuthenticationContext);

  const LoginSchema = yup.object().shape({
    username: yup.string()
      .required('Required'),
    password: yup.string()
      .required('Required')
  });

  async function handleLogin(values, { setStatus, setSubmitting }) {
    try {
      setStatus(null) // reset status before request
      const response = await fetch(`${CONSTANTS.API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();
      if(response.status === 200){
        setUser(result);
      }

      if(response.status === 400){
        setStatus({
          message: result.message
        })
      }

    } catch (e) {
      setStatus({
        message: 'Login failed.', // TODO: add more specific reason here
      });
      setSubmitting(false);
    }
  }

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: LoginSchema,
    onSubmit: handleLogin,
  });

  return <LoginView formik={formik} handleToggle={handleToggle} />;
};

const LoginView = ({ formik, handleToggle }) => (
  <FormContainer>
    <form onSubmit={formik.handleSubmit}>
      <h1>Login</h1>
      {formik.status && <Error message={formik.status.message} />}
      <div className="form-group">
        <label htmlFor="username">Username</label>
        <input
          name="username"
          type="text"
          placeholder="Username"
          className="form-control"
          value={formik.values.username}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.username && formik.errors.username && (
          <Error message={formik.errors.username} />
        )}
      </div>
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="form-control"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.password && formik.errors.password && (
          <Error message={formik.errors.password} />
        )}
      </div>
      <button
        type="submit"
        className="btn btn-primary"
        disabled={formik.isSubmitting}
      >
        {formik.isSubmitting ? <Spinner /> : 'Login'}
      </button>
      <SwitchForm 
        text="Don't have an account?"
        handleToggle={handleToggle}
        buttonText='Sign Up'
      />
    </form>
  </FormContainer>
);

export default LoginBase;
