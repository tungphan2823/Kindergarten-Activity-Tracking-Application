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
  // Only generate slug if the name field is modified or slug is not set
  if (this.isModified("name") || !this.slug) {
    this.slug = slugify(this.name, {
      lower: true, // Convert slug to lowercase
      strict: true, // Remove special characters from the slug
    });
  }
  next();
});




export default mongoose.model("Groups", groupsSchema);
