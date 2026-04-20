import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';

const f = createUploadthing();

export const ourFileRouter = {
  pitchDeckUploader: f({ pdf: { maxFileSize: '4MB' } })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('[UploadThing] File uploaded successfully');
      console.log('[UploadThing] File name:', file.name);
      console.log('[UploadThing] File URL:', file.url);
      console.log('[UploadThing] File key:', file.key);

      return { uploadedBy: 'user', url: file.url, key: file.key };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
