import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    name: string
    role: string
    isActive: boolean
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      isActive: boolean
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    isActive: boolean
  }
}
