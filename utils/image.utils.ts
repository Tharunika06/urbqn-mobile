// utils/image.utils.ts
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat, ImageResult } from 'expo-image-manipulator';

// Define ImagePickerAsset type
type ImagePickerAsset = {
  uri: string;
  width: number;
  height: number;
  base64?: string;
  type?: 'image' | 'video';
  fileName?: string | null;
  fileSize?: number;
};

// ============ Permission Helpers ============
export const requestMediaPermissions = async (): Promise<boolean> => {
  try {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    return cameraPermission.granted && mediaLibraryPermission.granted;
  } catch (error) {
    console.error('Permission request error:', error);
    return false;
  }
};

export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    return permission.granted;
  } catch (error) {
    console.error('Camera permission error:', error);
    return false;
  }
};

export const requestMediaLibraryPermission = async (): Promise<boolean> => {
  try {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return permission.granted;
  } catch (error) {
    console.error('Media library permission error:', error);
    return false;
  }
};

// ============ Image Picker Helpers ============
export const pickImageFromLibrary = async (options?: {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
  base64?: boolean;
}): Promise<ImagePickerAsset | null> => {
  try {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) {
      console.warn('Media library permission denied');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: options?.allowsEditing ?? true,
      aspect: options?.aspect ?? [1, 1],
      quality: options?.quality ?? 0.8,
      base64: options?.base64 ?? true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    return result.assets[0];
  } catch (error) {
    console.error('Image picker error:', error);
    return null;
  }
};

export const pickImageFromCamera = async (options?: {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
}): Promise<ImagePickerAsset | null> => {
  try {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      console.warn('Camera permission denied');
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: options?.allowsEditing ?? true,
      aspect: options?.aspect ?? [1, 1],
      quality: options?.quality ?? 0.8,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    return result.assets[0];
  } catch (error) {
    console.error('Camera error:', error);
    return null;
  }
};

// ============ Image Conversion Helpers ============
export const convertToBase64 = async (
  uri: string,
  options?: {
    width?: number;
    height?: number;
    compress?: number;
    format?: SaveFormat;
  }
): Promise<string> => {
  try {
    const manipulatedImage = await manipulateAsync(
      uri,
      [{ resize: { width: options?.width ?? 400, height: options?.height ?? 400 } }],
      { 
        compress: options?.compress ?? 0.7, 
        format: options?.format ?? SaveFormat.JPEG, 
        base64: true 
      }
    );

    if (!manipulatedImage.base64) {
      throw new Error('Failed to convert image to base64');
    }

    return `data:image/jpeg;base64,${manipulatedImage.base64}`;
  } catch (error) {
    console.error('Base64 conversion error:', error);
    throw error;
  }
};

export const assetToBase64 = async (
  asset: ImagePickerAsset,
  options?: {
    width?: number;
    height?: number;
    compress?: number;
  }
): Promise<string> => {
  if (asset.base64) {
    const mimeType = getMimeTypeFromUri(asset.uri);
    return `data:${mimeType};base64,${asset.base64}`;
  }

  return convertToBase64(asset.uri, options);
};

// ============ MIME Type Helpers ============
export const getMimeTypeFromUri = (uri: string): string => {
  const extension = uri.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    case 'jpg':
    case 'jpeg':
    default:
      return 'image/jpeg';
  }
};

export const getMimeTypeFromBase64 = (base64: string): string | null => {
  const match = base64.match(/data:(image\/[a-z]+);base64,/);
  return match ? match[1] : null;
};

// ============ Image Manipulation Helpers ============
export const resizeImage = async (
  uri: string,
  width: number,
  height: number
): Promise<string> => {
  try {
    const result: ImageResult = await manipulateAsync(
      uri,
      [{ resize: { width, height } }],
      { 
        compress: 0.8, 
        format: SaveFormat.JPEG,
        base64: false
      }
    );
    return result.uri;
  } catch (error) {
    console.error('Image resize error:', error);
    throw error;
  }
};

export const compressImage = async (
  uri: string,
  compressionFactor: number = 0.7
): Promise<string> => {
  try {
    const result: ImageResult = await manipulateAsync(
      uri,
      [],
      { 
        compress: compressionFactor, 
        format: SaveFormat.JPEG,
        base64: false
      }
    );
    return result.uri;
  } catch (error) {
    console.error('Image compression error:', error);
    throw error;
  }
};

// ============ Image Validation Helpers ============
export const isValidImageUri = (uri: string): boolean => {
  return Boolean(uri && (uri.startsWith('file://') || uri.startsWith('content://')));
};

export const isValidBase64Image = (base64: string): boolean => {
  return Boolean(base64 && base64.startsWith('data:image/'));
};

export const getImageDimensions = async (uri: string): Promise<{ width: number; height: number } | null> => {
  try {
    return new Promise((resolve, reject) => {
      const Image = require('react-native').Image;
      Image.getSize(
        uri,
        (width: number, height: number) => resolve({ width, height }),
        (error: Error) => reject(error)
      );
    });
  } catch (error) {
    console.error('Failed to get image dimensions:', error);
    return null;
  }
};

// ============ Image Size Helpers ============
export const getBase64Size = (base64: string): number => {
  return (base64.length * 3) / 4;
};

export const getBase64SizeMB = (base64: string): number => {
  const sizeInBytes = getBase64Size(base64);
  return sizeInBytes / (1024 * 1024);
};

export const isImageSizeValid = (base64: string, maxSizeMB: number = 5): boolean => {
  return getBase64SizeMB(base64) <= maxSizeMB;
};

// ============ Combined Image Picker with Base64 ============
export const pickAndConvertImage = async (
  source: 'library' | 'camera' = 'library',
  options?: {
    allowsEditing?: boolean;
    aspect?: [number, number];
    quality?: number;
    width?: number;
    height?: number;
    compress?: number;
  }
): Promise<string | null> => {
  try {
    let asset: ImagePickerAsset | null;

    if (source === 'camera') {
      asset = await pickImageFromCamera(options);
    } else {
      asset = await pickImageFromLibrary(options);
    }

    if (!asset) {
      return null;
    }

    return await assetToBase64(asset, {
      width: options?.width,
      height: options?.height,
      compress: options?.compress,
    });
  } catch (error) {
    console.error('Pick and convert image error:', error);
    return null;
  }
};