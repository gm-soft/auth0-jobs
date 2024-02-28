import { SettingsFile } from '../settings-file';

function execute(): void {
    const settings = new SettingsFile();
    console.log(settings.get('exportJobId'));

    settings.set('exportJobId', '123456');
    console.log(settings.get('exportJobId'));
}

execute();
