export interface UserProfile {
    id?: string;
    name?: string;
    role?: string;
    avatar?: string;
    email?: string;
    clientType?: 'natural_person' | 'legal_entity';
    photoUrl?: string;
}

export interface AppState {
    user: UserProfile | null;
    isLoading: boolean;
    error: string | null;
}
