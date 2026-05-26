import { register } from "node:module";
import { userRepository } from "../repositories/user.repository";
import { hashPassword, comparePassword } from "../utils/bcrypt";
import { generateAccessToken,generateRefreshToken } from "../utils/jwt";
import { Role } from "@prisma/client";
import { is } from "zod/locales";
import { isAborted } from "zod/v3";
import { create } from "node:domain";

export const authService = {
  register: async (data: {name: string, email: string, password: string}) => {
    const existing = await userRepository.findByEmail(data.email)
    if (existing) {
      throw new Error('User already exists')
    }

    const hashed= await hashPassword(data.password)
    const user = await userRepository.create({...data, password: hashed, role: Role.candidate})

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
  }
}