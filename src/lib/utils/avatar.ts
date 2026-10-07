/**
 * Extracts the user avatar image URL by checking all possible standard and provider properties:
 * - avatar_url (backend database User model)
 * - avatarUrl (API camelCase DTOs)
 * - picture (Firebase Auth decoded ID token standard claim)
 * - photoURL (Firebase Client User property)
 * - firebasePhotoUrl (AppContext mapped property)
 */
export function getUserAvatarUrl(user?: any): string {
    if (!user) return '';

    const url =
        user.avatar_url ||
        user.avatarUrl ||
        user.picture ||
        user.photoURL ||
        user.firebasePhotoUrl ||
        '';

    return typeof url === 'string' ? url.trim() : '';
}
