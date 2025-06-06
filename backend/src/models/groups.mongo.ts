var mongoose = require("mongoose");
import slugify from "slugify";
const groupsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  slug: { type: String },
  caretakerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
});
groupsSchema.pre("save", function (next) {

  if (this.isModified("name") || !this.slug) {
    this.slug = slugify(this.name, {
      lower: true, 
      strict: true, 
    });
  }
  next();
});




export default mongoose.model("Groups", groupsSchema);
