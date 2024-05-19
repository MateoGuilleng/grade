import mongoose from "mongoose";

const { Schema } = mongoose;

const projectSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    banner: {
      type: String,
      required: false,
      default: "https://res.cloudinary.com/dudftt5ha/image/upload/v1716151679/yp1vcyfpqmn034jedg8n.jpg"
    },
    description: {
      type: String,
      required: false,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    comments: {
      type: Array,
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Project ||
  mongoose.model("Project", projectSchema);
