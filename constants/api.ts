import { Platform } from 'react-native';

// Web: use localhost directly
// Android emulator: use 10.0.2.2 (maps to host machine localhost)
// Physical device: replace with your computer's local IP (e.g., 192.168.1.5)
export const API_URL = Platform.OS === 'web' 
  ? 'http://localhost:5000' 
  : 'http://10.0.2.2:5000';

