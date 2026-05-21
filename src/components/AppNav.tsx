import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `px-4 py-2 rounded-md text-sm font-medium transition duration-300 ${
    isActive
      ? "bg-blue-600 text-white"
      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
  }`;

export function AppNav() {
  return (
    <nav className="w-full max-w-6xl mx-auto px-4 pt-4 flex gap-2">
      <NavLink to="/" className={linkClass} end>
        Service Form
      </NavLink>
      <NavLink to="/attachments" className={linkClass}>
        Attachments
      </NavLink>
    </nav>
  );
}
