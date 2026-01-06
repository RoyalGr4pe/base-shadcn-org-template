const ALPHANUM = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function generateInviteCode(length = 10): string {
    return Array.from({ length }, () => ALPHANUM[Math.floor(Math.random() * ALPHANUM.length)]).join('')
}

