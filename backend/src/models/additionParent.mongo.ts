var mongoose = require("mongoose");

const additionalParentSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  address: { type: String, required: true },
  email: { type: String, required: true },
  childId: { type: mongoose.Schema.Types.ObjectId, ref: "Children" , required: true},
});

export default mongoose.model("AdditionalParent", additionalParentSchema);
