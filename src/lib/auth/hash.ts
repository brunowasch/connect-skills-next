import bcryptjs from "bcryptjs"

export async function hashPassword(senha: string) {
    return bcryptjs.hash(senha, 12)
}

export async function comparePassword(senha: string, hash: string) {
    return bcryptjs.compare(senha, hash)
}