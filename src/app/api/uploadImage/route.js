// /api/uploadImage
import { NextResponse } from "next/server";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY_CLD,
  api_secret: process.env.API_SECRET,
});

export async function POST(request) {
  const data = await request.formData();
  const image = data.get("image");

  console.log("desde api upload image", image);
  if (image) {
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const response = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({}, (err, result) => {
          if (err) {
            console.error("Error al subir la imagen a Cloudinary:", err);
            reject(err);
          }
          resolve(result);
        })
        .end(buffer);
    });

    return NextResponse.json({
      message: "imagen subida",
      url: response.secure_url,
    });
  } else {
    return NextResponse.json("no se ha subido ninguna imagen", { status: 400 });
  }
}
