// components/ImageUpload.tsx
"use client";

import { Dispatch, SetStateAction, useCallback } from "react";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { TbPhotoPlus } from "react-icons/tb";
import { Trash2 } from "lucide-react";

interface CloudinaryUploadResult {
    event?: string;
    info?: {
      secure_url: string;
      format: string;
      public_id?: string;
      width?: number;
      height?: number;
    };
  }

interface ImageUploadProps {
  values: string[];
  maxFiles?: number;
  setImageUrls:Dispatch<SetStateAction<string[]>>;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  values,
  setImageUrls,
  maxFiles = 5,
}) => {
    const handleUpload = useCallback(
        (results: CloudinaryUploadResult) => {
          if (results?.event === "success" && results.info?.secure_url) {
              setImageUrls(prev => [...prev,results.info?.secure_url||""]);
            }
          
        },
        [setImageUrls] // Removed unnecessary 'values' from dependencies
      );

  const handleRemove = useCallback(
    (url: string) => {
      setImageUrls(values.filter((val) => val !== url));
    },
    [values, setImageUrls]
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {values.map((url) => (
          <div key={url} className="relative aspect-square group">
            <Image
              src={url}
              alt="Preview"
              fill
              className="object-contain rounded-md border p-1 bg-white"
            />
            <button
              type="button"
              onClick={() => handleRemove(url)}
              className="absolute top-1 right-1 bg-red-500/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <CldUploadWidget
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
        onSuccess={(results) => handleUpload(results as CloudinaryUploadResult)}
        options={{
          multiple: true,
          maxFiles: maxFiles,
          sources: ['local'],
          resourceType: 'image',
          clientAllowedFormats: ['jpg', 'png', 'jpeg', 'webp'],
          showAdvancedOptions: false,
          cropping: false
        }}
      >
        {({ open }) => (
          <div
            onClick={() => values.length < maxFiles && open?.()}
            className={`flex items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
              values.length >= maxFiles ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <TbPhotoPlus className="w-6 h-6 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">
              {values.length >= maxFiles
                ? "الحد الأقصى تم الوصول إليه"
                : "إضافة صور"}
            </span>
            <span className="text-xs text-gray-400 ml-2">
              ({values.length}/{maxFiles})
            </span>
          </div>
        )}
      </CldUploadWidget>
    </div>
  );
};

export default ImageUpload;