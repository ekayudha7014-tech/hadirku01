import { User, AttendanceRecord, LeaveRequest, SystemConfig } from '../types';

const USERS_KEY = 'hadirku_users';
const ATTENDANCE_KEY = 'hadirku_attendance';
const LEAVES_KEY = 'hadirku_leaves';
const CONFIG_KEY = 'hadirku_config';

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

export const changePassword = (userId: string, oldPass: string, newPass: string): boolean => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === userId);
  
  if (index !== -1 && users[index].password === oldPass) {
    users[index].password = newPass;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return true;
  }
  return false;
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

// --- LEAVE REQUESTS ---

export const getLeaveRequests = (): LeaveRequest[] => {
  const stored = localStorage.getItem(LEAVES_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const addLeaveRequest = (request: LeaveRequest): void => {
  const requests = getLeaveRequests();
  requests.push(request);
  localStorage.setItem(LEAVES_KEY, JSON.stringify(requests));
};

export const updateLeaveStatus = (id: string, status: 'APPROVED' | 'REJECTED'): void => {
  const requests = getLeaveRequests();
  const index = requests.findIndex(r => r.id === id);
  if (index >= 0) {
    requests[index].status = status;
    localStorage.setItem(LEAVES_KEY, JSON.stringify(requests));
  }
};

// --- SYSTEM CONFIG ---

export const getSystemConfig = (): SystemConfig => {
  const stored = localStorage.getItem(CONFIG_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // Default config
  return {
    radiusMeters: 500,
    officeName: 'Lokasi Sekolah'
  };
};

export const saveSystemConfig = (config: SystemConfig): void => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
};