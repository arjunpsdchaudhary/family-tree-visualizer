"use client";

import { ChangeEvent, useState } from "react";

const page = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const loadImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files?.[0];
    console.log("file ", files);
    if (!files) return;

    setPreview(URL.createObjectURL(files));
    console.log("url  :");
  };
  return (
    <div className="border border-red-400">
      <p>preview: {preview}</p>
      <input type="file" onChange={loadImage} />
      {preview && <img src={preview} />}
    </div>
  );
};

export default page;
