import { useMemo } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import MonolithicPanel from "@atoms/MonolithicPanel";
import Avatar from "@atoms/Avatar";

const TopNavBar = () => {
  const location = useLocation();
  const { id: routeProjectId, projectName } = useParams();
  const path = location.pathname;

  const activeProjectSlug = useMemo(() => {
    const localMatch = location.pathname.match(/\/local\/([^/]+)/);
    const projectMatch = location.pathname.match(/\/project\/([^/]+)/);
    const entityMatch = location.pathname.match(/\/entities\/[^/]+\/([^/]+)/);
    return (
      projectName ||
      routeProjectId ||
      localMatch?.[1] ||
      projectMatch?.[1] ||
      entityMatch?.[1] ||
      null
    );
  }, [projectName, routeProjectId, location.pathname]);

  const localBasePath = activeProjectSlug
    ? `/local/${activeProjectSlug}`
    : null;

  // Home goes to dashboard
  // Projects goes to active project (or dashboard if none)

  return (
    <div className="h-16 flex items-center justify-center pointer-events-none sticky top-0 z-50 px-8">
      <MonolithicPanel className="flex items-center gap-2 px-2 py-1.5 rounded-full pointer-events-auto monolithic-panel shadow-2xl">
        <Link
          to={localBasePath ? `${localBasePath}/dashboard` : "/"}
          className={`p-2 rounded-full transition-colors ${path === "/" || path.includes("/dashboard") ? "bg-primary text-primary-foreground shadow-lg" : "text-foreground/60 hover:text-foreground hover:bg-foreground/5"}`}
        >
          <span className="material-symbols-outlined text-xl">home</span>
        </Link>

        <div className="w-px h-4 bg-foreground/10 mx-1"></div>

        {path !== "/" && !path.endsWith("/settings") && !!localBasePath && (
          <nav className="flex items-center gap-1">
            <NavItem
              to={`${localBasePath}/dashboard`}
              icon="grid_view"
              label="Dashboard"
              active={path.includes("/dashboard")}
            />
            <NavItem
              to={`${localBasePath}/writing`}
              icon="edit_note"
              label="Writing"
              active={path.includes("/writing")}
            />
            <NavItem
              to={`${localBasePath}/timeline`}
              icon="event_note"
              label="Timeline"
              active={path.includes("/timeline")}
            />
            <NavItem
              to={`${localBasePath}/map`}
              icon="map"
              label="Cartography"
              active={path.includes("/map")}
            />
            <NavItem
              to={`${localBasePath}/languages`}
              icon="translate"
              label="Linguistics"
              active={path.includes("/languages")}
            />
            <NavItem
              to={`${localBasePath}/graph`}
              icon="hub"
              label="Graph"
              active={path.includes("/graph")}
            />
          </nav>
        )}
        {(path === "/" || path.endsWith("/settings")) && (
          <div className="flex items-center gap-1 px-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/50">
              Vault Access Area
            </span>
          </div>
        )}

        <div className="w-px h-4 bg-foreground/10 mx-1"></div>

        <div className="flex items-center gap-1">
          <Link
            to="/settings"
            className={`p-2 rounded-full transition-colors ${path === "/settings" ? "bg-primary text-primary-foreground shadow-lg" : "text-foreground/60 hover:text-foreground hover:bg-foreground/5"}`}
          >
            <span className="material-symbols-outlined text-xl">settings</span>
          </Link>
          <Link to="/settings" className="ml-1">
            <Avatar
              name="EW"
              size="sm"
              className="bg-primary/20 text-primary border border-primary/30"
            />
          </Link>
        </div>
      </MonolithicPanel>
    </div>
  );
};

interface NavItemProps {
  to: string;
  icon: string;
  label: string;
  active: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${active ? "bg-primary text-primary-foreground shadow-lg" : "text-foreground/60 hover:text-foreground hover:bg-foreground/5"}`}
  >
    <span className="material-symbols-outlined text-sm">{icon}</span>
    <span className="text-[10px] font-bold tracking-[0.1em] uppercase">
      {label}
    </span>
  </Link>
);

export default TopNavBar;
