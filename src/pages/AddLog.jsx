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

function AddLog({ currentPage }) {

  const auth = getAuth();
  const isMounted = useRef(true);
  const navigate = useNavigate();

  const [log, setLog] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logDate, setLogDate] = useState("");
  const [formData, setFormData] = useState({
    location: '',
    date: moment(Date.now()).format("yyyy-MM-dd"),
    purpose: '',
    course: '',
    buddy: {},
    maxDepth: 0,
    entryTime: moment(Date.now()).format("HH:mm"),
    exitTime: moment(Date.now()).format("HH:mm"),
    weight: 0,
    tankPressureStart: 0,
    tankPressureEnd: 0,
    weather: '',
    temperature: 0,
    waterTemperature: 0,
    visibility: 0,
    note: '',
    isPlan: false
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
    note,
    isPlan
  } = formData;

  const purposes = ['training', 'recreational', 'technical'];

  useEffect(() => {
    setUser(auth.currentUser);
  }, []);

  // Redirect if listing is not user's
  useEffect(() => {
    if (log && log.userRef !== auth.currentUser.uid) {
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

    // Add log
    const docRef = await addDoc(collection(db, 'logs'), formDataCopy);

    setLoading(false);
    toast.success('Log added');
    navigate('/logs');
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
            <div className='btn-container'>
              <button className='btn btn_cancel' onClick={() => navigate('/logs')}>Back To List</button>
            </div>
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
                      onChange={e => {onMutate(e); onLogDateChange(e)}}
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
                    {purposes.map((val, index) => (
                    <option value={val} selected={purpose === val} key={index}>{val}</option>
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
                <p className='form-heading'>Buddy</p>
                <div className="form-box">
                  <label htmlFor="buddy1">1:</label>
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
                  <label htmlFor="buddy2">2:</label>
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
                  <label htmlFor="entryTime">Entry Time:</label>
                  <div className='input-box_log'>
                    <input
                      className="input"
                      type="time"
                      id="entryTime"
                      value={moment.unix(entryTime.seconds).format("HH:mm")}
                      onChange={onMutate}
                    />
                  </div>
                </div>
                <div className="form-box">
                  <label htmlFor="exitTime">Exit Time:</label>
                  <div className='input-box_log'>
                    <input
                      className="input"
                      type="time"
                      id="exitTime"
                      value={moment.unix(exitTime.seconds).format("HH:mm")}
                      onChange={onMutate}
                    />
                  </div>
                </div>
                <div className="form-box">
                  <label htmlFor="duration">Duration:</label>
                  <p id="duration" >{moment.unix(exitTime.seconds).diff(moment.unix(entryTime.seconds), 'minutes') } minutes</p>
                </div>
              </div>
              <div className="form-category-box">
                <div className="form-box">
                  <label htmlFor="weight">Weight (kg):</label>
                  <div className='input-box_log'>
                    <input
                      className="input"
                      type="num"
                      id="weight"
                      value={weight}
                      onChange={onMutate}
                    />
                  </div>
                </div>
              </div>
              <div className="form-category-box">
                <p className='form-heading'>Tank Pressure</p>
                <div className="form-box">
                  <label htmlFor="tankPressureStart">Start:</label>
                  <div className='input-box_log'>
                    <input
                      className="input"
                      type="num"
                      id="tankPressureStart"
                      value={tankPressureStart}
                      onChange={onMutate}
                    />
                  </div>
                </div>
                <div className="form-box">
                  <label htmlFor="tankPressureEnd">End:</label>
                  <div className='input-box_log'>
                    <input
                      className="input"
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
                  <label htmlFor="weather">Weather:</label>
                  <div className='input-box_log'>
                    <input
                      className="input"
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
                  <label htmlFor="temperature">Air:</label>
                  <div className='input-box_log'>
                    <input
                      className="input"
                      type="num"
                      id="temperature"
                      value={temperature}
                      onChange={onMutate}
                    />
                  </div>
                </div>
                <div className="form-box">
                  <label htmlFor="waterTemperature">Water:</label>
                  <div className='input-box_log'>
                    <input
                      className="input"
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
                  <label htmlFor="visibility">Visibility (m):</label>
                  <div className='input-box_log'>
                    <input
                      className="input"
                      type="num"
                      id="visibility"
                      value={visibility}
                      onChange={onMutate}
                    />
                  </div>
                </div>
              </div>
              <div className="form-category-box">
                <label htmlFor="note">Note:</label>
                <textarea
                  className="input textarea"
                  id="note"
                  value={note}
                  onChange={onMutate}
                />
              </div>
              <button className='btn btn_submit'>submit</button>
            </form>
            <p className='credit'>Photo by <a href="https://unsplash.com/@cristianpalmer?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash" target="_blank" rel="noopener noreferrer">Cristian Palmer</a> on <a href="https://unsplash.com/photos/blue-and-black-fish-under-water-iiAvy5Eu5vk?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash" target="_blank" rel="noopener noreferrer">Unsplash</a></p>
          </div>
        </div>
      </main>
    <Footer />
  </>
  )
}

export default AddLog