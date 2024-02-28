export class Environment {

    private static readonly path = './.env';
    private readonly config: any;

    constructor() {
        this.config = require('dotenv').config();
    }

    auth0ClientId(): string {
        return process.env.AUTH0_CLIENT_ID || this.get('AUTH0_CLIENT_ID');
    }

    auth0ClientSecret(): string {
        return process.env.AUTH0_CLIENT_SECRET || this.get('AUTH0_CLIENT_SECRET');
    }

    auth0Audience(): string {
        return process.env.AUTH0_AUDIENCE || this.get('AUTH0_AUDIENCE');
    }

    auth0ApiUrl(): string {
        return process.env.AUTH0_API_URL || this.get('AUTH0_API_URL');
    }

    get(key: string): string {
        return this.config[key];
    }
}
