import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  preferences: {
    voiceLang: { type: String, default: 'Auto-detect' },
    voice: { type: String, default: 'Wave' },
    language: { type: String, default: 'English' },
    theme: { type: String, default: 'system' },
    ttsSpeed: { type: String, default: 'Normal' },
    autoRead: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
