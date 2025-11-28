import React, { useState, useEffect } from 'react';
import { User, AttendanceRecord, Coordinates } from './types';
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
  Camera
} from 'lucide-react';

// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Auth Logic
  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
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
  const [activeTab, setActiveTab] = useState<'USERS' | 'REPORTS'>('USERS');
  const [users, setUsers] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  // Add User State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ fullName: '', username: '', password: '', unit: '' });

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setUsers(DB.getUsers());
    setAttendance(DB.getAttendanceRecords());
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div>
               <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-800">Rekap Presensi</h2>
              </div>
              <div className="overflow-x-auto">
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
                  <tbody className="divide-y divide-gray-100">
                    {attendance.length === 0 ? (
                        <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">Belum ada data presensi</td></tr>
                    ) : (
                        attendance.slice().reverse().map(record => (
                        <tr key={record.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">{record.date}</td>
                            <td className="px-6 py-4 font-medium text-gray-900">{record.userFullName}</td>
                            <td className="px-6 py-4">{record.userUnit}</td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col">
                                    <span className="font-semibold text-green-600">{new Date(record.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    <span className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={10}/> {record.checkInLocation}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <img src={record.checkInPhoto} alt="In" className="h-12 w-12 rounded-lg object-cover border border-gray-200 shadow-sm cursor-pointer hover:scale-150 transition-transform origin-left" />
                            </td>
                            <td className="px-6 py-4">
                                {record.checkOutTime ? (
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-red-600">{new Date(record.checkOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        <span className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={10}/> {record.checkOutLocation}</span>
                                    </div>
                                ) : (
                                    <span className="text-gray-400 italic text-xs">Belum pulang</span>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                {record.checkOutPhoto && (
                                     <img src={record.checkOutPhoto} alt="Out" className="h-12 w-12 rounded-lg object-cover border border-gray-200 shadow-sm cursor-pointer hover:scale-150 transition-transform origin-left" />
                                )}
                            </td>
                        </tr>
                        ))
                    )}
                  </tbody>
                </table>
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
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Refresh record
    setTodayRecord(DB.getTodayAttendance(user.id));
    
    // Live Clock
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [user.id]);

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
          }
        );
      }
    });
  };

  const handleCapture = async (photoBase64: string) => {
    setLoadingLoc(true);
    try {
      const coords = await getGeolocation();
      const locString = `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`;
      const now = new Date().toISOString();
      const today = now.split('T')[0];

      if (cameraMode === 'IN') {
        const newRecord: AttendanceRecord = {
          id: `att-${Date.now()}`,
          userId: user.id,
          userFullName: user.fullName,
          userUnit: user.unit,
          date: today,
          checkInTime: now,
          checkInLocation: locString,
          checkInPhoto: photoBase64
        };
        DB.saveAttendance(newRecord);
      } else {
        if (todayRecord) {
            const updatedRecord: AttendanceRecord = {
                ...todayRecord,
                checkOutTime: now,
                checkOutLocation: locString,
                checkOutPhoto: photoBase64
            };
            DB.saveAttendance(updatedRecord);
        }
      }
      
      setTodayRecord(DB.getTodayAttendance(user.id));
      setIsCameraOpen(false);
    } catch (error) {
      alert("Gagal mendapatkan lokasi. Pastikan GPS aktif.");
      console.error(error);
    } finally {
      setLoadingLoc(false);
    }
  };

  const openCamera = (mode: 'IN' | 'OUT') => {
    setCameraMode(mode);
    setIsCameraOpen(true);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
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
                     <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin size={14} />
                        <span className="truncate">{todayRecord.checkInLocation}</span>
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
                    <p className="text-xs text-gray-400 mt-3">Pastikan Anda berada di lokasi kantor</p>
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
                     <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin size={14} />
                        <span className="truncate">{todayRecord.checkOutLocation}</span>
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
            <p>Mendapatkan Lokasi GPS...</p>
        </div>
      )}

    </div>
  );
};

export default App;
