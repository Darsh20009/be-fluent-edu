export interface LiveSession {
  sessionId: string;
  teacherId: string;
  status: string;
  startedAt: Date;
  endedAt?: Date;
}
