export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    phone: number;
    sessionToken?: string;
}
