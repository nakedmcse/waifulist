export function isDeepLink(url: string): boolean {
    try {
        const parsed = new URL(url);
        return /\d/.test(parsed.pathname) || /\d/.test(parsed.search);
    } catch {
        return false;
    }
}
