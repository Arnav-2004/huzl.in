import taskModel from "../models/taskModel.js";

export const getDashboardData = async (req, res) => {
  try {
    const totalTasks = await taskModel.countDocuments({ isTrashed: false });
    const completedTasks = await taskModel.countDocuments({
      isTrashed: false,
      stage: "completed",
    });
    const highPriorityTasks = await taskModel.countDocuments({
      isTrashed: false,
      priority: "high",
    });
    const upcomingTasks = await taskModel.countDocuments({
      isTrashed: false,
      date: { $gte: new Date() },
    });

    const tasksByStage = await taskModel.aggregate([
      { $match: { isTrashed: false } },
      { $group: { _id: "$stage", count: { $sum: 1 } } },
      { $project: { stage: "$_id", count: 1, _id: 0 } },
    ]);

    const tasksByPriority = await taskModel.aggregate([
      { $match: { isTrashed: false } },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
      { $project: { name: "$_id", count: 1, _id: 0 } },
    ]);

    const recentTasks = await taskModel
      .find({ isTrashed: false })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title stage priority date");

    res.json({
      success: true,
      taskStats: {
        totalTasks,
        completedTasks,
        highPriorityTasks,
        upcomingTasks,
      },
      tasksByStage,
      tasksByPriority,
      recentTasks,
    });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};
