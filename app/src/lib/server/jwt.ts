import { env } from '$env/dynamic/private';
import * as jose from 'jose';

const SECRET = new TextEncoder().encode(env.JWT_SECRET);

type ExpireTime = `${number}min` | `${number}hour` | `${number}day`;

type EncodeJwtOptions = {
	issuer?: string;
	audience?: string;
	expiration?: number | ExpireTime | Date;
};

export async function encodeJwt(payload: Record<string, unknown>, options?: EncodeJwtOptions) {
	const { expiration, issuer, audience } = options || {};

	const jwt = new jose.SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setIssuedAt();

	if (expiration) {
		jwt.setExpirationTime(expiration);
	}

	if (issuer) {
		jwt.setIssuer(issuer);
	}

	if (audience) {
		jwt.setAudience(audience);
	}

	return jwt.sign(SECRET);
}

export function decodeJwt(token: string) {
	try {
		return jose.decodeJwt(token);
	} catch {
		return null;
	}
}
