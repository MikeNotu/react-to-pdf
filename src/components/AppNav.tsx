import React from "react";
import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `px-4 py-2 rounded-md text-sm font-medium transition duration-300 text-center flex-1 sm:flex-none ${
    isActive
      ? "bg-blue-600 text-white"
      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
  }`;

export function AppNav({
  rightContent,
}: Readonly<{
  rightContent?: React.ReactNode;
}>) {
  return (
    <nav className="w-full max-w-6xl mx-auto px-2 sm:px-4 pt-2 sm:pt-4 flex flex-col sm:flex-row sm:items-start gap-2">
      <div className="flex w-full sm:w-auto gap-2">
        <NavLink to="/" className={linkClass} end>
          Service Form
        </NavLink>
        <NavLink to="/attachments" className={linkClass}>
          Attachments
        </NavLink>
      </div>
      {rightContent ? <div className="w-full sm:w-auto sm:ml-auto">{rightContent}</div> : null}
    </nav>
  );
}
