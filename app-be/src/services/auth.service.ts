import { register } from "node:module";
import { userRepository } from "../repositories/user.repository";
import { hashPassword, comparePassword } from "../utils/bcrypt";
import { generateAccessToken,generateRefreshToken } from "../utils/jwt";
import { Role } from "@prisma/client";

export const authService = {
  register: async (data: {name: string, email: string, password: string, role?: string, company?: string, jobTitle?: string}) => {
    const existing = await userRepository.findByEmail(data.email)
    if (existing) {
      throw new Error('User already exists')
    }

    const hashed= await hashPassword(data.password)
    const userRole = data.role === 'hr' ? Role.hr : Role.candidate
    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      password: hashed,
      role: userRole,
      company: userRole === Role.hr ? data.company : undefined,
      jobTitle: userRole === Role.hr ? data.jobTitle : undefined,
    })

    const payload = { userId: user.id, role: user.role }
    const accessToken = generateAccessToken(payload)
    const refreshToken = generateRefreshToken(payload)

    return { accessToken, 
      refreshToken, 
      user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      jobTitle: user.jobTitle
    }}
  },

  login: async (data: {email: string,password: string}) => {
    const user = await userRepository.findByEmail(data.email)
    if (!user) {
      throw new Error('User not found')
    }

    if(user.isActive === false) {
      throw new Error('User is inactive')
    }

    const isValid = await comparePassword(data.password, user.password)
    if (!isValid) {
      throw new Error('Invalid password')
    }

    const payload = { userId: user.id, role: user.role }
    const accessToken = generateAccessToken(payload)
    const refreshToken = generateRefreshToken(payload)

    return { accessToken, 
      refreshToken, 
      user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }}
  },
  
  refresh: async (data: {token: string}) => {
    const { verifyRefreshToken } = await import('../utils/jwt')
    const payload = verifyRefreshToken(data.token)

    const user = await userRepository.findById(payload.userId)
    if (!user || user.isActive === false) {
      throw new Error('Invalid refresh token')
    }

    const newPayload = {userId: user.id, role: user.role}
    const accessToken = generateAccessToken(newPayload)

    return { accessToken }
  },

  me: async (id: string) => {
    const user = await userRepository.findById(id)
    if(!user) {
      throw new Error('User not found')
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt
    }
  },
  changePassword: async (userId: string, currentPassword: string, newPassword: string) => {
    const user = await userRepository.findById(userId)
    if (!user) throw new Error('User not found')

    const isValid = await comparePassword(currentPassword, user.password)
    if (!isValid) throw new Error('Current password is incorrect')

    const hashed = await hashPassword(newPassword)
    await userRepository.updatePassword(userId, hashed)
  }
}