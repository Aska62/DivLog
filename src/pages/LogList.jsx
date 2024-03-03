import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy, limit, startAfter } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase.config';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import Footer from "../components/Footer";
import PageHeading from '../components/PageHeading';
import Card from '../components/Card';

function LogList( {currentPage} ) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastFetchedLog, setLastFetchedLog] = useState(null);
  const [hasUnloadedLog, setHasUnloadedLog] = useState(true);

  const logsFetched = useRef(false);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    if (logsFetched.current === false) {
      fetchLogs();
      logsFetched.current = true;
    }
  }, []);

  const fetchLogs = async () => {
    try {
      // Create reference
      const logRef = collection(db, 'logs');

      // Create query
      let q = query(
        logRef,
        where('isPlan', '==', false),
        where('userRef', '==', auth.currentUser.uid),
        orderBy('date', 'asc'),
        orderBy('entryTime', 'asc'),
        limit(13) // Display 12 logs. 13th is for judging if more unloaded log left
      );

      // fetch log following the last fetched log
      if (lastFetchedLog) {
        q = query(
          q,
          startAfter(lastFetchedLog)
        );
      }

      // Execute query
      const querySnap = await getDocs(q);

      // Set last visible log
      const lastVisible = querySnap.docs[querySnap.docs.length -2];
      setLastFetchedLog(lastVisible);

      // Set if there are more logs on DB
      const docLength13 = querySnap.docs.length === 13;
      setHasUnloadedLog(docLength13);

      // Add newly fetched logs to displayed list
      let newLogList = [...logs];
      querySnap.forEach((doc) => {
        newLogList = [...newLogList, {
          id: doc.id,
          data: doc.data()
        }]
      });

      // Remove 13th if exists
      if (docLength13) {
        newLogList.pop();
      }

      // Set logs to display
      setLogs(newLogList);
      setLoading(false);
    } catch (error) {
      toast.error('Could not fetch logs');
    }
  }

  if(loading) {
    return (
      <p>Loading...</p>
    )
  }
  return (
    <>
      <Header currentPage={currentPage} />
      <main className='main main_logs'>
        <PageHeading currentPage={currentPage}/>
        <div className='background-container-box'>
          <div className='background-container background-container_logs'>
          </div>
          <div className='background-cover'>
            <div className='btn-container'>
              <button className='btn btn_add' onClick={() => navigate('/add-log')}>Add New</button>
            </div>
            {logs && logs.length > 0 ? (
              <>
                <div className='container_logs'>
                  {logs.map((log, index) => (
                    <Card log={log} cardType={'log'} logNumber={index + 1} key={index} />
                  ))}
                </div>
                {hasUnloadedLog && (
                  <button className='btn btn_load-more' onClick={fetchLogs} >Load More</button>
                )}
              </>
            ) : (
              <p>No logs yet</p>
            )}
            <p className='credit'>Photo by <a href="https://unsplash.com/@biorock_indonesia?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash" target="_blank" rel="noopener noreferrer">Biorock Indonesia</a> on <a href="https://unsplash.com/photos/blue-and-black-fish-under-water-iiAvy5Eu5vk?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash" target="_blank" rel="noopener noreferrer">Unsplash</a></p>
          </div>
        </div>
      </main>
      <Footer/>
    </>
  )
}

export default LogList