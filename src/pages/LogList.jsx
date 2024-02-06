import { useEffect, useState } from 'react';
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
  const [logs, setLogs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastFetchedLog, setLastFetchedLog] = useState(null);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    setUser(auth.currentUser);

    const fetchLogs = async () => {
      try {
        // Create reference
        const logRef = collection(db, 'logs');

        // Create query
        const q = query(
          logRef,
          where('isPlan', '==', false),
          where('userRef', '==', auth.currentUser.uid),
          orderBy('entryTime', 'desc'),
          limit(10)
        );

        // Execute query
        const querySnap = await getDocs(q);

        const lastVisible = querySnap.docs[querySnap.docs.length -1];
        setLastFetchedLog(lastVisible);

        let logs = [];

        querySnap.forEach((doc) => {
          return logs.push({
            id: doc.id,
            data: doc.data()
          });
        });

        setLogs(logs);
        setLoading(false);
      } catch (error) {
        toast.error('Could not fetch logs');
      }
    }

    fetchLogs();
  }, []);

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
              <div className='container_logs'>
                {logs.map((log, index) => (
                  <Card log={log} cardType={'log'} logNumber={index + 1}/>
                ))}
              </div>
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