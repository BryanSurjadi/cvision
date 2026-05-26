import { JwtPayload } from './index'

declare namespace Express {
  interface Request {
    user?: import('./index').JwtPayload
  }
}

export {}