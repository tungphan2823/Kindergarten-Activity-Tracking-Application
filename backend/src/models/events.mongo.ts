var mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  groups: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Groups",
      required: true,
    },
  ],
});

export default mongoose.model("Events", eventSchema);
