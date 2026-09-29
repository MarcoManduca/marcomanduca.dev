/** Allowed S3 key prefixes for uploads (`MediaPrefix`). */
export const MEDIA_PREFIXES = [
  'images/projects/',
  'images/learning/',
  'cv/',
] as const
export type MediaPrefix = (typeof MEDIA_PREFIXES)[number]

/** Request for a presigned PUT URL (`PresignUploadRequest`). */
export interface PresignRequest {
  prefix: MediaPrefix
  filename: string
  content_type: string
  /** File size in bytes; signed into the URL so S3 rejects any other size. */
  content_length: number
}

/** A presigned URL and the key it targets (`PresignDownloadResponse`). */
export interface PresignResponse {
  url: string
  key: string
  expires_in: number
}

/** Presigned PUT URL for an upload (`PresignUploadResponse`). */
export interface PresignUploadResponse extends PresignResponse {
  /**
   * Where the site serves an uploaded image (`/media/images/...`), to use as
   * an image source in content; null for the CV, which stays private.
   */
  public_path: string | null
}
