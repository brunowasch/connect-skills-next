import dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);

export async function validateEmailDomain(email: string): Promise<boolean> {
    const domain = email.split('@')[1];
    if (!domain) return false;

    try {
        const addresses = await resolveMx(domain);
        return addresses && addresses.length > 0;
    } catch (error) {
        return false;
    }
}

export function validateEmailFormat(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
