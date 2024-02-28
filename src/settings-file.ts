import { writeFileSync } from 'fs';

export class SettingsFile {

    private static readonly path = './settings.json';
    private readonly config: any;

    constructor() {
        this.config = require('./settings.json');
    }

    getExportJobId(): string {
        return this.get('exportJobId');
    }

    saveExportJobId(id: string): void {
        this.set('exportJobId', id);
    }

    get(key: string): string {
        return this.config[key];
    }

    set(key: string, value: string): void {
        this.config[key] = value;
        writeFileSync('./src/settings.json', JSON.stringify(this.config, null, 2));
    }
}
