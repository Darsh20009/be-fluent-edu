import { Schema, model, models } from 'mongoose';

const LiveSessionSchema = new Schema({
  sessionId: { type: String, required: true, unique: true },
  teacherId: { type: String, required: true },
  status: { type: String, enum: ['scheduled', 'live', 'finished'], default: 'scheduled' },
  startedAt: { type: Date },
  endedAt: { type: Date }
}, { timestamps: true });

const LiveSession = models.LiveSession || model('LiveSession', LiveSessionSchema);
export default LiveSession;