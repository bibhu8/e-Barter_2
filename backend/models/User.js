import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: function() {
      return this.provider === 'local'; // Only required for local users
    },
  },
  provider: {
    type: String,
    required: true,
    enum: ['local', 'google'], // Add other providers if needed
    default: 'local',
  },
},
{
  timestamps: true
});

export default mongoose.model("User", UserSchema);
