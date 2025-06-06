var mongoose = require("mongoose");

const commentsSchema = new mongoose.Schema({
  childId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Children",
    required: true,
  },
  caretakerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5, 
    validate: {
      validator: Number.isInteger, 
      message: "{VALUE} is not an integer value",
    },
  },
});

export default mongoose.model("Comments", commentsSchema);
