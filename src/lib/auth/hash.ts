import bcryptjs from "bcryptjs"

export async function hashPassword(senha: string) {
    return bcryptjs.hash(senha, 12)
}