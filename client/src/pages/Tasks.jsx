"use client";
import React, { useState, useEffect, useContext, useCallback } from "react";
import SidebarHelper from "../components/SidebarHelper";
import axios from "axios";
import {
  PlusIcon,
  CalendarIcon,
  X,
  MoreVertical,
  Flag,
  CheckSquare,
  Wifi,
  WifiOff,
} from "lucide-react";
import { format } from "date-fns";
import { StoreContext } from "../context/StoreContext";
import { useSocketContext } from "../context/SocketContext";

export default function Task() {
  const { url, token } = useContext(StoreContext);
  const { socket, isConnected } = useSocketContext();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubTaskOpen, setIsSubTaskOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [taskData, setTaskData] = useState({
    title: "",
    team: [],
    stage: "",
    date: new Date(),
    priority: "",
  });
  const [subTaskData, setSubTaskData] = useState({
    title: "",
    date: new Date(),
    tag: "",
  });
  const [tasks, setTasks] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [currTaskId, setCurrTaskId] = useState(null);

  const handleSocketEvent = useCallback((eventType, data) => {
    console.log("Received socket event:", eventType, data);
    switch (eventType) {
      case "taskCreated":
        setTasks((prevTasks) => [...prevTasks, data]);
        break;
      case "taskUpdated":
        setTasks((prevTasks) =>
          prevTasks.map((task) => (task._id === data._id ? data : task))
        );
        break;
      case "taskDeleted":
        setTasks((prevTasks) =>
          prevTasks.filter((task) => task._id !== data._id)
        );
        break;
      default:
        console.warn("Unknown event type:", eventType);
    }
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("taskEvent", handleSocketEvent);

      return () => {
        socket.off("taskEvent", handleSocketEvent);
      };
    }
  }, [socket, handleSocketEvent]);

  async function fetchData() {
    try {
      let getUsersUrl = url + "/api/user/users";
      let getTasksUrl = url + "/api/task/tasks";

      const [getUsersResponse, getTasksUrlResponse] = await Promise.all([
        axios.get(getUsersUrl),
        axios.get(getTasksUrl, { headers: { token } }),
      ]);

      if (getUsersResponse.data.success) {
        setUsers(getUsersResponse.data.users);
      } else {
        console.error("Failed to fetch users:", getUsersResponse.data.message);
      }

      if (getTasksUrlResponse.data.success) {
        setTasks(getTasksUrlResponse.data.tasks);
      } else {
        console.error(
          "Failed to fetch tasks:",
          getTasksUrlResponse.data.message
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  useEffect(() => {
    fetchData();
  }, [url, token, fetchData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubTaskChange = (e) => {
    const { name, value } = e.target;
    setSubTaskData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e) => {
    setTaskData((prev) => ({ ...prev, date: new Date(e.target.value) }));
  };

  const handleSubTaskDateChange = (e) => {
    setSubTaskData((prev) => ({ ...prev, date: new Date(e.target.value) }));
  };

  const getUsername = (userId) => {
    const user = users.find((user) => user._id === userId);
    return user ? user.username : "Unknown";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newUrl = editingTaskId
      ? `${url}/api/task/update/${editingTaskId}`
      : `${url}/api/task/create`;
    setIsLoading(true);
    try {
      const response = await axios[editingTaskId ? "put" : "post"](
        newUrl,
        {
          ...taskData,
          team: taskData.team,
          date: taskData.date.toISOString(),
        },
        { headers: { token } }
      );
      if (response.data.success) {
        setIsFormOpen(false);
        setTaskData({
          title: "",
          team: [],
          stage: "",
          date: new Date(),
          priority: "",
        });
        setEditingTaskId(null);

        if (socket && isConnected) {
          socket.emit("taskEvent", {
            type: editingTaskId ? "taskUpdated" : "taskCreated",
            data: response.data.task,
          });
        }
      } else {
        console.error(response.data.message);
      }
    } catch (error) {
      console.error("Error submitting task:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      const deleteUrl = `${url}/api/task/trash/${taskId}`;
      const response = await axios.delete(deleteUrl, { headers: { token } });
      if (response.data.success) {
        if (socket && isConnected) {
          socket.emit("taskEvent", {
            type: "taskDeleted",
            data: { _id: taskId },
          });
        }
      } else {
        console.error(response.data.message);
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleUpdate = (taskId) => {
    const taskToEdit = tasks.find((task) => task._id === taskId);
    setTaskData({
      title: taskToEdit.title,
      team: taskToEdit.team,
      stage: taskToEdit.stage,
      date: new Date(taskToEdit.date),
      priority: taskToEdit.priority,
    });
    setEditingTaskId(taskId);
    setIsFormOpen(true);
  };

  const handleAddSubTask = async (e) => {
    e.preventDefault();
    const newUrl = `${url}/api/task/create-subtask/${currTaskId}`;
    setIsLoading(true);
    try {
      const response = await axios.put(newUrl, subTaskData, {
        headers: { token },
      });
      if (response.data.success) {
        setIsSubTaskOpen(false);
        setSubTaskData({
          title: "",
          date: new Date(),
          tag: "",
        });
        setCurrTaskId(null);
        if (socket && isConnected) {
          socket.emit("taskEvent", {
            type: "taskUpdated",
            data: response.data.task,
          });
        }
      } else {
        console.error(response.data.message);
      }
    } catch (error) {
      console.error("Error adding sub-task:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "high":
        return <Flag className="h-5 w-5 text-red-500" />;
      case "medium":
        return <Flag className="h-5 w-5 text-yellow-500" />;
      case "normal":
        return <Flag className="h-5 w-5 text-blue-500" />;
      case "low":
        return <Flag className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  const getStageColor = (stage) => {
    switch (stage) {
      case "todo":
        return "text-yellow-800";
      case "in progress":
        return "text-blue-800";
      case "completed":
        return "text-green-800";
      default:
        return "text-gray-800";
    }
  };

  return (
    <div className="relative min-h-screen">
      <SidebarHelper />
      <div className="p-4">
        <div className="absolute top-8 right-8 flex items-center space-x-4">
          <div className="flex items-center">
            {isConnected ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            <span className="ml-2 text-sm">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
          <button
            onClick={() => {
              setIsFormOpen(true);
              setEditingTaskId(null);
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Task
          </button>
        </div>

        <div className="lg:px-36 pl-8 mx-10 -mr-1 -mt-[323px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <div key={task._id} className="bg-white shadow-lg rounded-lg p-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold">{task.title}</h3>
                <h6 className={`${getStageColor(task.stage)}`}>{task.stage}</h6>
                <div className="relative">
                  <button
                    onClick={() =>
                      setOpenDropdown(
                        openDropdown === task._id ? null : task._id
                      )
                    }
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                  {openDropdown === task._id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                      <button
                        onClick={() => handleUpdate(task._id)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDelete(task._id)}
                        className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(new Date(task.date), "MMM dd, yyyy")}
              </div>
              <div className="mt-2 flex items-center">
                {getPriorityIcon(task.priority)}
                <span className="ml-2 text-sm text-gray-600 capitalize">
                  {task.priority} Priority
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Team:{" "}
                {task.team
                  .map((t) => t.map((id) => getUsername(id)))
                  .join(", ")}
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700">
                  Sub Tasks:
                </h4>
                <ul className="mt-2 space-y-2">
                  {task.subTasks.map((subTask, index) => (
                    <li key={index} className="flex items-center">
                      <CheckSquare className="h-4 w-4 mr-2 text-green-500" />
                      <span className="text-sm text-gray-600">
                        {subTask.title}
                      </span>
                      <div className="p-4 space-x-10">
                        <span className="text-sm text-gray-600">
                          {format(new Date(subTask.date), "yyyy-MM-dd")}
                        </span>
                        <span className="bg-blue-600/10 px-3 py-1 rounded-full text-blue-700 font-medium">
                          {subTask.tag}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => {
                  setIsSubTaskOpen(true);
                  setCurrTaskId(task._id);
                }}
                className="mt-4 text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Sub Task
              </button>
            </div>
          ))}
        </div>

        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <form
              onSubmit={handleSubmit}
              className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold text-gray-900">
                  {editingTaskId ? "Edit Task" : "Create New Task"}
                </h3>
                <button
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingTaskId(null);
                  }}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full p-1"
                >
                  <span className="sr-only">Close</span>
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Task Title
                  </label>
                  <input
                    id="title"
                    placeholder="Title"
                    name="title"
                    type="text"
                    value={taskData.title}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="team"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Assign Task To
                  </label>
                  <select
                    id="team"
                    name="team"
                    value={taskData.team}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                    <option value="">Select a user</option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.username}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="stage"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Task Stage
                  </label>
                  <select
                    id="stage"
                    name="stage"
                    value={taskData.stage}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                    <option value="">Select a stage</option>
                    <option value="todo">To Do</option>
                    <option value="in progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Task Date
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="date"
                      name="date"
                      id="date"
                      value={format(taskData.date, "yyyy-MM-dd")}
                      onChange={handleDateChange}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="priority"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Priority Level
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={taskData.priority}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                    <option value="">Select priority</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="normal">Normal</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingTaskId(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        )}

        {isSubTaskOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <form
              onSubmit={handleAddSubTask}
              className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold text-gray-900">
                  Create Sub Task
                </h3>
                <button
                  onClick={() => {
                    setIsSubTaskOpen(false);
                  }}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full p-1"
                >
                  <span className="sr-only">Close</span>
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Sub Task Title
                  </label>
                  <input
                    id="title"
                    placeholder="Title"
                    name="title"
                    type="text"
                    value={subTaskData.title}
                    onChange={handleSubTaskChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Task Date
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="date"
                      name="date"
                      id="date"
                      value={format(subTaskData.date, "yyyy-MM-dd")}
                      onChange={handleSubTaskDateChange}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="tag"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Tag
                  </label>
                  <input
                    id="tag"
                    placeholder="Tag"
                    name="tag"
                    type="text"
                    value={subTaskData.tag}
                    onChange={handleSubTaskChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsSubTaskOpen(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
