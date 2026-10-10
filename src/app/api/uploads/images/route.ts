import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

import { auth } from '@/shared/lib/auth';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 3 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 2048;

type CloudinaryUploadResult = {
  bytes: number;
  format: string;
  public_id: string;
  secure_url: string;
};

function isUploadFile(value: FormDataEntryValue | undefined): value is File {
  return (
    value !== undefined &&
    typeof value !== 'string' &&
    typeof value.size === 'number' &&
    typeof value.type === 'string' &&
    typeof value.arrayBuffer === 'function'
  );
}

function uploadToCloudinary(image: Buffer): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      {
        folder: 'gym-application',
        format: 'webp',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error('Cloudinary returned no upload result'));
          return;
        }

        resolve(result);
      }
    );

    upload.end(image);
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const user = session.user as { role?: string };
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }

  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return NextResponse.json({ error: 'CLOUDINARY_NOT_CONFIGURED' }, { status: 503 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'INVALID_MULTIPART_FORM' }, { status: 400 });
  }

  const files = formData.getAll('file');
  const file = files[0];
  if (files.length !== 1 || !isUploadFile(file)) {
    return NextResponse.json({ error: 'ONE_IMAGE_REQUIRED' }, { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json({ error: 'EMPTY_FILE' }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'FILE_TOO_LARGE', maxBytes: MAX_FILE_SIZE }, { status: 413 });
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'IMAGE_FILE_REQUIRED' }, { status: 415 });
  }

  let webpImage: Buffer;
  try {
    const source = Buffer.from(await file.arrayBuffer());
    webpImage = await sharp(source, { limitInputPixels: 100_000_000 })
      .rotate()
      .resize({
        width: MAX_IMAGE_DIMENSION,
        height: MAX_IMAGE_DIMENSION,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80, effort: 6 })
      .toBuffer();
  } catch {
    return NextResponse.json({ error: 'INVALID_IMAGE' }, { status: 400 });
  }

  try {
    cloudinary.config({
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
      cloud_name: CLOUDINARY_CLOUD_NAME,
    });

    const result = await uploadToCloudinary(webpImage);
    return NextResponse.json({
      bytes: result.bytes,
      format: result.format,
      publicId: result.public_id,
      url: result.secure_url,
    });
  } catch (error) {
    console.error('Image upload to Cloudinary failed:', error);
    return NextResponse.json({ error: 'IMAGE_UPLOAD_FAILED' }, { status: 502 });
  }
}
