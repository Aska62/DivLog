import { useState, useEffect } from 'react';
import { getAuth, updateProfile } from 'firebase/auth';
import { updateDoc, getDoc, doc, collection, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from '../firebase.config';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import Footer from "../components/Footer";
import PageHeading from '../components/PageHeading';

function Profile({ currentPage }) {
  const auth = getAuth();
  const navigate = useNavigate();

  const [loggedDive, setLoggedDive] = useState(0);
	const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    certification: '',
    organization: '',
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [nameError, setNameError] = useState(false);
  const [nameErrMsg, setNameErrMsg] = useState('');

  const { name, certification, organization } = formData;

  // Set profile certification, organization
  useEffect(() => {
    setLoading(true);
    const fetchProfile= async () => {
      // Create reference
      const docRef = doc(db, 'users', auth.currentUser.uid);
      // Execute query
      const docSnap = await getDoc(docRef);

      if(docSnap.exists()) {
        setFormData({ ...docSnap.data()});
        setLoading(false);
      } else {
        navigate('/sign-in');
        toast.error('Plan does not exist');
      }
    }

    fetchProfile();
  }, []);

  useEffect(() => {
    const getLoggedDive = async () => {
      try {
        // Create reference
        const logRef = collection(db, 'logs');

        // Create query
        const q = query(
          logRef,
          where('isPlan', '==', false),
          where('userRef', '==', auth.currentUser.uid)
        );

        // Execute query
        const querySnap = await getCountFromServer(q);

        setLoggedDive(querySnap.data().count);
        setLoading(false);
      } catch (error) {
        toast.error('Could not get log count');
      }
    }

    getLoggedDive();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();

    let hasError = false;
    if(!name) {
      hasError = true;
      setNameError(true);
      setNameErrMsg('Name is missing');
    } else {
      setNameError(false);
      setNameErrMsg('');
    }

    if (hasError) {
      return;
    }
      try {
        if(auth.currentUser.displayName !== name) {
          // Update display name in firebase
          await updateProfile(auth.currentUser, {
            displayName: name
          });
        }

        // Update in firestore
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
          name,
          certification,
          organization,
        });

        setEditing(false);
        setNameErrMsg('');

      } catch (error) {
        toast.error('Could not pudate profile details');
      }
    }

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  }

  if(loading) {
    return (
      <p>Loading...</p>
    )
  }

  return (
    <div className='profile'>
      <Header currentPage={currentPage} />
      <main className='main main_profile'>
        <PageHeading currentPage={currentPage}/>
        <div className='background-container-box'>
          <div className='background-container background-container_profile'>
          </div>
          <div className='background-cover'>
            <button className='btn edit-personal-detail' onClick={(e) => {
              editing && onSubmit(e)
              !editing && setEditing((prevState) => !prevState)
            }}>
              {editing ? 'Save' : 'Edit'}
            </button>
            <div className='profile-card'>
              <form>
                <div className="form-box form-box_profile">
                  <label htmlFor="name">Name:</label>
                  <div className="profile-input-box">
                    <input
                      type='text'
                      id='name'
                      className={editing ? 'profile-input_active' : 'profile-input_disabled'}
                      disabled={!editing}
                      value={name}
                      onChange={onChange}
                    />
                    <p className="error-msg error-msg_name">{nameErrMsg}</p>
                  </div>
                </div>
                <div className="form-box form-box_profile">
                  <label htmlFor="name">Logged Dive:</label>
                  <input
                    type='text'
                    id='loggedDive'
                    className='profile-input_disabled'
                    disabled="true"
                    value={loggedDive}
                  />
                </div>
                <div className="form-box form-box_profile">
                  <label htmlFor="certification">Certification:</label>
                  <div className="profile-input-box">
                    <input
                      type='text'
                      id='certification'
                      className={editing ? 'profile-input_active' : 'profile-input_disabled'}
                      disabled={!editing}
                      value={certification}
                      onChange={onChange}
                    />
                  </div>
                </div>
                <div className="form-box form-box_profile">
                  <label htmlFor="organization">Organization:</label>
                  <div className="profile-input-box">
                    <input
                      type='text'
                      id='organization'
                      className={editing ? 'profile-input_active' : 'profile-input_disabled'}
                      disabled={!editing}
                      value={organization}
                      onChange={onChange}
                    />
                  </div>
                </div>

              </form>
            </div>
            <p className='credit'>Photo by Photo by <a href="https://unsplash.com/@nazahery?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash" target="_blank" rel="noopener noreferrer">Nazarizal Mohammad</a> on <a href="https://unsplash.com/photos/people-swimming-in-the-sea-during-daytime-k5Z2AhnRwT8?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash" target="_blank" rel="noopener noreferrer">Unsplash</a></p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Profile