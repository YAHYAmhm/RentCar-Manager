
import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  useLocation,
} from "react-router-dom";

import {
  LayoutDashboard,
  CarFront,
  Users,
  CalendarDays,
  FileText,
  CreditCard,
  RotateCcw,
  Menu,
  X,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  ArrowUpRight,
} from "lucide-react";

import Dashboard from "./pages/Dashboard";
import Voitures from "./pages/Voitures";
import Clients from "./pages/Clients";
import Reservations from "./pages/Reservations";
import Contrats from "./pages/Contrats";
import Paiements from "./pages/Paiements";
import Retours from "./pages/Retours";

import "./App.css";

const navigation = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/voitures", label: "Véhicules", icon: CarFront },
  { path: "/clients", label: "Clients", icon: Users },
  { path: "/reservations", label: "Réservations", icon: CalendarDays },
  { path: "/contrats", label: "Contrats", icon: FileText },
  { path: "/paiements", label: "Paiements", icon: CreditCard },
  { path: "/retours", label: "Retours", icon: RotateCcw },
];

function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const currentPage =
    navigation.find((item) => item.path === location.pathname)?.label ||
    "Dashboard";

  return (
    <div className={`rc-shell ${collapsed ? "rc-collapsed" : ""}`}>
      {mobileOpen && (
        <div
          className="rc-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`rc-sidebar ${mobileOpen ? "rc-open" : ""}`}>
        <div className="rc-brand">
          <div className="rc-brand-icon">
            <CarFront size={23} strokeWidth={2} />
          </div>
          <div className="rc-brand-text">
            <strong>RENTCAR<span>.</span></strong>
            <small>FLEET MANAGEMENT</small>
          </div>
          <button
            className="rc-mobile-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="rc-nav-caption">WORKSPACE</div>

        <nav className="rc-nav">
          {navigation.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              title={collapsed ? label : undefined}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `rc-nav-link ${isActive ? "rc-active" : ""}`
              }
            >
              <Icon size={19} strokeWidth={1.8} />
              <span>{label}</span>
              <ChevronRight className="rc-nav-arrow" size={15} />
            </NavLink>
          ))}
        </nav>

        <div className="rc-sidebar-bottom">
          <div className="rc-profile">
            <div className="rc-avatar">RC</div>
            <div className="rc-profile-text">
              <strong>Administration</strong>
              <small>Local workspace</small>
            </div>
            <ArrowUpRight className="rc-profile-arrow" size={17} />
          </div>
        </div>

        <button
          className="rc-collapse-button"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Agrandir" : "Réduire"}
        >
          {collapsed
            ? <PanelLeftOpen size={18} />
            : <PanelLeftClose size={18} />}
        </button>
      </aside>

      <div className="rc-main">
        <header className="rc-header">
          <div className="rc-header-left">
            <button
              className="rc-menu-button"
              onClick={() => setMobileOpen(true)}
              aria-label="Ouvrir le menu"
            >
              <Menu size={22} />
            </button>
            <span className="rc-breadcrumb-muted">Workspace</span>
            <ChevronRight size={15} className="rc-breadcrumb-icon" />
            <strong>{currentPage}</strong>
          </div>

          <div className="rc-header-right">
            <div className="rc-local-status">
              <span className="rc-status-dot" />
              Système local
            </div>
            <div className="rc-header-avatar">RC</div>
          </div>
        </header>

        <main className="rc-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/voitures" element={<Voitures />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/reservations" element={<Reservations />} />
            <Route path="/contrats" element={<Contrats />} />
            <Route path="/paiements" element={<Paiements />} />
            <Route path="/retours" element={<Retours />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
