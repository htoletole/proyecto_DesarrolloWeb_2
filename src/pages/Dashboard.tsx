import HeaderDashboard from "../components/HeaderDashboard";
import WeeklyProgressPanel from "../components/WeeklyProgressPanel";
import KanbanBoard from "../components/KanbanBoard";
import "../styles/styles.css";

function Dashboard() {
  return (
    <div className="min-vh-100 w-100 p-2 fondo-dashboard">
      <HeaderDashboard username="Florencia" />
      <WeeklyProgressPanel />
      <KanbanBoard />
    </div>
  );
}

export default Dashboard;
