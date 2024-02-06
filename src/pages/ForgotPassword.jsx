import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { toast } from 'react-toastify';

function ForgotPassword() {
  const [email, setEmail] = useState('');

  const onChange = (e) => setEmail(e.target.value);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      toast.success('Email was sent');
    } catch (error) {
      toast.error('Could not send reset email');
    }
  }

  return (
    <div className='page-cntainer'>
      <main className='sign-in-container'>
        <div className="logo-container_signin">
          <div className="logo logo_signin_goggle"></div>
          <h1 className='logo logo_signin_title'>DivLog</h1>
        </div>
        <h2 className='message'>Forgot Password</h2>
        <form className="signin-form" onSubmit={onSubmit}>
          <input
            type='email'
            className='emailInput'
            placeholder='Email'
            id='email'
            value={email}
            onChange={onChange}
          />

          <div className='signInBar'>
            <button className='btn btn_sign_in'>
              send reset link
            </button>
          </div>
        </form>
        <Link className='forgotPasswordLink' to='/sign-in'>
          <p className='register-link'>Sign In Instead</p>
        </Link>
      </main>
    </div>
  )
}

export default ForgotPassword