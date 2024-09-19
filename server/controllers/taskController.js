import notificationModel from "../models/notificationModel.js";
import taskModel from "../models/taskModel.js";
import userModel from "../models/userModel.js";

export const createTask = async (req, res) => {
  try {
    const userId = req.body.userId;

    const { title, team, stage, date, priority } = req.body;

    let text = "New task has been assigned to you";
    if (team?.length > 1) {
      text = text + ` and ${team?.length - 1} others.`;
    }

    text =
      text +
      ` The task priority is set a ${priority} priority, so check and act accordingly. The task date is ${new Date(
        date
      ).toDateString()}. Thank you!!!`;

    const activity = {
      type: "assigned",
      activity: text,
      by: userId,
    };

    const task = await taskModel.create({
      title,
      team,
      stage: stage.toLowerCase(),
      date,
      priority: priority.toLowerCase(),
      activities: activity,
    });

    await notificationModel.create({
      team,
      text,
      task: task._id,
    });

    res.json({ success: true, task, message: "Task created successfully." });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const { stage, isTrashed } = req.query;

    let query = { isTrashed: isTrashed ? true : false };

    if (stage) {
      query.stage = stage;
    }

    let queryResult = taskModel
      .find(query)
      .populate({
        path: "team",
        select: "name title email",
      })
      .sort({ _id: -1 });

    const tasks = await queryResult;

    res.json({
      success: true,
      tasks,
    });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

export const trashTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await taskModel.findById(id);

    task.isTrashed = true;

    await task.save();

    res.json({
      success: true,
      message: `Task trashed successfully.`,
    });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

export const deleteRestoreTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { actionType } = req.query;

    if (actionType === "delete") {
      await taskModel.findByIdAndDelete(id);
    } else if (actionType === "deleteAll") {
      await taskModel.deleteMany({ isTrashed: true });
    } else if (actionType === "restore") {
      const task = await taskModel.findById(id);
      if (task) {
        task.isTrashed = false;
        await task.save();
      }
    } else if (actionType === "restoreAll") {
      await taskModel.updateMany(
        { isTrashed: true },
        { $set: { isTrashed: false } }
      );
    } else if (actionType === "fetch") {
      const trashedTasks = await taskModel.find({ isTrashed: true });
      return res.json({ success: true, tasks: trashedTasks });
    }

    res.json({
      success: true,
      message: `Operation performed successfully.`,
    });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, team, stage, priority } = req.body;

    const task = await taskModel.findById(id);

    task.title = title;
    task.date = date;
    task.priority = priority.toLowerCase();
    task.stage = stage.toLowerCase();
    task.team = team;

    await task.save();

    res.json({ success: true, message: "Task duplicated successfully." });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

export const createSubTask = async (req, res) => {
  try {
    const { title, tag, date } = req.body;

    const { id } = req.params;

    const newSubTask = {
      title,
      date,
      tag,
    };

    const task = await taskModel.findById(id);

    task.subTasks.push(newSubTask);

    await task.save();

    res.json({ success: true, message: "SubTask added successfully." });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};
