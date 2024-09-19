import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  LifeBuoy,
  Settings,
  ListTodo,
  Users,
  Trash,
} from "lucide-react";

import Sidebar, { SidebarItem } from "./Sidebar";

export default function SidebarHelper() {
  const location = useLocation();

  return (
    <div className="flex">
      <Sidebar>
        <Link to="/dashboard">
          <SidebarItem
            icon={<LayoutDashboard size={20} />}
            text="Dashboard"
            active={location.pathname === "/dashboard"}
          />
        </Link>
        <Link to="/tasks">
          <SidebarItem
            icon={<ListTodo size={20} />}
            text="Tasks"
            active={location.pathname === "/tasks"}
          />
        </Link>
        <Link to="/team">
          <SidebarItem
            icon={<Users size={20} />}
            text="Team"
            active={location.pathname === "/team"}
          />
        </Link>
        <Link to="/trash">
          <SidebarItem
            icon={<Trash size={20} />}
            text="Trash"
            active={location.pathname === "/trash"}
          />
        </Link>
        <hr className="my-3" />
        <Link to="/settings">
          <SidebarItem
            icon={<Settings size={20} />}
            text="Settings"
            active={location.pathname === "/settings"}
          />
        </Link>
        <Link to="/help">
          <SidebarItem
            icon={<LifeBuoy size={20} />}
            text="Help"
            active={location.pathname === "/help"}
          />
        </Link>
      </Sidebar>
    </div>
  );
}
