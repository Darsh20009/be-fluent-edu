export interface LiveParticipant {
  liveId: string;
  userId: string;
  role: string;
  joinedAt: Date;
  leftAt?: Date;
  raisedHand: boolean;
}
