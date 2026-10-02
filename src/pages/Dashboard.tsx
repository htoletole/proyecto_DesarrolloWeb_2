import BodyDashboard from "../components/BodyDashboard";
import HeaderDashboard from "../components/HeaderDashboard";
import Navbar from "../components/Navbar";
import "../styles/styles.css";

function Dashboard() {
  return (
    <div className="min-vh-100 w-100 p-2 fondo-dashboard">
      <HeaderDashboard></HeaderDashboard>
      <BodyDashboard></BodyDashboard>
      <Navbar></Navbar>
    </div>
  );
}

export default Dashboard;
