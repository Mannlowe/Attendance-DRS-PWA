export interface Attendance {
  id: string;
  timestamp: Date;
  photo: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface Leave {
  id: string;
  startDate: Date;
  endDate: Date;
  type: 'sick' | 'vacation' | 'personal';
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
}

export interface ERPLink {
  id: string;
  title: string;
  url: string;
  icon: string;
}