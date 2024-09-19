import { createContext } from "react";

const SidebarContext = createContext();

export default function Sidebar({ children }) {
  return (
    <nav className="flex mt-32 rounded-xl lg:mx-12 mx-4 py-2 flex-col bg-white border shadow-lg">
      <SidebarContext.Provider value={{}}>
        <ul className="flex-1 px-3">{children}</ul>
      </SidebarContext.Provider>
    </nav>
  );
}

export function SidebarItem({ icon, text, active, alert }) {
  return (
    <li
      className={`relative flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer transition-colors group ${
        active
          ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800"
          : "hover:bg-indigo-50 text-gray-600"
      }`}
    >
      {icon}
      <span className="overflow-hidden transition-all w-0">{text}</span>
      {alert && (
        <div className="absolute right-2 w-2 h-2 rounded bg-indigo-400 top-2"></div>
      )}

      <div
        className={`absolute left-full rounded-md px-2 py-1 ml-6 bg-indigo-100 text-indigo-800 text-sm invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0`}
      >
        {text}
      </div>
    </li>
  );
}
