export type Role = 'ADMIN' | 'USER';

export interface User {
  id: string;
  username: string;
  password?: string; // Optional because we might verify separately, but stored in mock DB
  fullName: string;
  unit: string;
  role: Role;
  profilePhoto?: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userFullName: string;
  userUnit: string;
  date: string; // YYYY-MM-DD
  
  // Check In
  checkInTime: string; // ISO String
  checkInLocation: string; // Lat, Long string
  checkInPhoto: string; // Base64
  status?: 'ON_TIME' | 'LATE'; // New field for status
  
  // Check Out
  checkOutTime?: string; // ISO String
  checkOutLocation?: string; // Lat, Long string
  checkOutPhoto?: string; // Base64
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userFullName: string;
  userUnit: string;
  date: string; // YYYY-MM-DD
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestDate: string; // ISO String time of request
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface SystemConfig {
  officeLocation?: Coordinates;
  officeName?: string;
  radiusMeters: number;
}