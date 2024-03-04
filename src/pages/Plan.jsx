import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase.config';
import { toast } from 'react-toastify';
import moment from 'moment';
import Header from '../components/Header';
import Footer from "../components/Footer";
import PageHeading from '../components/PageHeading';

function Plan({ currentPage }) {

  const auth = getAuth();
  const params = useParams();
  const isMounted = useRef(true);
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [planDate, setPlanDate] = useState("");
  const [formData, setFormData] = useState({
    location: '',
    date: Date.now(),
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

  useEffect(() => {
    setLoading(true);
    const fetchPlan= async () => {
      // Create reference
      const docRef = doc(db, 'logs', params.planId);
      // Execute query
      const docSnap = await getDoc(docRef);

      if(docSnap.exists()) {
        setPlan(docSnap.data());
        setFormData({ ...docSnap.data()});
        setPlanDate(moment.unix(docSnap.data()['date'].seconds).format("YYYY-MM-DD"));
        setLoading(false);
      } else {
        navigate('/plans');
        toast.error('Plan does not exist');
      }
    }

    fetchPlan();
  }, []);

  // Redirect if plan is not user's
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
          setFormData({...formData, userRef: user.uid});
        } else {
          navigate('/sign-in');
        }
      })
    }

    return () => {
      isMounted.current = false;
    }
  }, [isMounted]);

  const onEditBtnClick = () => {
    setEditing(true);
  }

  const onEditAsLogBtnClick = () => {
    navigate(`/log/${params.planId}`);
  }

  const onCancelBtnClick = () => {
    setEditing(false);
  }

  const onSubmit = async (e) => {
    console.log('sub');
    e.preventDefault();

    setLoading(true);


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

    // Update listing
    const docRef = doc(db, 'logs', params.planId);
    await updateDoc(docRef, formData);
    setLoading(false);
    setEditing(false);
    toast.success('Log updated');
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
        <PageHeading currentPage={currentPage}/>
        <div className='background-container-box'>
          <div className='background-container background-container_plan'>
          </div>
          <div className='background-cover'>
            <div className='btn-container btn-container_plan'>
              <button style={{display: editing ? "none" : "block"}} className='btn btn_back_home' onClick={() => navigate('/plans')}>Back To List</button>
              <div className='btn-box_right'>
                <button style={{display: editing ? "none" : "block"}} className='btn btn_edit_plan' onClick={onEditBtnClick}>Edit</button>
                <button style={{display: editing ? "none" : "block"}} className='btn btn_edit_plan-to-log' onClick={onEditAsLogBtnClick}>Edit as Log</button>
                <button style={{display: editing ? "block" : "none"}} className='btn btn_cancel' onClick={onCancelBtnClick} >cancel</button>
              </div>
            </div>
            <form className='form-container' onSubmit={onSubmit}>
              <div className="form-category-box">
                <div className="form-box">
                  <label htmlFor="location">Location:</label>
                  <div className='input-box_log'>
                    <input
                      className={`input ${editing ? "" : "input_disabled"}`}
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
                      className={`input ${editing ? "" : "input_disabled"}`}
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
                      className={`input ${editing ? "" : "input_disabled"}`}
                      type="text"
                      id="purpose"
                      value={purpose}
                      maxLength='32'
                      onChange={onMutate}
                      required
                    >
                    {purposes.map((val) => (
                    <option value={val} selected={purpose == val}>{val}</option>
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
                      className={`input ${editing ? "" : "input_disabled"}`}
                      type="text"
                      id="course"
                      value={course}
                      onChange={onMutate}
                    />
                  </div>
                </div>
              </div>
              <div className="form-category-box">
                <p className='form-heading'>Buddy</p>
                <div className="form-box">
                  <label htmlFor="buddy1">1:</label>
                  <div className='input-box_log'>
                    <input
                      className={`input ${editing ? "" : "input_disabled"}`}
                      type="text"
                      id="buddy1"
                      value={buddy[0]}
                      onChange={onMutate}
                    />
                  </div>
                </div>
                <div className="form-box">
                  <label htmlFor="buddy2">2:</label>
                  <div className='input-box_log'>
                    <input
                      className={`input ${editing ? "" : "input_disabled"}`}
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
                      className={`input ${editing ? "" : "input_disabled"}`}
                      type="number"
                      id="maxDepth"
                      value={maxDepth}
                      onChange={onMutate}
                    />
                  </div>
                </div>
              </div>
              <div className="form-category-box">
                <div className="form-box form-box_textarea">
                  <label className="form-label_note" htmlFor="note">Note:</label>
                  <textarea
                    className={`input textarea ${editing ? "" : "input_disabled"}`}
                    id="note"
                    value={note}
                    onChange={onMutate}
                  />
                </div>
              </div>
              <button className='btn btn_submit' style={{display: editing ? "block" : "none"}}>submit</button>
            </form>
            <p className='credit'>Photo by <a href="https://unsplash.com/@bibipace?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash" target="_blank" rel="noopener noreferrer">Bibi Pace</a> on <a href="https://unsplash.com/photos/blue-and-black-fish-under-water-iiAvy5Eu5vk?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash" target="_blank" rel="noopener noreferrer">Unsplash</a></p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default Plan