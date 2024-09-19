import mongoose from "mongoose";

const notifSchema = new mongoose.Schema(
  {
    team: [{ type: mongoose.Schema.Types.Array, ref: "user" }],
    text: { type: String },
    task: { type: mongoose.Schema.Types.ObjectId, ref: "task" },
    notifType: { type: String, default: "alert", enum: ["alert", "message"] },
    isRead: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  },
  { timestamps: true }
);

const notificationModel =
  mongoose.models.notif || mongoose.model("notif", notifSchema);

export default notificationModel;
