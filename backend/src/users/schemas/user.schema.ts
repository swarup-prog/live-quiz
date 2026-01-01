// src/users/schemas/user.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * User Schema
 * Represents a user in the system (student, teacher, admin)
 */
@Schema({
  timestamps: true, // Automatically adds createdAt and updatedAt
  collection: 'users', // Explicit collection name
})
export class User extends Document {
  @Prop({
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
  })
  username: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true, // Index for fast email lookups
  })
  email: string;

  @Prop({
    required: true,
    select: false, // Don't return password by default in queries
  })
  password: string;

  @Prop({
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student',
  })
  role: string;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Group' }],
    default: [],
  })
  groups: Types.ObjectId[];

  @Prop({
    type: String,
    default: null,
  })
  profilePicture?: string;

  @Prop({
    type: Boolean,
    default: true,
  })
  isActive: boolean;

  @Prop({
    type: Date,
    default: null,
  })
  lastLoginAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ groups: 1 });
UserSchema.index({ createdAt: -1 });

// Add virtual for full name if you have firstName/lastName
// UserSchema.virtual('fullName').get(function() {
//   return `${this.firstName} ${this.lastName}`;
// });

// Pre-save hook example (e.g., for password hashing)
// UserSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
//   // Hash password here
//   next();
// });
