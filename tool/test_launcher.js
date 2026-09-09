const open = require('open');

async function test() {
    try {
        console.log("Attempting open '.' in code.cmd");
        await open('.', { app: { name: 'code.cmd' } });
        console.log("open code.cmd succeeded");
    } catch(e) {
        console.log("Failed code: ", e.message);
    }
    
    try {
        console.log("Attempting open '.' in chrome");
        await open('.', { app: { name: 'chrome.exe' } });
        console.log("open chrome succeeded");
    } catch (e) {
        console.log("Failed chrome: ", e.message);
    }
}
test();
