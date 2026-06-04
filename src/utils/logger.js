import pino from 'pino';

export const logger = pino({ // Configure the logger with specific options
    level : 'info', // Set the logging level to 'info' to capture informational messages and above (e.g., warnings, errors)
    transport : { // Configure the transport to write logs to a file
        target : 'pino/file', // Use the file transport to write logs to a file
        options : { destination:'./security.log', mkdir: true } 
    }, // Specify the destination file for logs and create the directory if it doesn't exist

    formatters: { // Define custom formatters for log messages
        level(label) { // Customize the log level format to include only the level name (e.g., 'info', 'error') without additional metadata
            return { level: label }; // Return an object with the log level as a property for better readability in the log file
        },
    },
    timestamp: pino.stdTimeFunctions.isoTime, // Use ISO 8601 format for timestamps to ensure consistency and readability in logs
});