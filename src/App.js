import app from "./firebase.config";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Home from './pages/Home';
import LogList from './pages/LogList';
import Log from './pages/Log';
import AddLog from "./pages/AddLog";
import PlanList from './pages/PlanList';
import Plan from './pages/Plan';
import AddPlan from "./pages/AddPlan";
import Profile from './pages/Profile';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ForgotPassword from "./pages/ForgotPassword";
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<PrivateRoute />} >
            <Route path='/' element={<Home currentPage={'home'}/>} />
          </Route>
          <Route path='/logs' element={<PrivateRoute />} >
            <Route path='/logs' element={<LogList currentPage={'logs'} />} />
          </Route>
          <Route path='/log' element={<PrivateRoute />} >
            <Route path='/log/:logId' element={<Log currentPage={'log'} />} />
          </Route>
          <Route path='/add-log' element={<PrivateRoute />} >
            <Route path='/add-log' element={<AddLog currentPage={'add log'} />} />
          </Route>
          <Route path='/plans' element={<PrivateRoute />} >
            <Route path='/plans' element={<PlanList currentPage={'plans'} />} />
          </Route>
          <Route path='/plan' element={<PrivateRoute />} >
            <Route path='/plan/:planId' element={<Plan  currentPage={'plan'}/>} />
          </Route>
          <Route path='/add-plan' element={<PrivateRoute />} >
            <Route path='/add-plan' element={<AddPlan currentPage={'add plan'} />} />
          </Route>
          <Route path='/profile' element={<PrivateRoute />} >
            <Route path='/profile' element={<Profile currentPage={'profile'} />} />
          </Route>
          <Route path='/sign-in' element={<SignIn currentPage={'sign in'} />} />
          <Route path='/sign-up' element={<SignUp currentPage={'sign up'} />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
        </Routes>
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;
