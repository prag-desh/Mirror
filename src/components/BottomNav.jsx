import { Link, useLocation } from "react-router-dom";
import { Home, Layers, User, Sparkles } from "lucide-react";

function NavItem({ to, label, icon: Icon }) {
  const { pathname } = useLocation();
  const isActive = pathname === to;

  return (
    <Link
      to={to}
      className={`bottom-nav__link${isActive ? " bottom-nav__link--active" : ""}`}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon size={22} strokeWidth={2} aria-hidden="true" className="bottom-nav__icon" />
      <span>{label}</span>
    </Link>
  );
}

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Main">
      <NavItem to="/" label="Home" icon={Home} />
      <NavItem to="/vault" label="Vault" icon={Layers} />

      <Link
        to="/"
        className="bottom-nav__fab"
        aria-label="New reflection"
      >
        <Sparkles size={24} strokeWidth={2} aria-hidden="true" />
        <span>New</span>
      </Link>

      <NavItem to="/profile" label="Profile" icon={User} />
    </nav>
  );
}
