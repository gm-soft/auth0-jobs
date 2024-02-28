import { SettingsFile } from "./settings-file";

function execute(): void {
    const settings = new SettingsFile();
    console.log(settings.getExportJobId());

    settings.saveExportJobId(Date.now().toString());
    console.log(settings.getExportJobId());
}

execute();
