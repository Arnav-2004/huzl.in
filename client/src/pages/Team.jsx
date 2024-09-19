"use client";

import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { StoreContext } from "../context/StoreContext";
import { Trash2, RefreshCw, Flag } from "lucide-react";
import { format } from "date-fns";
import SidebarHelper from "../components/SidebarHelper";

export default function Trash() {
  const { url, token } = useContext(StoreContext);
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const response = await axios.get(`${url}/api/user/team`, {
        headers: { token },
      });
      if (response.data.success) {
        setTeamMembers(response.data.users);
      } else {
        console.error("Failed to fetch team members:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  };

  const handleAction = async (id) => {
    try {
      let endpoint = `${url}/api/user/user/${id}`;
      const response = await axios.delete(endpoint, {
        headers: { token },
      });
      if (response.data.success) {
        fetchTeamMembers();
      } else {
        console.error(`Failed to delete team member:`, response.data.message);
      }
    } catch (error) {
      console.error(`Error deleting team member:`, error);
    }
  };

  return (
    <div className="relative min-h-screen">
      <SidebarHelper />
      <div className="-mt-[350px] px-32">
        <h1 className="text-2xl font-bold mb-4">Team Members</h1>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-scroll">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modified On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teamMembers.length === 0 && (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap">N/A</td>
                    <td className="px-6 py-4 whitespace-nowrap">N/A</td>
                    <td className="px-6 py-4 whitespace-nowrap">N/A</td>
                    <td className="px-6 py-4 whitespace-nowrap">N/A</td>
                  </>
                )}
                {teamMembers.map((member) => (
                  <tr key={member._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {member.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {member.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {member.updatedAt === member.createdAt
                        ? "N/A"
                        : format(new Date(member.updatedAt), "MMM dd, yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleAction(member._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
