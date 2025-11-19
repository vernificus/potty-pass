
export interface Student {
  id: string;
  name: string;
  avatar: string;
}

export interface LogEntry {
  id: string;
  studentName: string;
  timeOut: Date;
  timeIn: Date | null;
  durationSeconds: number | null;
}

export enum AppStatus {
  FREE = 'FREE',
  OCCUPIED = 'OCCUPIED',
}
