import fs from 'fs';
import path from 'path';

const logsDir = './logs';

// Create logs directory if it doesn't exist
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

const log = (message, type = 'info') => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}\n`;
    const logFile = path.join(logsDir, `${new Date().toISOString().split('T')[0]}.log`);
    
    fs.appendFileSync(logFile, logMessage);
    
    if (type === 'error') {
        console.error(logMessage);
    } else {
        console.log(logMessage);
    }
};

export default log;
