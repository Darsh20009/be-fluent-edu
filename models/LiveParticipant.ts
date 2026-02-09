import { Schema, model, models } from 'mongoose';

const LiveParticipantSchema = new Schema({
  liveId: { type: Schema.Types.ObjectId, ref: 'LiveSession', required: true },
  userId: { type: String, required: true },
  role: { type: String, enum: ['teacher', 'student'], required: true },
  joinedAt: { type: Date, default: Date.now },
  leftAt: { type: Date },
  raisedHand: { type: Boolean, default: false }
}, { timestamps: true });

const LiveParticipant = models.LiveParticipant || model('LiveParticipant', LiveParticipantSchema);
export default LiveParticipant;