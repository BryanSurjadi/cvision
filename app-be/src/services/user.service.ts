import { decapsulate } from "node:crypto";
import { userRepository } from "../repositories/user.repository";
import { hashPassword } from "../utils/bcrypt";
import { Role } from "@prisma/client";

export const userService = {
  getAll: async () => {
    return userRepository.findAll()
  },

  createHr: async (data: {name: string, email: string}) => {
    const existing = await userRepository.findByEmail(data.email)
    if (existing) {
      throw new Error('User already exists')
    }

    const password = Math.random().toString(36).slice(-8)
    const hashed = await hashPassword(password)

    const user = await userRepository.create({...data, password: hashed, role: Role.hr})

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      generatedPassword: password
    }
  },

  deactivate: async (id: string) => {
    const user = await userRepository.findById(id)
    if (!user) {
      throw new Error('User not found')
    }
    return userRepository.deactivate(id)
  }


}
