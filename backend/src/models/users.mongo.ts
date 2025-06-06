var mongoose = require("mongoose");
import slugify from "slugify";
import bcrypt from "bcrypt";

const usersSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: {
    type: String,
    enum: ["manager", "caretaker", "parent", "guest"],
  },
  dateOfBirth: { type: Date, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  slug: { type: String },
  phoneNumber: { type: String, required: true },
  address: { type: String, required: true },
});

usersSchema.pre("save", function (next) {
  const user = this;

  
  if (user.isModified("firstName") || user.isModified("lastName")) {
    user.slug = slugify(`${user.firstName} ${user.lastName}`, {
      lower: true,
      strict: true,
    });
  }
  next();
});




export default mongoose.model("Users", usersSchema);
