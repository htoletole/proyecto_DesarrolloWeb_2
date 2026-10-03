import { NavLink, useLocation } from "react-router-dom";

import homeIconWhite from "../assets/icons/casa_active.png";
import taskIconWhite from "../assets/icons/portapapeles_active.png";
import subjectIconWhite from "../assets/icons/birrete_active.png";
import calendarIconWhite from "../assets/icons/calendario_active.png";

import homeIconGray from "../assets/icons/casa.png";
import taskIconGray from "../assets/icons/portapapeles.png";
import subjectIconGray from "../assets/icons/birrete.png";
import calendarIconGray from "../assets/icons/calendario.png";

import "../styles/styles.css";

function Navbar() {
  const location = useLocation();

  const navClass: Record<string, string> = {
    "/": "",
    "/tareas": "nav-tareas",
    "/ramos": "nav-ramos",
  };

  const navItems = [
    {
      path: "/",
      label: "Inicio",
      icon: homeIconGray,
      activeIcon: homeIconWhite,
      specialSize: "home-icon",
    },
    {
      path: "/tareas",
      label: "Tareas",
      icon: taskIconGray,
      activeIcon: taskIconWhite,
      specialSize: "",
    },
    {
      path: "/ramos",
      label: "Ramos",
      icon: subjectIconGray,
      activeIcon: subjectIconWhite,
      specialSize: "subject-icon",
    },
    {
      path: "/calendario",
      label: "Calendario",
      icon: calendarIconGray,
      activeIcon: calendarIconWhite,
      specialSize: "",
    },
  ];

  return (
    <nav
      className={`fixed-bottom d-flex align-items-center navdiv ${navClass[location.pathname] ?? ""}`}
    >
      <div className="container">
        <ul className="nav nav-justified nav-underline">
          {navItems.map((item) => (
            <li className="nav-item">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `nav-link custom-nav-link ${isActive ? "active" : ""}`
                }
              >
                {({ isActive }) => (
                  <>
                    <img
                      className={item.specialSize}
                      src={isActive ? item.activeIcon : item.icon}
                      alt="Logo"
                    />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
