import HeaderDashboard from "../components/HeaderDashboard";
import WeeklyProgressPanel from "../components/WeeklyProgressPanel";
import KanbanBoard from "../components/KanbanBoard";
import "../styles/dashboard.css";

interface DashboardProps {
  username: string;
}

function Dashboard(props: DashboardProps) {
  const { username } = props;

  return (
    <div className="min-vh-100 w-100 p-2 fondo-dashboard">
      <HeaderDashboard username={username} />
      <WeeklyProgressPanel pendientes={5} />
      <KanbanBoard />
    </div>
  );
}

export default Dashboard;
