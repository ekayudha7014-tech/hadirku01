import { User, AttendanceRecord } from '../types';

const USERS_KEY = 'hadirku_users';
const ATTENDANCE_KEY = 'hadirku_attendance';

// Initialize default admin if not exists
const initDB = () => {
  const users = localStorage.getItem(USERS_KEY);
  if (!users) {
    const defaultAdmin: User = {
      id: 'admin-001',
      username: 'admin',
      password: '123456', // In a real app, hash this!
      fullName: 'Administrator',
      unit: 'IT Dept',
      role: 'ADMIN'
    };
    localStorage.setItem(USERS_KEY, JSON.stringify([defaultAdmin]));
  }
};

export const getUsers = (): User[] => {
  initDB();
  const stored = localStorage.getItem(USERS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const addUser = (user: User): void => {
  const users = getUsers();
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getAttendanceRecords = (): AttendanceRecord[] => {
  const stored = localStorage.getItem(ATTENDANCE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveAttendance = (record: AttendanceRecord): void => {
  const records = getAttendanceRecords();
  const index = records.findIndex(r => r.id === record.id);
  
  if (index >= 0) {
    // Update existing
    records[index] = record;
  } else {
    // Add new
    records.push(record);
  }
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
};

export const getTodayAttendance = (userId: string): AttendanceRecord | undefined => {
  const records = getAttendanceRecords();
  const today = new Date().toISOString().split('T')[0];
  return records.find(r => r.userId === userId && r.date === today);
};
