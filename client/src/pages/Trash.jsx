"use client";

import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { StoreContext } from "../context/StoreContext";
import { Trash2, RefreshCw, Flag } from "lucide-react";
import { format } from "date-fns";
import SidebarHelper from "../components/SidebarHelper";

export default function Trash() {
  const { url, token } = useContext(StoreContext);
  const [trashedTasks, setTrashedTasks] = useState([]);

  useEffect(() => {
    fetchTrashedTasks();
  }, []);

  const fetchTrashedTasks = async () => {
    try {
      const response = await axios.delete(`${url}/api/task/delete-restore`, {
        headers: { token },
        params: { actionType: "fetch" },
      });
      if (response.data.success) {
        setTrashedTasks(response.data.tasks);
      } else {
        console.error("Failed to fetch trashed tasks:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching trashed tasks:", error);
    }
  };

  const handleAction = async (action, id = null) => {
    try {
      let endpoint = `${url}/api/task/delete-restore`;
      if (id) {
        endpoint += `/${id}`;
      }
      const response = await axios.delete(endpoint, {
        headers: { token },
        params: { actionType: action },
      });
      if (response.data.success) {
        fetchTrashedTasks();
      } else {
        console.error(`Failed to ${action} task(s):`, response.data.message);
      }
    } catch (error) {
      console.error(`Error ${action}ing task(s):`, error);
    }
  };

  const getPriorityIcon = (priority) => {
    const color =
      priority === "High"
        ? "text-red-500"
        : priority === "Medium"
        ? "text-yellow-500"
        : "text-blue-500";
    return <Flag className={`h-5 w-5 ${color}`} />;
  };

  return (
    <div className="relative min-h-screen">
      <SidebarHelper />
      <div className="-mt-[350px] px-32">
        <h1 className="text-2xl font-bold">Trashed Tasks</h1>
        <div className="flex justify-end space-x-4 mb-4">
          <button
            onClick={() => handleAction("restoreAll")}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          >
            Restore All
          </button>
          <button
            onClick={() => handleAction("deleteAll")}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            Delete All
          </button>
        </div>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-scroll">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stage
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
                {trashedTasks.length === 0 && (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap">N/A</td>
                    <td className="px-6 py-4 whitespace-nowrap">N/A</td>
                    <td className="px-6 py-4 whitespace-nowrap">N/A</td>
                    <td className="px-6 py-4 whitespace-nowrap">N/A</td>
                    <td className="px-6 py-4 whitespace-nowrap">N/A</td>
                  </>
                )}
                {trashedTasks.map((task) => (
                  <tr key={task._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {task.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getPriorityIcon(task.priority)}
                        <span className="ml-2">{task.priority}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {task.stage}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {task.updatedAt === task.createdAt
                        ? "N/A"
                        : format(new Date(task.updatedAt), "MMM dd, yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleAction("restore", task._id)}
                        className="text-green-600 hover:text-green-900 mr-4"
                      >
                        <RefreshCw className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleAction("delete", task._id)}
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
