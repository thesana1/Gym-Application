'use client';

import { ImagePlus, LoaderCircle } from 'lucide-react';
import { useRef, useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { PROGRESS_COPY } from '@/shared/const/copy-progress.const';

const copy = PROGRESS_COPY.photos;

const MAX_FILE_SIZE = 3 * 1024 * 1024;

type UploadedImage = {
  name: string;
  url: string;
};

type UploadResponse = {
  error?: string;
  url?: string;
};

export function ImageUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  async function handleFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = '';
    setMessage('');

    if (files.length === 0) return;

    const invalidFiles = files.filter((file) => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      setMessage(copy.onlyImages);
      return;
    }

    const oversizedFiles = files.filter((file) => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      setMessage(copy.tooBig(oversizedFiles.map((file) => file.name).join(', ')));
      return;
    }

    setIsUploading(true);
    const results: UploadedImage[] = [];

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/uploads/images', {
          method: 'POST',
          body: formData,
        });
        const result = (await response.json()) as UploadResponse;

        if (!response.ok || !result.url) {
          const errorMessage =
            result.error === 'CLOUDINARY_AUTH_FAILED' || result.error === 'CLOUDINARY_NOT_CONFIGURED'
              ? copy.unavailable
              : result.error === 'PREMIUM_REQUIRED'
                ? copy.premium
                : result.error === 'INVALID_IMAGE'
                  ? copy.notImage(file.name)
                  : copy.failed(file.name);
          throw new Error(errorMessage);
        }

        const url = result.url;
        results.push({ name: file.name, url });
        setUploadedImages((current) => [...current, { name: file.name, url }]);
      }

      setMessage(copy.done(results.length));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : copy.unavailable);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-base text-muted-foreground">{copy.help}</p>
      <input ref={inputRef} accept="image/*" className="sr-only" disabled={isUploading} multiple onChange={handleFilesSelected} type="file" />
      <Button variant="outline" className="w-full sm:w-fit" disabled={isUploading} onClick={() => inputRef.current?.click()} type="button">
        {isUploading ? <LoaderCircle aria-hidden="true" className="size-5 animate-spin" /> : <ImagePlus aria-hidden="true" className="size-5" />}
        {isUploading ? copy.uploading : copy.choose}
      </Button>
      {message && <p aria-live="polite" className="text-base" role="status">{message}</p>}
      {uploadedImages.length > 0 && (
        <ul className="flex flex-col gap-2">
          {uploadedImages.map(({ name, url }) => (
            <li key={url} className="text-base">
              <a className="text-primary underline underline-offset-4" href={url} rel="noreferrer" target="_blank">{name}</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
