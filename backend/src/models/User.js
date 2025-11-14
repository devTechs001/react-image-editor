import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    avatar: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ['user', 'premium', 'admin'],
      default: 'user',
    },
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'basic', 'pro', 'enterprise'],
        default: 'free',
      },
      status: {
        type: String,
        enum: ['active', 'inactive', 'cancelled'],
        default: 'active',
      },
      startDate: Date,
      endDate: Date,
    },
    usage: {
      images: { type: Number, default: 0 },
      videos: { type: Number, default: 0 },
      aiRequests: { type: Number, default: 0 },
      storage: { type: Number, default: 0 }, // in bytes
    },
    limits: {
      images: { type: Number, default: 100 },
      videos: { type: Number, default: 10 },
      aiRequests: { type: Number, default: 50 },
      storage: { type: Number, default: 1073741824 }, // 1GB
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    emailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// Generate auth token
userSchema.methods.generateAuthToken = async function () {
  const token = jwt.sign({ userId: this._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  this.tokens = this.tokens.concat({ token });
  await this.save();

  return token;
};

// Compare password
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Remove sensitive data
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.tokens;
  delete user.verificationToken;
  delete user.resetPasswordToken;
  return user;
};

export default mongoose.model('User', userSchema);