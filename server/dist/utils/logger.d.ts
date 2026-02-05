import winston from 'winston';
export declare const logger: winston.Logger;
export declare const stream: {
    write: (message: string) => void;
};
export declare const logError: (message: string, error?: Error | unknown) => void;
export declare const logWarn: (message: string, meta?: Record<string, unknown>) => void;
export declare const logInfo: (message: string, meta?: Record<string, unknown>) => void;
export declare const logDebug: (message: string, meta?: Record<string, unknown>) => void;
export declare const logHttp: (message: string, meta?: Record<string, unknown>) => void;
export default logger;
//# sourceMappingURL=logger.d.ts.map