import { writeFileSync } from 'fs';

export class SettingsFile {

    private readonly config: any;

    constructor() {
        this.config = require('./settings.json');
    }

    get(key: string): string {
        return this.config[key];
    }

    set(key: string, value: string): void {
        this.config[key] = value;
        writeFileSync('./settings.json', JSON.stringify(this.config, null, 2));
    }
}
