/**
 * Detects whether an email address belongs to public/consumer email providers.
 * Restricted providers:
 * - 'gmail.com', 'googlemail.com'
 * - 'outlook.xx' (e.g. outlook.com, outlook.es, outlook.fr, outlook.co, outlook.com.co, etc.)
 * - 'hotmail.xx' (e.g. hotmail.com, hotmail.es, hotmail.fr, hotmail.co, hotmail.com.co, etc.)
 */
export function isPublicEmailProvider(email?: string | null): boolean {
    if (!email || typeof email !== 'string') return true;

    const normalized = email.trim().toLowerCase();
    const atIndex = normalized.lastIndexOf('@');
    if (atIndex === -1) return true;

    const domain = normalized.substring(atIndex + 1).trim();
    if (!domain) return true;

    // Direct check for gmail / googlemail
    if (domain === 'gmail.com' || domain === 'googlemail.com') {
        return true;
    }

    // Matches outlook.* (any TLD)
    if (/^outlook\.[a-z0-9.-]+$/.test(domain)) {
        return true;
    }

    // Matches hotmail.* (any TLD)
    if (/^hotmail\.[a-z0-9.-]+$/.test(domain)) {
        return true;
    }

    return false;
}

/**
 * Gate rule for the Provider <-> Client mode switcher.
 * Only users with a corporate/custom email (different from outlook.xx, hotmail.xx, gmail.com)
 * are allowed to see and interact with the mode switcher in the toolbar.
 */
export function canSwitchBetweenRoles(email?: string | null): boolean {
    return !isPublicEmailProvider(email);
}
