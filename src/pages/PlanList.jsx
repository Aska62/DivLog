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
import ToTopBtn from '../components/ToTopBtn';

function PlanList({currentPage, controlToTopBtnVisibililty, showToTopBtn}) {
  const [plans, setPlans] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastFetchedPlan, setLastFetchedPlan] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // const params = useParams();
  const auth = getAuth();

  useEffect(() => {
    setUser(auth.currentUser);

    const fetchPlans = async () => {
      try {
        // Create reference
        const planRef = collection(db, 'logs');

        // Create query
        const q = query(
          planRef,
          where('isPlan', '==', true),
          where('userRef', '==', auth.currentUser.uid),
          orderBy('date', 'asc'),
        );

        // Execute query
        const querySnap = await getDocs(q);

        const lastVisible = querySnap.docs[querySnap.docs.length -1];
        setLastFetchedPlan(lastVisible);

        let plans = [];

        querySnap.forEach((doc) => {
          return plans.push({
            id: doc.id,
            data: doc.data()
          });
        });

        setPlans(plans);
        setLoading(false);
      } catch (error) {
        toast.error('Could not fetch plans');
      }
    }

    fetchPlans();
  }, []);

  if(loading) {
    return (
      <p>Loading...</p>
    )
  }
  return (
    <>
      <Header currentPage={currentPage} />
      <main className='main main_plans'>
        <PageHeading currentPage={currentPage}/>
        <div className='background-container-box'>
          <div className='background-container background-container_plans'>
          </div>
          <div className='background-cover' onScroll={(e) => controlToTopBtnVisibililty(e)}>
            <div className='btn-container'>
              {/* <button className='btn btn_back_home' onClick={() => navigate('/')}>Back To Home</button> */}
              <button className='btn btn_add' onClick={() => navigate('/add-plan')}>Add New</button>
            </div>
            {plans && plans.length > 0 ? (
              <>
                <div className='container_logs'>
                  {plans.map((plan, index) => (
                    <Card log={plan} cardType={'plan'} logNumber={index + 1} key={index} />
                  ))}
                </div>
              </>
            ) : (
              <p>No plans currently</p>
            )}
            <p className='credit'>Photo by <a href="https://unsplash.com/@layaclode?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash" target="_blank" rel="noopener noreferrer">Laya Clode</a> on <a href="https://unsplash.com/photos/person-sitting-in-front-of-body-of-water-AwfxsOAkHXI?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash" target="_blank" rel="noopener noreferrer">Unsplash</a></p>
          </div>
        </div>
      </main>
      <Footer/>
    </>
  )
}

export default PlanList