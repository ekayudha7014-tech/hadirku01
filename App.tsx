import React, { useState, useEffect } from 'react';
import { User, AttendanceRecord, Coordinates, LeaveRequest, SystemConfig } from './types';
import * as DB from './services/db';
import { CameraCapture } from './components/CameraCapture';
import { 
  LogOut, 
  UserPlus, 
  MapPin, 
  Clock, 
  ClipboardList, 
  Users, 
  LayoutDashboard,
  CheckCircle,
  XCircle,
  Camera,
  BarChart3,
  Download,
  FileText,
  Calendar,
  Check,
  X,
  Lock,
  KeyRound,
  Settings,
  LocateFixed,
  Maximize2,
  RefreshCcw
} from 'lucide-react';

// --- UTILS ---

// Rumus Haversine untuk menghitung jarak dalam meter
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Jari-jari bumi dalam meter
  const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c; // dalam meter
  return d;
};

// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Change Password State
  const [isPwdModalOpen, setIsPwdModalOpen] = useState(false);
  const [pwdForm, setPwdForm] = useState({ old: '', new: '', confirm: '' });
  
  // Auth Logic
  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (pwdForm.new !== pwdForm.confirm) {
        alert("Konfirmasi password baru tidak cocok.");
        return;
    }

    if (pwdForm.new.length < 4) {
        alert("Password baru minimal 4 karakter.");
        return;
    }

    const success = DB.changePassword(currentUser.id, pwdForm.old, pwdForm.new);
    if (success) {
        alert("Password berhasil diubah!");
        setIsPwdModalOpen(false);
        setPwdForm({ old: '', new: '', confirm: '' });
        // Update local state to prevent immediate logout issues if we were validating against it
        setCurrentUser({ ...currentUser, password: pwdForm.new });
    } else {
        alert("Password lama salah.");
    }
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                H
              </div>
              <span className="font-bold text-xl text-blue-900 tracking-tight">HADIRKU</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{currentUser.fullName}</p>
                <p className="text-xs text-gray-500">{currentUser.role === 'ADMIN' ? 'Administrator' : currentUser.unit}</p>
              </div>
              
              <button
                onClick={() => setIsPwdModalOpen(true)}
                className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                title="Ubah Password"
              >
                <Lock size={20} />
              </button>

              <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>

              <button 
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentUser.role === 'ADMIN' ? (
          <AdminDashboard />
        ) : (
          <UserDashboard user={currentUser} />
        )}
      </main>

      {/* Change Password Modal */}
      {isPwdModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-fade-in relative">
                <button 
                    onClick={() => setIsPwdModalOpen(false)} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <XCircle size={24} />
                </button>
                
                <div className="text-center mb-6">
                    <div className="h-12 w-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <KeyRound size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Ubah Password</h3>
                    <p className="text-sm text-gray-500">Amankan akun Anda dengan password baru</p>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password Lama</label>
                        <input 
                            type="password" 
                            required 
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="Masukkan password saat ini"
                            value={pwdForm.old}
                            onChange={(e) => setPwdForm({...pwdForm, old: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                        <input 
                            type="password" 
                            required 
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="Minimal 4 karakter"
                            value={pwdForm.new}
                            onChange={(e) => setPwdForm({...pwdForm, new: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
                        <input 
                            type="password" 
                            required 
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="Ulangi password baru"
                            value={pwdForm.confirm}
                            onChange={(e) => setPwdForm({...pwdForm, confirm: e.target.value})}
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 font-medium mt-2 transition-colors shadow-sm"
                    >
                        Simpan Password
                    </button>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

// --- LOGIN PAGE ---

interface LoginProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const users = DB.getUsers();
    
    const foundUser = users.find(u => u.username === username && u.password === password);

    if (foundUser) {
      onLogin(foundUser);
    } else {
      setError('Username atau password salah');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-700 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 p-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">HADIRKU</h1>
          <p className="text-blue-100">Sistem Presensi Online</p>
        </div>
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
                <XCircle size={16} /> {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Masukkan username"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Masukkan password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Login
            </button>
          </form>
          <div className="mt-6 text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Hadirku App. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

// --- ADMIN DASHBOARD ---

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'USERS' | 'REPORTS' | 'SETTINGS'>('USERS');
  const [users, setUsers] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [config, setConfig] = useState<SystemConfig>({ radiusMeters: 500 });
  
  // View Photo Modal State
  const [viewPhoto, setViewPhoto] = useState<string | null>(null);

  // Add User State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ fullName: '', username: '', password: '', unit: '' });
  const [loadingConfig, setLoadingConfig] = useState(false);

  // Reset User Password State
  const [resetPwdUser, setResetPwdUser] = useState<User | null>(null);
  const [adminNewPass, setAdminNewPass] = useState('');

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setUsers(DB.getUsers());
    setAttendance(DB.getAttendanceRecords());
    setLeaves(DB.getLeaveRequests());
    setConfig(DB.getSystemConfig());
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password || !newUser.fullName || !newUser.unit) return;

    const user: User = {
      id: `user-${Date.now()}`,
      role: 'USER',
      ...newUser
    };
    
    DB.addUser(user);
    setNewUser({ fullName: '', username: '', password: '', unit: '' });
    setIsAddModalOpen(false);
    refreshData();
  };

  const handleAdminResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetPwdUser && adminNewPass) {
        if(adminNewPass.length < 4) {
            alert("Password minimal 4 karakter");
            return;
        }
        DB.resetUserPassword(resetPwdUser.id, adminNewPass);
        alert(`Password untuk user ${resetPwdUser.fullName} berhasil direset.`);
        setResetPwdUser(null);
        setAdminNewPass('');
        refreshData();
    }
  };

  const handleLeaveAction = (id: string, status: 'APPROVED' | 'REJECTED') => {
    DB.updateLeaveStatus(id, status);
    refreshData();
  };

  const handleSetCurrentLocation = () => {
    setLoadingConfig(true);
    if (!navigator.geolocation) {
        alert("Geolocation tidak didukung oleh browser ini.");
        setLoadingConfig(false);
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const newConfig: SystemConfig = {
                ...config,
                officeLocation: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }
            };
            DB.saveSystemConfig(newConfig);
            setConfig(newConfig);
            setLoadingConfig(false);
            alert("Lokasi sekolah berhasil diperbarui ke lokasi Anda saat ini.");
        },
        (error) => {
            console.error(error);
            alert("Gagal mengambil lokasi. Pastikan GPS aktif.");
            setLoadingConfig(false);
        }
    );
  };

  // Logic untuk Grafik Bulanan
  const getMonthlyStats = () => {
    const currentYear = new Date().getFullYear();
    const monthlyCounts = new Array(12).fill(0);

    attendance.forEach(record => {
      const date = new Date(record.date);
      if (date.getFullYear() === currentYear) {
        monthlyCounts[date.getMonth()]++;
      }
    });

    return monthlyCounts;
  };

  // Logic Ekspor Excel (CSV)
  const handleExportExcel = () => {
    if (attendance.length === 0) {
        alert("Tidak ada data untuk diekspor.");
        return;
    }

    // Header CSV
    const headers = ["Tanggal", "Nama Lengkap", "Unit Kerja", "Status Masuk", "Jam Masuk", "Lokasi Masuk", "Jam Pulang", "Lokasi Pulang"];
    
    // Data Rows
    const rows = attendance.map(record => {
        const checkInTimeStr = new Date(record.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const checkOutTimeStr = record.checkOutTime 
            ? new Date(record.checkOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
            : "-";
        
        // Escape quotes untuk menghindari error CSV jika ada koma dalam data
        const safeName = `"${record.userFullName}"`;
        const safeUnit = `"${record.userUnit}"`;
        const safeLocIn = `"${record.checkInLocation}"`;
        const safeLocOut = record.checkOutLocation ? `"${record.checkOutLocation}"` : "-";
        const status = record.status === 'LATE' ? 'Terlambat' : 'Tepat Waktu';

        return [
            record.date,
            safeName,
            safeUnit,
            status,
            checkInTimeStr,
            safeLocIn,
            checkOutTimeStr,
            safeLocOut
        ].join(",");
    });

    // Gabungkan Header dan Rows dengan newline
    const csvContent = [headers.join(","), ...rows].join("\n");

    // Buat Blob dan Link Download
    // \uFEFF adds BOM so Excel opens it with correct UTF-8 encoding
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const fileName = `Laporan_Hadirku_${new Date().toISOString().split('T')[0]}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const monthlyStats = getMonthlyStats();
  const maxStat = Math.max(...monthlyStats, 1); // Hindari pembagian dengan 0
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

  return (
    <div className="space-y-6">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Karyawan</p>
            <p className="text-2xl font-bold">{users.filter(u => u.role === 'USER').length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full">
             <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Hadir Hari Ini</p>
            <p className="text-2xl font-bold">
              {attendance.filter(r => r.date === new Date().toISOString().split('T')[0]).length}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Unit Kerja</p>
            <p className="text-2xl font-bold">{new Set(users.map(u => u.unit)).size}</p>
          </div>
        </div>
      </div>

      {/* Bar Chart Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                <BarChart3 size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Statistik Presensi Bulanan ({new Date().getFullYear()})</h3>
        </div>
        
        <div className="h-64 w-full">
            <div className="h-full flex items-end justify-between gap-2 sm:gap-4">
                {monthlyStats.map((count, index) => {
                    const heightPercentage = (count / maxStat) * 100;
                    return (
                        <div key={index} className="flex-1 flex flex-col items-center group relative">
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                                    {count} Kehadiran
                                    <div className="absolute top-full left-1/2 -ml-1 border-4 border-transparent border-t-gray-800"></div>
                                </div>
                            </div>
                            
                            {/* Bar */}
                            <div 
                                className="w-full max-w-[40px] bg-indigo-500 rounded-t-md hover:bg-indigo-600 transition-all duration-300 relative"
                                style={{ height: `${heightPercentage === 0 ? 2 : heightPercentage}%` }}
                            >
                            </div>
                            
                            {/* Label */}
                            <span className="mt-2 text-xs text-gray-500 font-medium truncate w-full text-center">
                                {months[index]}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200 flex">
          <button
            onClick={() => setActiveTab('USERS')}
            className={`flex-1 py-4 px-6 text-sm font-medium text-center transition-colors ${
              activeTab === 'USERS' 
                ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
                : 'bg-gray-50 text-gray-500 hover:text-gray-700'
            }`}
          >
            Manajemen User
          </button>
          <button
            onClick={() => setActiveTab('REPORTS')}
            className={`flex-1 py-4 px-6 text-sm font-medium text-center transition-colors ${
              activeTab === 'REPORTS' 
                ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
                : 'bg-gray-50 text-gray-500 hover:text-gray-700'
            }`}
          >
            Laporan Presensi
          </button>
          <button
            onClick={() => setActiveTab('SETTINGS')}
            className={`flex-1 py-4 px-6 text-sm font-medium text-center transition-colors ${
              activeTab === 'SETTINGS' 
                ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
                : 'bg-gray-50 text-gray-500 hover:text-gray-700'
            }`}
          >
            Pengaturan
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'USERS' ? (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-800">Daftar Karyawan</h2>
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                >
                  <UserPlus size={18} /> Tambah User
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-gray-700 font-semibold uppercase">
                    <tr>
                      <th className="px-6 py-3">Nama Lengkap</th>
                      <th className="px-6 py-3">Username</th>
                      <th className="px-6 py-3">Unit Kerja</th>
                      <th className="px-6 py-3">Role</th>
                      <th className="px-6 py-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{user.fullName}</td>
                        <td className="px-6 py-4">{user.username}</td>
                        <td className="px-6 py-4">
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{user.unit}</span>
                        </td>
                        <td className="px-6 py-4 text-xs">{user.role}</td>
                        <td className="px-6 py-4 text-xs">
                            {user.role !== 'ADMIN' && (
                                <button 
                                    onClick={() => setResetPwdUser(user)}
                                    className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-orange-100 hover:text-orange-600 transition-colors"
                                    title="Reset Password"
                                >
                                    <KeyRound size={16} />
                                </button>
                            )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === 'REPORTS' ? (
            <div className="space-y-8">
               
               {/* SECTION: Permohonan Izin */}
               <div>
                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText size={20} className="text-orange-500" /> 
                    Permohonan Izin
                 </h3>
                 <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-orange-50 text-orange-800 font-semibold uppercase">
                            <tr>
                                <th className="px-6 py-3">Tanggal Izin</th>
                                <th className="px-6 py-3">Nama</th>
                                <th className="px-6 py-3">Unit</th>
                                <th className="px-6 py-3">Alasan</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {leaves.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-400">Belum ada permohonan izin</td></tr>
                            ) : (
                                leaves.slice().reverse().map(leave => (
                                    <tr key={leave.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium">{leave.date}</td>
                                        <td className="px-6 py-4">{leave.userFullName}</td>
                                        <td className="px-6 py-4">{leave.userUnit}</td>
                                        <td className="px-6 py-4 italic">"{leave.reason}"</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                leave.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                leave.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {leave.status === 'APPROVED' ? 'Disetujui' :
                                                 leave.status === 'REJECTED' ? 'Ditolak' : 'Menunggu'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {leave.status === 'PENDING' && (
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => handleLeaveAction(leave.id, 'APPROVED')}
                                                        className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200" title="Setujui">
                                                        <Check size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleLeaveAction(leave.id, 'REJECTED')}
                                                        className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200" title="Tolak">
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                 </div>
               </div>

               {/* SECTION: Rekap Presensi */}
               <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <ClipboardList size={20} className="text-blue-500" />
                        Rekap Kehadiran
                    </h3>
                    <button 
                      onClick={handleExportExcel}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
                    >
                      <Download size={18} /> Ekspor Excel
                    </button>
                  </div>
                  <div className="overflow-x-auto border rounded-lg">
                     <table className="w-full text-left text-sm text-gray-600">
                      <thead className="bg-gray-50 text-gray-700 font-semibold uppercase">
                        <tr>
                          <th className="px-6 py-3">Tanggal</th>
                          <th className="px-6 py-3">Nama</th>
                          <th className="px-6 py-3">Unit</th>
                          <th className="px-6 py-3">Masuk</th>
                          <th className="px-6 py-3">Foto Masuk</th>
                          <th className="px-6 py-3">Pulang</th>
                          <th className="px-6 py-3">Foto Pulang</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {attendance.length === 0 ? (
                            <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">Belum ada data presensi</td></tr>
                        ) : (
                            attendance.slice().reverse().map(record => (
                            <tr key={record.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">{record.date}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">{record.userFullName}</td>
                                <td className="px-6 py-4">{record.userUnit}</td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col items-start">
                                        <span className="font-semibold text-green-600">{new Date(record.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        {record.status === 'LATE' && (
                                            <span className="mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600">
                                                TERLAMBAT
                                            </span>
                                        )}
                                        <span className="text-xs text-gray-400 flex items-center gap-1 max-w-[150px] truncate mt-1" title={record.checkInLocation}><MapPin size={10}/> {record.checkInLocation}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="relative group cursor-zoom-in w-12 h-12" onClick={() => setViewPhoto(record.checkInPhoto)}>
                                        <img 
                                            src={record.checkInPhoto} 
                                            alt="In" 
                                            className="h-12 w-12 rounded-lg object-cover border border-gray-200 shadow-sm group-hover:opacity-90 transition-opacity" 
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 rounded-lg transition-opacity">
                                            <Maximize2 size={16} className="text-white drop-shadow-md" />
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {record.checkOutTime ? (
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-red-600">{new Date(record.checkOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                            <span className="text-xs text-gray-400 flex items-center gap-1 max-w-[150px] truncate" title={record.checkOutLocation}><MapPin size={10}/> {record.checkOutLocation}</span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 italic text-xs">Belum pulang</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {record.checkOutPhoto && (
                                        <div className="relative group cursor-zoom-in w-12 h-12" onClick={() => setViewPhoto(record.checkOutPhoto)}>
                                            <img 
                                                src={record.checkOutPhoto} 
                                                alt="Out" 
                                                className="h-12 w-12 rounded-lg object-cover border border-gray-200 shadow-sm group-hover:opacity-90 transition-opacity" 
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 rounded-lg transition-opacity">
                                                <Maximize2 size={16} className="text-white drop-shadow-md" />
                                            </div>
                                        </div>
                                    )}
                                </td>
                            </tr>
                            ))
                        )}
                      </tbody>
                    </table>
                  </div>
               </div>

            </div>
          ) : (
            /* TAB SETTINGS */
            <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
                        <Settings size={24} />
                    </div>
                    <h2 className="text-lg font-bold text-gray-800">Pengaturan Lokasi Sekolah</h2>
                </div>

                <div className="bg-white p-6 rounded-xl border border-blue-100 bg-blue-50/50">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2">Lokasi Sekolah / Kantor Saat Ini</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Atur titik koordinat lokasi sekolah agar user hanya dapat melakukan presensi dalam radius {config.radiusMeters} meter dari titik ini.
                            </p>
                            
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex-1">
                                    <span className="text-xs text-gray-400 block">Latitude</span>
                                    <span className="font-mono text-gray-800 font-medium">
                                        {config.officeLocation ? config.officeLocation.latitude.toFixed(7) : '-'}
                                    </span>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex-1">
                                    <span className="text-xs text-gray-400 block">Longitude</span>
                                    <span className="font-mono text-gray-800 font-medium">
                                        {config.officeLocation ? config.officeLocation.longitude.toFixed(7) : '-'}
                                    </span>
                                </div>
                            </div>

                            <button 
                                onClick={handleSetCurrentLocation}
                                disabled={loadingConfig}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm disabled:opacity-70"
                            >
                                <LocateFixed size={18} />
                                {loadingConfig ? 'Mendapatkan Lokasi...' : 'Set Lokasi Sekolah Saat Ini'}
                            </button>
                            <p className="text-xs text-gray-500 mt-2">
                                *Pastikan Anda berada di lokasi sekolah saat menekan tombol ini.
                            </p>
                        </div>
                        <div className="hidden md:block w-px bg-blue-200 self-stretch"></div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2">Status Radius</h3>
                            <div className="flex items-center gap-3">
                                <div className="h-24 w-24 rounded-full border-4 border-blue-200 bg-blue-100 flex items-center justify-center flex-col">
                                    <span className="text-xl font-bold text-blue-700">{config.radiusMeters}m</span>
                                    <span className="text-[10px] text-blue-500">Radius</span>
                                </div>
                                <p className="text-sm text-gray-600 max-w-xs">
                                    User tidak dapat melakukan presensi jika berada di luar radius {config.radiusMeters} meter dari titik koordinat yang ditetapkan.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Tambah Karyawan Baru</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input required type="text" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={newUser.fullName} onChange={e => setNewUser({...newUser, fullName: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Kerja</label>
                <input required type="text" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={newUser.unit} onChange={e => setNewUser({...newUser, unit: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input required type="text" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input required type="password" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium mt-2">
                Simpan User
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Admin Reset Password Modal */}
      {resetPwdUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-fade-in relative">
                <button 
                    onClick={() => setResetPwdUser(null)} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <XCircle size={24} />
                </button>
                
                <div className="text-center mb-6">
                    <div className="h-12 w-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <RefreshCcw size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Reset Password User</h3>
                    <p className="text-sm text-gray-500">Ubah password untuk <span className="font-semibold text-gray-800">{resetPwdUser.fullName}</span></p>
                </div>

                <form onSubmit={handleAdminResetPassword} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                        <input 
                            type="text" 
                            required 
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                            placeholder="Masukkan password baru"
                            value={adminNewPass}
                            onChange={(e) => setAdminNewPass(e.target.value)}
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="w-full bg-orange-600 text-white py-2.5 rounded-lg hover:bg-orange-700 font-medium mt-2 transition-colors shadow-sm"
                    >
                        Reset Password
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* View Photo Modal (Lightbox) */}
      {viewPhoto && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-95 backdrop-blur-sm transition-opacity" onClick={() => setViewPhoto(null)}>
            <div className="relative max-w-4xl w-full max-h-screen flex flex-col items-center justify-center animate-fade-in" onClick={e => e.stopPropagation()}>
                <button
                    className="absolute -top-12 right-0 text-white hover:text-gray-300 p-2 transition-colors focus:outline-none"
                    onClick={() => setViewPhoto(null)}
                >
                    <X size={32} />
                </button>
                <div className="bg-gray-800 p-1 rounded-lg shadow-2xl overflow-hidden">
                    <img 
                        src={viewPhoto} 
                        alt="Bukti Kehadiran" 
                        className="max-w-full max-h-[85vh] object-contain rounded-md" 
                    />
                </div>
                <p className="text-gray-400 text-sm mt-4">Klik di luar foto untuk menutup</p>
            </div>
        </div>
      )}
    </div>
  );
};

// --- USER DASHBOARD ---

interface UserDashboardProps {
  user: User;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user }) => {
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | undefined>(undefined);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState<'IN' | 'OUT'>('IN');
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [loadingText, setLoadingText] = useState("Mendapatkan Lokasi GPS...");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Leave State
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveDate, setLeaveDate] = useState(new Date().toISOString().split('T')[0]);
  const [myLeaves, setMyLeaves] = useState<LeaveRequest[]>([]);
  
  // Config
  const [sysConfig, setSysConfig] = useState<SystemConfig>({ radiusMeters: 500 });

  useEffect(() => {
    // Refresh record
    setTodayRecord(DB.getTodayAttendance(user.id));
    
    // Fetch my leaves
    const allLeaves = DB.getLeaveRequests();
    setMyLeaves(allLeaves.filter(l => l.userId === user.id).reverse());
    
    // Fetch Config
    setSysConfig(DB.getSystemConfig());

    // Live Clock
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [user.id, isLeaveModalOpen]); // Refresh when modal closes

  const getGeolocation = (): Promise<Coordinates> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          (error) => {
            reject(error);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    });
  };

  // Fungsi Reverse Geocoding untuk mendapatkan Nama Tempat
  const getPlaceName = async (lat: number, lng: number): Promise<string> => {
    try {
        // Menggunakan Nominatim OpenStreetMap (Free, No API Key required for small usage)
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
            headers: {
                'User-Agent': 'HadirkuApp/1.0'
            }
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        const addr = data.address || {};
        const place = data.display_name || "";
        
        // Membentuk alamat yang rapi
        // Prioritas: Nama Gedung/Tempat -> Jalan -> Kota
        const street = addr.road || addr.pedestrian || addr.building || "";
        const area = addr.village || addr.suburb || addr.city_district || addr.city || addr.town || "";
        
        if (street && area) {
            return `${street}, ${area}`;
        } else if (place) {
            // Ambil 3 bagian pertama dari alamat panjang jika format di atas tidak ada
            return place.split(',').slice(0, 3).join(',');
        } else {
             return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        }

    } catch (error) {
        console.error("Gagal mendapatkan nama tempat:", error);
        return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
  };

  const handleCapture = async (photoBase64: string) => {
    setLoadingLoc(true);
    setLoadingText("Mendapatkan Lokasi GPS...");
    try {
      // 0. Time Validation Logic (New)
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      // Check Out Logic REMOVED based on user request (Allow checkout > 16:00)

      // 1. Get Coordinates
      const coords = await getGeolocation();
      
      // 2. CHECK RADIUS (Geofencing)
      if (sysConfig.officeLocation) {
        const distance = calculateDistance(
            coords.latitude, 
            coords.longitude, 
            sysConfig.officeLocation.latitude, 
            sysConfig.officeLocation.longitude
        );
        
        console.log(`Jarak user ke kantor: ${distance.toFixed(2)} meter`);
        
        if (distance > sysConfig.radiusMeters) {
             alert(`Gagal! Anda berada diluar jangkauan presensi.\n\nJarak Anda: ${distance.toFixed(0)}m\nBatas Maksimal: ${sysConfig.radiusMeters}m\n\nSilakan mendekat ke lokasi sekolah/kantor.`);
             setIsCameraOpen(false);
             return; // Stop process
        }
      }

      // 3. Get Place Name
      setLoadingText("Mendapatkan Detail Alamat...");
      const placeName = await getPlaceName(coords.latitude, coords.longitude);
      
      const nowISO = now.toISOString();
      const today = nowISO.split('T')[0];

      if (cameraMode === 'IN') {
        // Check Late Status Logic: Late if > 07:00
        let attendanceStatus: 'ON_TIME' | 'LATE' = 'ON_TIME';
        if (currentHour > 7 || (currentHour === 7 && currentMinute > 0)) {
            attendanceStatus = 'LATE';
        }

        const newRecord: AttendanceRecord = {
          id: `att-${Date.now()}`,
          userId: user.id,
          userFullName: user.fullName,
          userUnit: user.unit,
          date: today,
          checkInTime: nowISO,
          checkInLocation: placeName,
          checkInPhoto: photoBase64,
          status: attendanceStatus
        };
        DB.saveAttendance(newRecord);
        
        if (attendanceStatus === 'LATE') {
            alert("Presensi berhasil dicatat (Status: Terlambat).");
        } else {
            alert("Presensi berhasil!");
        }

      } else {
        if (todayRecord) {
            const updatedRecord: AttendanceRecord = {
                ...todayRecord,
                checkOutTime: nowISO,
                checkOutLocation: placeName,
                checkOutPhoto: photoBase64
            };
            DB.saveAttendance(updatedRecord);
            alert("Presensi pulang berhasil!");
        }
      }
      
      setTodayRecord(DB.getTodayAttendance(user.id));
      setIsCameraOpen(false);
    } catch (error) {
      alert("Gagal mendapatkan lokasi. Pastikan GPS aktif dan izin diberikan.");
      console.error(error);
    } finally {
      setLoadingLoc(false);
    }
  };

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason || !leaveDate) return;

    const newLeave: LeaveRequest = {
        id: `leave-${Date.now()}`,
        userId: user.id,
        userFullName: user.fullName,
        userUnit: user.unit,
        date: leaveDate,
        reason: leaveReason,
        status: 'PENDING',
        requestDate: new Date().toISOString()
    };

    DB.addLeaveRequest(newLeave);
    setLeaveReason('');
    setLeaveDate(new Date().toISOString().split('T')[0]);
    setIsLeaveModalOpen(false);
    alert("Izin berhasil diajukan! Menunggu persetujuan admin.");
  };

  const openCamera = (mode: 'IN' | 'OUT') => {
    setCameraMode(mode);
    setIsCameraOpen(true);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-10">
      {/* Header Profile */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-white opacity-10 rounded-full"></div>
        
        <div className="relative z-10 flex items-center gap-6">
            <div className="h-20 w-20 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold text-3xl shadow-inner">
                {user.fullName.charAt(0)}
            </div>
            <div>
                <h2 className="text-2xl font-bold mb-1">{user.fullName}</h2>
                <div className="flex items-center gap-2 text-blue-100 bg-blue-700/30 px-3 py-1 rounded-full w-fit">
                    <ClipboardList size={16} />
                    <span className="text-sm font-medium">{user.unit}</span>
                </div>
            </div>
        </div>
      </div>

      {/* Live Clock & Date */}
      <div className="text-center py-4 bg-white rounded-xl shadow-sm border border-gray-100">
        <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">
            {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <div className="text-4xl font-bold text-gray-800 font-mono">
            {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        {/* Helper info jam */}
        <div className="mt-2 text-xs text-gray-400 flex justify-center gap-4">
            <span className="flex items-center gap-1"><Clock size={12}/> Masuk: &lt; 07:00</span>
            <span className="flex items-center gap-1"><Clock size={12}/> Pulang: &ge; 16:00</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* CHECK IN CARD */}
        <div className={`p-6 rounded-2xl border-2 transition-all duration-300 ${todayRecord ? 'bg-green-50 border-green-200' : 'bg-white border-blue-100 hover:border-blue-400 shadow-sm hover:shadow-md'}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-full ${todayRecord ? 'bg-green-200 text-green-700' : 'bg-blue-100 text-blue-600'}`}>
                        <Clock size={24} />
                    </div>
                    <span className="font-bold text-lg text-gray-800">Datang</span>
                </div>
                {todayRecord && <CheckCircle className="text-green-600" size={24} />}
            </div>

            {todayRecord ? (
                <div className="space-y-2">
                     <p className="text-3xl font-bold text-gray-800">
                        {new Date(todayRecord.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                     </p>
                     
                     {todayRecord.status === 'LATE' && (
                        <div className="inline-block px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded mb-1">
                            TERLAMBAT
                        </div>
                     )}

                     <div className="flex items-start gap-2 text-sm text-gray-500">
                        <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                        <span className="break-words line-clamp-2">{todayRecord.checkInLocation}</span>
                     </div>
                     <div className="mt-2 text-xs text-green-700 font-semibold bg-green-100 py-1 px-2 rounded inline-block">
                        Berhasil Absen
                     </div>
                </div>
            ) : (
                <div className="text-center mt-4">
                    <button 
                        onClick={() => openCamera('IN')}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                        <Camera size={20} />
                        Ambil Foto
                    </button>
                    <p className="text-xs text-gray-400 mt-3">Pastikan Anda berada di lokasi sekolah</p>
                </div>
            )}
        </div>

        {/* CHECK OUT CARD */}
        <div className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
            !todayRecord ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-100' : 
            todayRecord.checkOutTime ? 'bg-green-50 border-green-200' : 
            'bg-white border-orange-100 hover:border-orange-400 shadow-sm hover:shadow-md'
        }`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-full ${
                        !todayRecord ? 'bg-gray-200 text-gray-500' :
                        todayRecord.checkOutTime ? 'bg-green-200 text-green-700' : 'bg-orange-100 text-orange-600'
                    }`}>
                        <LogOut size={24} />
                    </div>
                    <span className="font-bold text-lg text-gray-800">Pulang</span>
                </div>
                {todayRecord?.checkOutTime && <CheckCircle className="text-green-600" size={24} />}
            </div>

            {!todayRecord ? (
                <div className="text-center py-6">
                    <p className="text-sm text-gray-400">Silakan absen datang terlebih dahulu.</p>
                </div>
            ) : todayRecord.checkOutTime ? (
                 <div className="space-y-2">
                     <p className="text-3xl font-bold text-gray-800">
                        {new Date(todayRecord.checkOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                     </p>
                     <div className="flex items-start gap-2 text-sm text-gray-500">
                        <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                        <span className="break-words line-clamp-2">{todayRecord.checkOutLocation}</span>
                     </div>
                     <div className="mt-2 text-xs text-green-700 font-semibold bg-green-100 py-1 px-2 rounded inline-block">
                        Selesai Bekerja
                     </div>
                </div>
            ) : (
                <div className="text-center mt-4">
                     <button 
                        onClick={() => openCamera('OUT')}
                        className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                        <Camera size={20} />
                        Ambil Foto Pulang
                    </button>
                    <p className="text-xs text-gray-400 mt-3">Hati-hati di jalan!</p>
                </div>
            )}
        </div>
      </div>

      {/* LEAVE REQUEST SECTION */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FileText className="text-indigo-600" />
                Izin & Cuti
            </h3>
            <button 
                onClick={() => setIsLeaveModalOpen(true)}
                className="px-4 py-2 bg-indigo-50 text-indigo-700 font-medium rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-2"
            >
                <FileText size={18} /> Ajukan Izin
            </button>
        </div>
        
        <div className="space-y-3">
            {myLeaves.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">Belum ada riwayat pengajuan izin.</p>
            ) : (
                myLeaves.slice(0, 3).map(leave => (
                    <div key={leave.id} className="p-3 border rounded-lg flex justify-between items-center bg-gray-50">
                        <div>
                            <p className="font-medium text-gray-800 text-sm">{leave.reason}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <Calendar size={12} /> {leave.date}
                            </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            leave.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                            leave.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                        }`}>
                            {leave.status === 'APPROVED' ? 'Disetujui' :
                             leave.status === 'REJECTED' ? 'Ditolak' : 'Menunggu'}
                        </span>
                    </div>
                ))
            )}
             {myLeaves.length > 3 && <p className="text-center text-xs text-gray-400 mt-2">Menampilkan 3 dari {myLeaves.length} riwayat terakhir</p>}
        </div>
      </div>

      {/* Leave Modal */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Form Pengajuan Izin</h3>
                    <button onClick={() => setIsLeaveModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <XCircle size={24} />
                    </button>
                 </div>
                 <form onSubmit={handleLeaveSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Izin</label>
                        <input 
                            type="date" 
                            required 
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            value={leaveDate}
                            onChange={(e) => setLeaveDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Alasan</label>
                        <textarea 
                            required 
                            rows={3}
                            placeholder="Contoh: Sakit demam, Urusan keluarga, dll."
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            value={leaveReason}
                            onChange={(e) => setLeaveReason(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-medium mt-2">
                        Kirim Pengajuan
                    </button>
                 </form>
            </div>
        </div>
      )}

      {/* Camera Modal */}
      {isCameraOpen && (
        <CameraCapture 
            title={cameraMode === 'IN' ? "Presensi Masuk" : "Presensi Pulang"}
            onCapture={handleCapture}
            onClose={() => setIsCameraOpen(false)}
        />
      )}
      
      {loadingLoc && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex flex-col items-center justify-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
            <p>{loadingText}</p>
        </div>
      )}

    </div>
  );
};

export default App;
