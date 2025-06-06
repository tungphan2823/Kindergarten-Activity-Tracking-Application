var mongoose = require("mongoose");

const childrenSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Groups" },
  gender: { type: String, required: true },
  monthlyTime: { type: Number, default: 60 }, 
});

export default mongoose.model("Children", childrenSchema);
