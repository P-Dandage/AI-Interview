"use client";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import './Header.css';

const navItems = [
  { label: "Dashboard",         path: "/dashboard" },
  { label: "Feedback Form",          path: "/dashboard/Feedback-form" },
  { label: "Confidence Booster",path: "/dashboard/ConfidenceBooster" },
  { label: "How it Works",      path: "/dashboard/how" },
];

function Header() {
  const router = useRouter();
  const path = usePathname();

  return (
    <header className="dash-header">
      <div className="dash-header-inner">
        {/* Logo */}
        <button className="dash-logo" onClick={() => router.push('/dashboard')}>
          <div className="dash-logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="dash-logo-text">IntraAi</span>
        </button>

        {/* Nav */}
        <nav className="dash-nav">
          {navItems.map(({ label, path: navPath }) => (
            <button
              key={navPath}
              className={`dash-nav-item ${path === navPath ? "dash-nav-item--active" : ""}`}
              onClick={() => router.push(navPath)}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="dash-user">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}

export default Header;
