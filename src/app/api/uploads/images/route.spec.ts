import { v2 as cloudinary } from 'cloudinary';
import { NextRequest } from 'next/server';
import sharp from 'sharp';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { auth } from '@/shared/lib/auth';

import { POST } from './route';

vi.mock('cloudinary', () => ({
  v2: {
    config: vi.fn(),
    uploader: { upload_stream: vi.fn() },
  },
}));
vi.mock('sharp', () => ({ default: vi.fn() }));
vi.mock('@/shared/lib/auth', () => ({ auth: vi.fn() }));

const mockAuth = vi.mocked(auth);
const mockSharp = vi.mocked(sharp);
const mockUploadStream = vi.mocked(cloudinary.uploader.upload_stream);
const mockUploadEnd = vi.fn();
const cloudinaryResult = {
  bytes: 1200,
  format: 'webp',
  public_id: 'gym-application/test-image',
  secure_url: 'https://res.cloudinary.com/demo/image/upload/test-image.webp',
};

function makeRequest(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  return { formData: async () => formData } as NextRequest;
}

describe('POST /api/uploads/images', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('CLOUDINARY_CLOUD_NAME', 'cloud');
    vi.stubEnv('CLOUDINARY_API_KEY', 'key');
    vi.stubEnv('CLOUDINARY_API_SECRET', 'secret');
    mockAuth.mockResolvedValue({ user: { name: 'Admin', role: 'admin' } } as never);

    const pipeline = {
      rotate: vi.fn(),
      resize: vi.fn(),
      webp: vi.fn(),
      toBuffer: vi.fn().mockResolvedValue(Buffer.from('webp-image')),
    };
    pipeline.rotate.mockReturnValue(pipeline as never);
    pipeline.resize.mockReturnValue(pipeline as never);
    pipeline.webp.mockReturnValue(pipeline as never);
    mockSharp.mockReturnValue(pipeline as never);
    mockUploadStream.mockImplementation(
      ((
        _options: unknown,
        callback: (error: Error | null, result?: typeof cloudinaryResult) => void
      ) => {
        callback(null, cloudinaryResult);
        return { end: mockUploadEnd };
      }) as never
    );
  });

  it('requires an authenticated user', async () => {
    mockAuth.mockResolvedValueOnce(null as never);

    const response = await POST(makeRequest(new File(['photo'], 'photo.png', { type: 'image/png' })));

    expect(response.status).toBe(401);
    expect(mockSharp).not.toHaveBeenCalled();
  });

  it('restricts uploads to administrators', async () => {
    mockAuth.mockResolvedValueOnce({ user: { role: 'user' } } as never);

    const response = await POST(makeRequest(new File(['photo'], 'photo.png', { type: 'image/png' })));

    expect(response.status).toBe(403);
    expect(mockSharp).not.toHaveBeenCalled();
  });

  it('rejects files larger than 3 MB', async () => {
    const oversizedFile = new File([new Uint8Array(3 * 1024 * 1024 + 1)], 'large.png', {
      type: 'image/png',
    });

    const response = await POST(makeRequest(oversizedFile));

    expect(response.status).toBe(413);
    expect(mockSharp).not.toHaveBeenCalled();
  });

  it('accepts a file at the 3 MB limit', async () => {
    const maxSizeFile = new File([new Uint8Array(3 * 1024 * 1024)], 'max-size.png', {
      type: 'image/png',
    });

    const response = await POST(makeRequest(maxSizeFile));

    expect(response.status).toBe(200);
    expect(mockSharp).toHaveBeenCalledOnce();
  });

  it('rejects non-image files', async () => {
    const response = await POST(makeRequest(new File(['text'], 'notes.txt', { type: 'text/plain' })));

    expect(response.status).toBe(415);
    expect(mockSharp).not.toHaveBeenCalled();
  });

  it('resizes, converts to WebP, and uploads the image to Cloudinary', async () => {
    const response = await POST(makeRequest(new File(['photo'], 'photo.png', { type: 'image/png' })));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      bytes: 1200,
      format: 'webp',
      publicId: cloudinaryResult.public_id,
      url: cloudinaryResult.secure_url,
    });
    expect(mockSharp).toHaveBeenCalledWith(expect.any(Buffer), { limitInputPixels: 100_000_000 });
    expect(mockSharp.mock.results[0]?.value.resize).toHaveBeenCalledWith({
      width: 2048,
      height: 2048,
      fit: 'inside',
      withoutEnlargement: true,
    });
    expect(mockSharp.mock.results[0]?.value.webp).toHaveBeenCalledWith({ quality: 80, effort: 6 });
    expect(mockUploadStream).toHaveBeenCalledWith(
      expect.objectContaining({ folder: 'gym-application', format: 'webp', resource_type: 'image' }),
      expect.any(Function)
    );
    expect(mockUploadEnd).toHaveBeenCalledWith(Buffer.from('webp-image'));
  });

  it('reports when Cloudinary credentials are missing', async () => {
    vi.stubEnv('CLOUDINARY_API_SECRET', '');

    const response = await POST(makeRequest(new File(['photo'], 'photo.png', { type: 'image/png' })));

    expect(response.status).toBe(503);
    expect(mockSharp).not.toHaveBeenCalled();
  });
});
