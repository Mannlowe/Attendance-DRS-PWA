import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Attendance, Leave, ERPLink } from '../types';
import { AttendanceLog, fetchAttendanceLogs } from '../api/APIattendancelogs';

interface AppState {
  attendances: Attendance[];
  leaves: Leave[];
  erpLinks: ERPLink[];
  logs: AttendanceLog[];
  logsLoading: boolean;
  logsError: string | null;
  fetchLogs: (employee?: string) => Promise<void>;
  addAttendance: (attendance: Attendance) => void;
  addLeave: (leave: Leave) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      attendances: [],
      leaves: [],
      erpLinks: [
        { id: '1', title: 'Payroll', url: '#', icon: 'wallet' },
        { id: '2', title: 'Performance', url: '#', icon: 'trending-up' },
        { id: '3', title: 'Training', url: '#', icon: 'graduation-cap' },
        { id: '4', title: 'Documents', url: '#', icon: 'file-text' },
      ],
      logs: [],
      logsLoading: false,
      logsError: null,
      fetchLogs: async (employee) => {
        set({ logsLoading: true, logsError: null });
        try {
          const response = await fetchAttendanceLogs({ employee, limit: 15 });
          const sortedLogs = (response.logs || []).sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
          set({ logs: sortedLogs, logsLoading: false });
        } catch (e) {
          set({ logsError: 'Failed to fetch attendance logs.', logsLoading: false });
        }
      },
      addAttendance: (attendance) =>
        set((state) => ({
          attendances: [...state.attendances, attendance],
        })),
      addLeave: (leave) =>
        set((state) => ({
          leaves: [...state.leaves, leave],
        })),
    }),
    {
      name: 'employee-storage',
    }
  )
);
