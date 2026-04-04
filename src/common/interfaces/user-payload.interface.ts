export interface UserPayload {
	sub: number;
	email: string;
	role: 'PATIENT' | 'CARE_GIVER' | 'ADMIN';
}
