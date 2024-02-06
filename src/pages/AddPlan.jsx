import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, addDoc, collection, Timestamp, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.config';
import { toast } from 'react-toastify';
import moment from 'moment';
import Header from '../components/Header';
import Footer from "../components/Footer";
import PageHeading from '../components/PageHeading';

function AddPlan({ currentPage }) {

  const auth = getAuth();
  const isMounted = useRef(true);
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [planDate, setPlanDate] = useState("");
  const [formData, setFormData] = useState({
    location: '',
    date: moment(Date.now()).format("yyyy-MM-dd"),
    purpose: '',
    course: '',
    buddy: {},
    maxDepth: 0,
    note: ''
  });

  const [locationError, setLocationError] = useState(false);
  const [dateError, setDateError] = useState(false);
  const [locationErrMsg, setLocationErrMsg] = useState('');
  const [dateErrMsg, setDateErrMsg] = useState('');

  const {
    location,
    date,
    purpose,
    course,
    buddy,
    maxDepth,
    note
  } = formData;

  const purposes = ['training', 'recreational', 'technical'];

  useEffect(() => {
    setUser(auth.currentUser);
  }, []);

  // Redirect if listing is not user's
  useEffect(() => {
    if (plan && plan.userRef !== auth.currentUser.uid) {
      navigate('/');
    }
  });

  // Sets userRef to logged in user
  useEffect(() => {
    if(isMounted) {
      onAuthStateChanged(auth, (user) => {
        if(user) {
          setFormData({...formData, userRef: user.uid, isPlan: true});
        } else {
          navigate('/sign-in');
        }
      })
    }

    return () => {
      isMounted.current = false;
    }
  }, [isMounted]);

  const onSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    const formDataCopy = {
      ...formData,
      userRef: user.uid,
    }

    // validation
    let hasError = false;
    if(!location) {
      hasError = true;
      setLocationError(true);
      setLocationErrMsg('Location is missing');
    } else if (!date) {
      hasError = true;
      setDateError(true);
      setDateErrMsg('Date is missing');
    } else {
      hasError = false;
      setLocationError(false);
      setLocationErrMsg('');
      setDateError(false);
      setDateErrMsg('');
    }

    if(hasError) {
      return;
    }

    // Set buddy as empty array if buddy1 and buddy2 are undefined
    if (!formDataCopy['buddy'][0] && !formDataCopy['buddy'][1]) {
      formDataCopy['buddy'] = [];
    } else {
      // Shift buddy2 to buddy1 if buddy1 is undefined
      if (!formDataCopy['buddy'][0]) {
        formDataCopy['buddy'].splice(0, 1);

        // Set buddy as empty array if buddy1 is still undefined
        if (!formDataCopy['buddy'][0]) {
          formDataCopy['buddy'] = [];
        }
      } else if (!formDataCopy['buddy'][1]) {
        // Remove buddy2 if undefined;
        formDataCopy['buddy'].splice(1, 1);
      }
    }
    console.log(formDataCopy);
    // Add log
    const docRef = await addDoc(collection(db, 'logs'), formDataCopy);

    setLoading(false);
    toast.success('Plan added');
    navigate(`/plan/${docRef.id}`)
  }

  const onMutate = e => {
    let boolean = null;

    if(e.target.value === 'true') {
      boolean = true
    }

    if(e.target.value === 'false') {
      boolean = false
    }

    if(e.target.id === "buddy1") {
      setFormData((prevState) => ({
        ...prevState,
        ['buddy']: [
          e.target.value,
          prevState.buddy[1]
        ]
      }));
    } else if(e.target.id === "buddy2") {
      setFormData((prevState) => ({
        ...prevState,
        ['buddy']: [
          prevState.buddy[0],
          e.target.value
        ]
      }));
    } else if (e.target.id === "date") {
      setFormData((prevState) => ({
        ...prevState,
        ['date']: Timestamp.fromMillis(Date.parse(e.target.value))
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value,
      }));
    }
  }

  const onPlanDateChange = (e) => {
    setPlanDate(e.target.value);
  }

  if(loading) {
    return (
      <p>Loading...</p>
    )
  }
  return (
    <>
      <Header />
      <main className='main main_log'>
        <div className='btn-container'>
          <button className='btn btn_cancel' onClick={() => navigate('/plans')}>Back To List</button>
        </div>
        <PageHeading currentPage={currentPage}/>
        <form className='form-container' onSubmit={onSubmit}>
          <div className="form-category-box">
            <div className="form-box">
              <label htmlFor="location">Location:</label>
              <div className='input-box_log'>
                <input
                  className="input"
                  type="text"
                  id="location"
                  value={location}
                  maxLength='32'
                  onChange={onMutate}
                  required
                />
                <p className="error-msg">{locationErrMsg}</p>
              </div>
            </div>
          </div>
          <div className="form-category-box">
            <div className="form-box">
              <label htmlFor="date">Date:</label>
              <div className='input-box_log'>
                <input
                  className="input"
                  type="date"
                  id="date"
                  value={moment.unix(date.seconds).format("YYYY-MM-DD")}
                  onChange={e => {onMutate(e); onPlanDateChange(e)}}
                  required
                />
                <p className="error-msg">{dateErrMsg}</p>
              </div>
            </div>
          </div>
          <div className="form-category-box">
            <div className="form-box">
              <label htmlFor="purpose">Purpose:</label>
              <div className='input-box_log'>
                <select
                  className="input"
                  type="text"
                  id="purpose"
                  value={purpose}
                  maxLength='32'
                  onChange={onMutate}
                  required
                >
                {purposes.map((val) => (
                <option value={val} selected={purpose === val}>{val}</option>
                ))}
                </select>
              </div>
              </div>
            </div>
          <div className="form-category-box">
            <div className="form-box">
              <label htmlFor="course">Course:</label>
              <div className='input-box_log'>
                <input
                  className="input"
                  type="text"
                  id="course"
                  value={course}
                  onChange={onMutate}
                />
              </div>
            </div>
          </div>
          <div className="form-category-box">
            <div className="form-box">
              <label htmlFor="buddy1">Buddy 1:</label>
              <div className='input-box_log'>
                <input
                  className="input"
                  type="text"
                  id="buddy1"
                  value={buddy[0]}
                  onChange={onMutate}
                />
              </div>
            </div>
            <div className="form-box">
              <label htmlFor="buddy2">Buddy 2:</label>
              <div className='input-box_log'>
                <input
                  className="input"
                  type="text"
                  id="buddy2"
                  value={buddy[1]}
                  onChange={onMutate}
                />
              </div>
            </div>
          </div>
          <div className="form-category-box">
            <div className="form-box">
              <label htmlFor="maxDepth">Max Depth (m):</label>
              <div className='input-box_log'>
                <input
                  className="input"
                  type="number"
                  id="maxDepth"
                  value={maxDepth}
                  onChange={onMutate}
                />
              </div>
            </div>
          </div>
          <div className="form-category-box">
            <div className="form-box">
              <label htmlFor="note">Note:</label>
              <textarea
                className="input textarea"
                id="note"
                value={note}
                onChange={onMutate}
              />
            </div>
          </div>
          <button className='btn btn_submit'>submit</button>
        </form>
    </main>
    <Footer />
  </>
  )
}

export default AddPlan