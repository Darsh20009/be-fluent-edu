export const STORAGE_STATUSES = ['AVAILABLE', 'PROVIDER_UNAVAILABLE', 'UPLOAD_FAILED'] as const

export interface StorageUploadInput {
  bytes: Uint8Array
  contentType: string
  fileName: string
  ownerUserId: string
  entityType: 'HOMEWORK_SUBMISSION'
  entityId: string
}

export interface StoredObject {
  key: string
  contentType: string
  size: number
}

export interface StorageProvider {
  isConfigured(): boolean
  put(input: StorageUploadInput): Promise<StoredObject>
  getSignedUrl(key: string): Promise<string>
  delete(key: string): Promise<void>
}

export class UnavailableStorageProvider implements StorageProvider {
  isConfigured() { return false }
  async put(): Promise<StoredObject> { throw new Error('Storage provider is not configured') }
  async getSignedUrl(): Promise<string> { throw new Error('Storage provider is not configured') }
  async delete(): Promise<void> { throw new Error('Storage provider is not configured') }
}

export function storageProviderStatus(provider: StorageProvider = new UnavailableStorageProvider()) {
  return provider.isConfigured()
    ? { configured: true, status: 'AVAILABLE' as const }
    : { configured: false, status: 'PROVIDER_UNAVAILABLE' as const }
}