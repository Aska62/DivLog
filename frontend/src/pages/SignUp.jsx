import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.config.js';
import { FontAwesomeIcon as FaIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import OAuth from '../components/OAuth.jsx';

function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [nameError, setNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [nameErrMsg, setNameErrMsg] = useState('');
  const [emailErrMsg, setEmailErrMsg] = useState('');
  const [passwordErrMsg, setPasswordErrMsg] = useState('');
  const [confirmPasswordErrMsg, setConfirmPasswordErrMsg] = useState('');

  const {name, email, password, confirmPassword} = formData;

  const navigate = useNavigate();

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value
    }));
  }

  const onSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/
    const passwordRegex = /^(?=.*[a-z])(?=.*\d).{8,}$/;
    let hasError = false;

    // Validation
    if (!name) {
      hasError = true;
      setNameError(true);
      setNameErrMsg('Name is missing');
    } else {
      setNameError(false);
      setNameErrMsg('');
    }

    if(!email) {
      hasError = true;
      setEmailError(true);
      setEmailErrMsg('Email is missing');
    } else if(!email.match(emailRegex)) {
      hasError = true;
      setEmailError(true);
      setEmailErrMsg('Invalid Email');
    } else {
      setEmailError(false);
      setEmailErrMsg('');
    }

    if(!password) {
      hasError = true;
      setPasswordError(true);
      setPasswordErrMsg('Password is missing');
    } else if(!password.match(passwordRegex)) {
      hasError = true;
      setPasswordError(true);
      setPasswordErrMsg("Password doesn't meet the requirement");
    } else {
      setPasswordError(false);
      setPasswordErrMsg('');
    }

    if(password !== confirmPassword) {
      hasError = true;
      setConfirmPasswordError(true);
      setConfirmPasswordErrMsg('Passwords do not match');
    } else {
      setConfirmPasswordError(false);
      setConfirmPasswordErrMsg('');
    }

    if (!hasError) {
      try {
        const auth = getAuth();

        createUserWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            const user = userCredential.user;
            updateProfile(auth.currentUser, {
              displayName: name
            });

            // Save data to firestore
            const formDataCopy = {...formData}
            delete formDataCopy.confirmPassword
            formDataCopy.timestamp = serverTimestamp();
            setDoc(doc(db, 'users', user.uid), formDataCopy);

            navigate('/');
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(`error ${errorCode}: ${errorMessage}`);
            toast.error('Something Went Wrong With Registration');
        });

      } catch (error) {
        toast.error('Something Went Wrong With Registration');
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
          <p className='message'>Welcome!</p>
          <form className='signin-form' onSubmit={onSubmit}>
            <div className="input-div">
              <input
                type='text'
                className={`signin-input ${nameError ? 'input_error' : ''}`}
                placeholder='Name'
                id='name'
                value={name}
                onChange={onChange}
              />
              {nameError ? (<p className="input-error-message">{nameErrMsg}</p>) : (<></>)}
            </div>
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
            <div className='nput-div password-input-div'>
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
            <div className='input-div password-input-div'>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className={`signin-input ${confirmPasswordError ? 'input_error' : ''}`}
                placeholder='Confirm Password'
                id='confirmPassword'
                value={confirmPassword}
                onChange={onChange}
              />
              <div
                className='show-password'
                onClick={() => setShowConfirmPassword((prevState) => !prevState)}
              >
                {showConfirmPassword ? (<FaIcon icon={faEye} />) : (<FaIcon icon={faEyeSlash} />)}
              </div>
              {confirmPasswordError ? (<p className="input-error-message">{confirmPasswordErrMsg}</p>) : (<></>)}
            </div>
            <div className='signUpBar'>
              <button className='btn btn_sign_up'>
                Sign Up
              </button>
            </div>
          </form>
          <OAuth />
          <Link to='/sign-in'>
            <p className='register-link'>Sign In Instead</p>
          </Link>
        </main>
      </div>
    </>
  )
}

export default SignUp