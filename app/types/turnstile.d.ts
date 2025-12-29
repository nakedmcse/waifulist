import "cloudflare-turnstile";

declare global {
    interface Window {
        turnstile?: Turnstile.Turnstile;
    }
}
