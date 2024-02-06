import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon as FaIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import OAuth from '../components/OAuth';

function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [emailErrMsg, setEmailErrMsg] = useState('');
  const [passwordErrMsg, setPasswordErrMsg] = useState('');

  const {email, password} = formData;

  const navigate = useNavigate();

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value
    }))
  }

  const onSubmit = async (e) => {
    e.preventDefault();

    // Validation
    let hasError = false;
    if(!email) {
      hasError = true;
      setEmailError(true);
      setEmailErrMsg('Email is missing');
    } else {
      setEmailError(false);
      setEmailErrMsg('');
    }

    if(!password) {
      hasError = true;
      setPasswordError(true);
      setPasswordErrMsg('Password is missing');
    } else {
      setPasswordError(false);
      setPasswordErrMsg('');
    }

    if (!hasError) {
      try {
        const auth = getAuth();
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        if(userCredential.user) {
          navigate('/');
        }
      } catch (error) {
        toast.error('Bad User Credentials');
      }
    }
  }

  return (
    <>
      <div className='page-container'>
        <main className='sign-in-container'>
          <div className="logo-container_signin">
            <div className="logo logo_signin_goggle"></div>
            <h1 className='logo logo_signin_title'>DivLog</h1>
          </div>
          <p className='message'>Welcome Back!</p>
          <form className='signin-form' onSubmit={onSubmit}>
            <div className="input-div">
              <input
                type='email'
                className={`signin-input ${emailError ? 'input_error' : ''}`}
                placeholder='Email'
                id='email'
                value={email}
                onChange={onChange}
              />
              {emailError ? (<p className="input-error-message">{emailErrMsg}</p>) : (<></>)}
            </div>
            <div className='input-div password-input-div'>
              <input
                type={showPassword ? 'text' : 'password'}
                className={`signin-input ${passwordError ? 'input_error' : ''}`}
                placeholder='Password'
                id='password'
                value={password}
                onChange={onChange}
              />
              <div
                className='show-password'
                onClick={() => setShowPassword((prevState) => !prevState)}
              >
                {showPassword ? (<FaIcon icon={faEye} />) : (<FaIcon icon={faEyeSlash} />)}
              </div>
              {passwordError ? (<p className="input-error-message">{passwordErrMsg}</p>) : (<></>)}
            </div>
            <Link to='/forgot-password' className='forgot-password-link'>
              Forgot Password
            </Link>
            <div className='signInBar'>
              <button className='btn btn_sign_in'>
                SignIn
              </button>
            </div>
          </form>
          <OAuth />
          <Link to='/sign-up'>
            <p className='register-link'>Sign Up Instead</p>
          </Link>
        </main>
      </div>
    </>
  )
}

export default SignIn