import { randomInt } from "crypto";

const CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function generateVerificationCode(length: number = 6): string {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += CHARS.charAt(randomInt(CHARS.length));
    }
    return result;
}
