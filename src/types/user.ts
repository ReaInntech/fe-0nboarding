export type RoleName = 'owner' | 'admin' | 'member' | 'viewer';

export interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    role_name: RoleName;
    org_id: string;
    avatar_url?: string | null;
    organization?: {
        id: string;
        legal_name: string;
        client_type: 'natural_person' | 'legal_entity';
        logo_url?: string | null;
    };
}

export interface AppState {
    user: UserProfile | null;
    isLoading: boolean;
    error: string | null;
}

