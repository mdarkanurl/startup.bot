

export function normalizeUrl(url: string): string {
    try {
        const u = new URL(url.toLowerCase());

        u.search = "";
        u.hash = "";

        // normalize hostname
        u.hostname = u.hostname.replace(/^www\./, "");

        // remove trailing slash unless root
        if (u.pathname !== "/") {
            u.pathname = u.pathname.replace(/\/$/, "");
        }

        return u.toString();
    } catch {
        return url.toLowerCase().trim();
    }
};

export function removeREFParams(url: string) {
    try {
        let cleaned = url.replace(/([?&])ref=producthunt(?=&|$)/, "");
        cleaned = cleaned.replace(/[?&]$/, "");

        return cleaned;
    } catch {
        return url.toLowerCase().trim();
    }
}