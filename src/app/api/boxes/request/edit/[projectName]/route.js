// /api/boxes/request/edit/[projectName]

import connect from "@/utils/db";
import project from "@/models/project";
import { NextResponse } from "next/server";

export const PUT = async (request, { params }) => {
  const data = await request.formData();
  const projectTitle = params.projectName;

  const title = data.get("title");
  const category = data.get("category");
  const projectID = data.get("projectID");
  const description = data.get("description");

  console.log("projectID:", projectID);
  console.log("projectTitle:", projectTitle);

  try {
    await connect();
    console.log("pp", projectTitle, projectID, title, category, description);

    const updatedBox = await project.findOneAndUpdate(
      { title: projectTitle, "requestBoxes.identifier": projectID },
      {
        $set: {
          "requestBoxes.$.title": title,
          "requestBoxes.$.category": category,
          "requestBoxes.$.description": description,
        },
      },
      { new: true }
    );

    if (!updatedBox) {
      return NextResponse.json({ error: "Box not found" }, { status: 404 });
    }

    return NextResponse.json(updatedBox, { status: 200 });
  } catch (error) {
    console.error("Error updating box:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};

export const DELETE = async (request, { params }) => {
  const projectTitle = params.projectName;
  const { identifier } = await request.json();

  try {
    await connect();

    console.log("desde api", identifier, projectTitle);

    const updatedProject = await project.findOneAndUpdate(
      { title: projectTitle },
      { $pull: { requestBoxes: { identifier } } },
      { new: true }
    );

    if (!updatedProject) {
      return NextResponse.json(
        { error: "Project or Box not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedProject, { status: 200 });
  } catch (error) {
    console.error("Error deleting box:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
