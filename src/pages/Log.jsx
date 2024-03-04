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

function Log({currentPage}) {

  const auth = getAuth();
  const params = useParams();
  const isMounted = useRef(true);
  const navigate = useNavigate();

  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [logDate, setLogDate] = useState("");
  const [isPlan, setIsPlan] = useState(false);
  const [formData, setFormData] = useState({
    location: '',
    date: Date.now(),
    purpose: '',
    course: '',
    buddy: {},
    maxDepth: 0,
    entryTime: Date.now(),
    exitTime: Date.now(),
    weight: 0,
    tankPressureStart: 0,
    tankPressureEnd: 0,
    weather: '',
    temperature: 0,
    waterTemperature: 0,
    visibility: 0,
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
    entryTime,
    exitTime,
    weight,
    tankPressureStart,
    tankPressureEnd,
    weather,
    temperature,
    waterTemperature,
    visibility,
    note
  } = formData;

  const purposes = ['training', 'recreational', 'technical'];

  useEffect(() => {
    setUser(auth.currentUser);
  }, []);

  useEffect(() => {
    setLoading(true);
    const fetchLog = async () => {
      // Create reference
      const docRef = doc(db, 'logs', params.logId);
      // Execute query
      const docSnap = await getDoc(docRef);

      if(docSnap.exists()) {
        setLog(docSnap.data());
        setFormData({ ...docSnap.data()});
        setLogDate(moment.unix(docSnap.data()['date'].seconds).format("YYYY-MM-DD"));
        setLoading(false);
        if (docSnap.data()['isPlan']) {
          setIsPlan(true);
          setEditing(true);
        }
      } else {
        navigate('/logs');
        toast.error('Log does not exist');
      }
    }

    fetchLog();
  }, []);

  // Redirect if listing is not user's
  useEffect(() => {
    if (log && log.userRef !== auth.currentUser.uid) {
      navigate('/');
    }
  }, []);

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

  const onCancelBtnClick = () => {
    if (isPlan) {
      navigate(`/plan/${params.logId}`);
    } else {
      setEditing(false);
    }
  }

  const onSubmit = async (e) => {
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
    const docRef = doc(db, 'logs', params.logId);
    await updateDoc(docRef, formData);
    setLoading(false);
    setEditing(false);
    navigate('/logs');
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
      console.log(e.target.value)
      setFormData((prevState) => ({
        ...prevState,
        ['date']: Timestamp.fromMillis(Date.parse(e.target.value))
      }));
    } else if ((e.target.id === "entryTime") || (e.target.id === "exitTime")) {
      const dateTime = new Date(`${logDate} ${e.target.value}`);
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: Timestamp.fromDate(dateTime),
      }));

    } else {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value,
      }));
    }
  }

  const onLogDateChange = (e) => {
    setLogDate(e.target.value);
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
          <div className='background-container background-container_log'>
          </div>
          <div className='background-cover'>
            <div className='btn-container btn-container_log'>
              <button style={{display: editing ? "none" : "block"}} className='btn btn_back_home' onClick={() => navigate('/logs')}>Back To List</button>
              <button style={{display: editing ? "none" : "block"}} className='btn' onClick={onEditBtnClick}>Edit</button>
              <button style={{display: editing ? "block" : "none"}} className='btn btn_cancel' onClick={onCancelBtnClick}>Cancel</button>
            </div>
            <form className="form-container" onSubmit={onSubmit}>
              <div className="form-page" id="logpage_1">
                <div className="form-category-box">
                  <div className="form-box">
                    <label className="form-label" htmlFor="location">Location:</label>
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
                    <label className="form-label" htmlFor="date">Date:</label>
                    <div className='input-box_log'>
                      <input
                        className={`input ${editing ? "" : "input_disabled"}`}
                        type="date"
                        id="date"
                        value={date ? moment.unix(date.seconds).format("YYYY-MM-DD") : null}
                        onChange={e => {onMutate(e); onLogDateChange(e)}}
                        required
                      />
                      <p className="error-msg">{dateErrMsg}</p>
                    </div>
                  </div>
                </div>
                <div className="form-category-box">
                  <div className="form-box">
                    <label className="form-label" htmlFor="purpose">Purpose:</label>
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
                    <label className="form-label" htmlFor="course">Course:</label>
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
                    <label className="form-label" htmlFor="buddy1">1:</label>
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
                    <label className="form-label" htmlFor="buddy2">2:</label>
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
              </div>
              <div className="form-page" id="logpage_2">
                <div className="form-category-box">
                  <div className="form-box">
                    <label className="form-label" htmlFor="maxDepth">Max Depth (m):</label>
                    <div className='input-box_log'>
                      <input
                        className={`input input_sm ${editing ? "" : "input_disabled"}`}
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
                  <label className="form-label" htmlFor="entryTime">Entry Time:</label>
                    <div className='input-box_log'>
                      <input
                        className={`input ${editing ? "" : "input_disabled"}`}
                        type="time"
                        id="entryTime"
                        value={entryTime ? moment.unix(entryTime.seconds).format("HH:mm:ss") : null}
                        onChange={onMutate}
                      />
                    </div>
                  </div>
                  <div className="form-box">
                    <label className="form-label" htmlFor="exitTime">Exit Time:</label>
                    <div className='input-box_log'>
                      <input
                        className={`input ${editing ? "" : "input_disabled"}`}
                        type="time"
                        id="exitTime"
                        value={exitTime ? moment.unix(exitTime.seconds).format("HH:mm:ss") : null}
                        onChange={onMutate}
                      />
                    </div>
                  </div>
                  <div className="form-box">
                    <label className="form-label" htmlFor="duration">Duration:</label>
                    <p className="input input_duration" id="duration" >{entryTime && exitTime ? moment.unix(exitTime.seconds).diff(moment.unix(entryTime.seconds), 'minutes') + " minutes" : null } </p>
                  </div>
                </div>
                <div className="form-category-box">
                  <div className="form-box">
                    <label className="form-label" htmlFor="weight">Weight (kg):</label>
                    <div className='input-box_log'>
                      <input
                        className={`input input_sm ${editing ? "" : "input_disabled"}`}
                        type="num"
                        id="weight"
                        value={weight}
                        onChange={onMutate}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="form-page" id="logpage_3">
                <div className="form-category-box">
                  <p className='form-heading'>Tank Pressure</p>
                  <div className="form-box">
                    <label className="form-label" htmlFor="tankPressureStart">Start:</label>
                    <div className='input-box_log'>
                      <input
                        className={`input input_sm ${editing ? "" : "input_disabled"}`}
                        type="num"
                        id="tankPressureStart"
                        value={tankPressureStart}
                        onChange={onMutate}
                      />
                    </div>
                  </div>
                  <div className="form-box">
                    <label className="form-label" htmlFor="tankPressureEnd">End:</label>
                    <div className='input-box_log'>
                      <input
                        className={`input input_sm ${editing ? "" : "input_disabled"}`}
                        type="num"
                        id="tankPressureEnd"
                        value={tankPressureEnd}
                        onChange={onMutate}
                      />
                    </div>
                  </div>
                </div>
                <div className="form-category-box">
                  <div className="form-box">
                    <label className="form-label" htmlFor="weather">Weather:</label>
                    <div className='input-box_log'>
                      <input
                        className={`input ${editing ? "" : "input_disabled"}`}
                        type="text"
                        id="weather"
                        value={weather}
                        onChange={onMutate}
                      />
                    </div>
                  </div>
                </div>
                <div className="form-category-box">
                  <p className='form-heading'>Temperature</p>
                  <div className="form-box">
                    <label className="form-label" htmlFor="temperature">Air:</label>
                    <div className='input-box_log'>
                      <input
                        className={`input input_sm ${editing ? "" : "input_disabled"}`}
                        type="num"
                        id="temperature"
                        value={temperature}
                        onChange={onMutate}
                      />
                    </div>
                  </div>
                  <div className="form-box">
                    <label className="form-label" htmlFor="waterTemperature">Water:</label>
                    <div className='input-box_log'>
                      <input
                        className={`input input_sm ${editing ? "" : "input_disabled"}`}
                        type="num"
                        id="waterTemperature"
                        value={waterTemperature}
                        onChange={onMutate}
                      />
                    </div>
                  </div>
                </div>
                <div className="form-category-box">
                  <div className="form-box">
                    <label className="form-label" htmlFor="visibility">Visibility:</label>
                    <div className='input-box_log'>
                      <input
                        className={`input input_sm ${editing ? "" : "input_disabled"}`}
                        type="num"
                        id="visibility"
                        value={visibility}
                        onChange={onMutate}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="form-page" id="logpage_4">
                <div className="form-category-box">
                  <div className="form-box form-box_textarea">
                    <label className="form-label form-label_note" htmlFor="note">Note:</label>
                    <textarea
                      className={`input textarea ${editing ? "" : "input_disabled"}`}
                      id="note"
                      value={note}
                      onChange={onMutate}
                    />
                  </div>
                </div>
                <button className='btn btn_submit' style={{display: editing ? "block" : "none"}}>Submit</button>
              </div>
            </form>
            <p className='credit'>Photo by <a href="https://unsplash.com/@francesco_ungaro?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash" target="_blank" rel="noopener noreferrer">Francesco Ungaro</a> on <a href="https://unsplash.com/photos/blue-and-black-fish-under-water-iiAvy5Eu5vk?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash" target="_blank" rel="noopener noreferrer">Unsplash</a></p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default Log