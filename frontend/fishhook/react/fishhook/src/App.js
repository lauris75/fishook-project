import './App.css';
import Login from './login/Login.jsx';
import Register from './register/Register.jsx';
import Home from './home/Home.jsx';
import Profile from './profile/Profile.jsx';
import Group from './group/Group.jsx';
import Groups from './group/Groups.jsx';
import Marketplace from './marketplace/Marketplace.jsx';
import Chat from './chat/Chat.jsx';
import Fish from './fish/Fish.jsx';
import Lake from './lake/Lake.jsx';
import Map from './map/Map.jsx';
import UsefulInfo from './usefulInfo/UsefulInfo.jsx';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
  useLocation
} from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import TopBar from "./components/topBar/TopBar.jsx";
import NavBar from "./components/navBar/NavBar.jsx";
import RightBar from "./components/rightBar/RightBar.jsx";

function App() {
  const { currentUser } = useContext(AuthContext);

  const Layout = () => {
    return(
      <div>
        <TopBar/>
        <div style={{display: "flex"}}>
          <NavBar/>
          <div style={{flex: 6}}>
            <Outlet/>
          </div>
          <RightBar/>
        </div>
      </div>
    )
  }

  const ProtectedRoute = ({ children }) => {
    const location = useLocation();

    if (!currentUser) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    return children;
  }

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <Layout/>
        </ProtectedRoute>
      ),
      children: [
        {
          path: "/",
          element: <Home/>
        },
        {
          path: "/profile/:id",
          element: <Profile/>
        },
        {
          path: "/group",
          element: <Groups/>
        },
        {
          path: "/group/:id",
          element: <Group/>
        },
        {
          path: "/marketplace",
          element: <Marketplace/>
        },
        {
          path: "/chat",
          element: <Chat/>
        },
        {
          path: "/map",
          element: <Map/>
        },
        {
          path: "/fish",
          element: <Fish/>
        },
        {
          path: "/fish/:id",
          element: <Fish/>
        },
        {
          path: "/lake",
          element: <Lake/>
        },
        {
          path: "/lake/:id",
          element: <Lake/>
        },
        {
          path: "/usefulinfo",
          element: <UsefulInfo/>
        },
        {
          path: "/usefulinfo/:id",
          element: <UsefulInfo/>
        }
      ]
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
  ]);

  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;