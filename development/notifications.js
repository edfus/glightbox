import { join } from 'path';
import _notify  from 'node-notifier';
import __dirname from "./__dirname.js";

function notify(title, body) {
    const icon = join(__dirname, 'icon.png');

    _notify({
        title: title,
        message: body,
        icon: icon
    });
    console.warn(`${title}, ${body}`);
}

export default notify;