// utils/validation.utils.ts
import type { ProfileData } from '../types/index';

// ============ Email Validation ============
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  if (!email || !email.trim()) {
    return { valid: false, error: 'Email is required' };
  }
  
  if (!isValidEmail(email)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }
  
  return { valid: true };
};

// ============ Phone Validation ============
export const isValidPhone = (phone: string): boolean => {
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length === 10;
};

export const validatePhone = (phone: string): { valid: boolean; error?: string } => {
  if (!phone || !phone.trim()) {
    return { valid: false, error: 'Phone number is required' };
  }
  
  if (!isValidPhone(phone)) {
    return { valid: false, error: 'Please enter a valid 10-digit phone number' };
  }
  
  return { valid: true };
};

export const formatPhoneNumber = (phone: string): string => {
  return phone.replace(/\D/g, '').slice(0, 10);
};

// ============ Date Validation ============
export const isValidDate = (date: string): boolean => {
  const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dobRegex.test(date);
};

export const validateDateOfBirth = (dob: string): { valid: boolean; error?: string } => {
  if (!dob || !dob.trim()) {
    return { valid: false, error: 'Date of birth is required' };
  }
  
  if (!isValidDate(dob)) {
    return { valid: false, error: 'Use format: YYYY-MM-DD' };
  }
  
  const dobDate = new Date(dob);
  const today = new Date();
  
  if (dobDate > today) {
    return { valid: false, error: 'Date of birth cannot be in the future' };
  }
  
  const age = today.getFullYear() - dobDate.getFullYear();
  if (age < 13) {
    return { valid: false, error: 'You must be at least 13 years old' };
  }
  
  return { valid: true };
};

// ============ Name Validation ============
export const isValidName = (name: string, minLength: number = 2): boolean => {
  return Boolean(name && name.trim().length >= minLength);
};

export const validateName = (
  name: string, 
  fieldName: string = 'Name'
): { valid: boolean; error?: string } => {
  if (!name || !name.trim()) {
    return { valid: false, error: `${fieldName} is required` };
  }
  
  if (name.trim().length < 2) {
    return { valid: false, error: `${fieldName} must be at least 2 characters` };
  }
  
  if (name.trim().length > 50) {
    return { valid: false, error: `${fieldName} must be less than 50 characters` };
  }
  
  return { valid: true };
};

// ============ Gender Validation ============
export const isValidGender = (gender: string): boolean => {
  const validGenders = ['male', 'female', 'other'];
  return validGenders.includes(gender.toLowerCase());
};

export const validateGender = (gender: string): { valid: boolean; error?: string } => {
  if (!gender || !gender.trim()) {
    return { valid: false, error: 'Gender is required' };
  }
  
  if (!isValidGender(gender)) {
    return { valid: false, error: 'Please select a valid gender' };
  }
  
  return { valid: true };
};

// ============ Profile Validation ============
export const validateProfile = (
  profile: ProfileData
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  const firstNameValidation = validateName(profile.firstName || '', 'First name');
  if (!firstNameValidation.valid) {
    errors.push(firstNameValidation.error!);
  }
  
  const lastNameValidation = validateName(profile.lastName || '', 'Last name');
  if (!lastNameValidation.valid) {
    errors.push(lastNameValidation.error!);
  }
  
  const emailValidation = validateEmail(profile.email || '');
  if (!emailValidation.valid) {
    errors.push(emailValidation.error!);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

export const validateProfileWithOptional = (
  profile: ProfileData
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  const requiredValidation = validateProfile(profile);
  if (!requiredValidation.valid) {
    errors.push(...requiredValidation.errors);
  }
  
  if (profile.phone) {
    const phoneValidation = validatePhone(profile.phone);
    if (!phoneValidation.valid) {
      errors.push(phoneValidation.error!);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// ============ Image Validation ============
export const isValidImageBase64 = (base64: string): boolean => {
  if (!base64 || typeof base64 !== 'string') return false;
  return base64.startsWith('data:image/');
};

export const validateImageSize = (
  base64: string, 
  maxSizeMB: number = 5
): { valid: boolean; error?: string } => {
  if (!isValidImageBase64(base64)) {
    return { valid: false, error: 'Invalid image format' };
  }
  
  const sizeInBytes = (base64.length * 3) / 4;
  const sizeInMB = sizeInBytes / (1024 * 1024);
  
  if (sizeInMB > maxSizeMB) {
    return { 
      valid: false, 
      error: `Image size must be less than ${maxSizeMB}MB` 
    };
  }
  
  return { valid: true };
};

// ============ Password Validation ============
export const isStrongPassword = (password: string): boolean => {
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(password);
};

export const validatePassword = (password: string): { valid: boolean; error?: string } => {
  if (!password || !password.trim()) {
    return { valid: false, error: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }
  
  if (!isStrongPassword(password)) {
    return { 
      valid: false, 
      error: 'Password must contain uppercase, lowercase, and number' 
    };
  }
  
  return { valid: true };
};

// ============ General Validation Helpers ============
export const isEmpty = (value: any): boolean => {
  return value === null || value === undefined || value === '';
};

export const isNotEmpty = (value: any): boolean => {
  return !isEmpty(value);
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};