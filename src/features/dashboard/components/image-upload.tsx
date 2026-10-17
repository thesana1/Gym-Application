'use client';

import { ImagePlus, LoaderCircle, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

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
      setMessage('Select image files only.');
      return;
    }

    const oversizedFiles = files.filter((file) => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      setMessage(`${oversizedFiles.map((file) => file.name).join(', ')} exceed the 3 MB limit.`);
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
            result.error === 'CLOUDINARY_NOT_CONFIGURED'
              ? 'Cloudinary credentials are missing. Configure them in the environment.'
              : result.error === 'INVALID_IMAGE'
                ? `${file.name} is not a supported image.`
                : result.error === 'IMAGE_UPLOAD_FAILED'
                  ? `Could not upload ${file.name}. Please try again.`
                  : result.error ?? 'IMAGE_UPLOAD_FAILED';
          throw new Error(errorMessage);
        }

        const url = result.url;
        results.push({ name: file.name, url });
        setUploadedImages((current) => [...current, { name: file.name, url }]);
      }

      setMessage(`${results.length} image${results.length === 1 ? '' : 's'} uploaded.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'IMAGE_UPLOAD_FAILED');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ImagePlus className="size-4" />
          Upload images
        </CardTitle>
        <CardDescription>
          Images are resized, converted to WebP, and saved to Cloudinary. Maximum 3 MB per image.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <input
          ref={inputRef}
          accept="image/*"
          className="sr-only"
          disabled={isUploading}
          multiple
          onChange={handleFilesSelected}
          type="file"
        />
        <Button
          className="w-fit"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          {isUploading ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <Upload aria-hidden="true" className="size-4" />
          )}
          {isUploading ? 'Uploading...' : 'Choose images'}
        </Button>

        {message && (
          <p aria-live="polite" className="text-sm text-muted-foreground" role="status">
            {message}
          </p>
        )}

        {uploadedImages.length > 0 && (
          <ul className="flex flex-col gap-2">
            {uploadedImages.map(({ name, url }) => (
              <li key={url} className="text-sm">
                <a
                  className="text-primary underline underline-offset-4"
                  href={url}
                  rel="noreferrer"
                  target="_blank"
                >
                  {name} (WebP)
                </a>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
