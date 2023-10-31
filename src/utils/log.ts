
import { formatDate, varType } from "./index"

interface Config {

    errPrintStack?: boolean
}

class LoggerClass {

    config: Config = {
        errPrintStack: true
    }

    constructor(conf?: Config) {
        if (conf)
            Object.assign(this.config, conf)
    }


    static getStack(err?: Error) {
        err = err || new Error()
        const stack = err.stack?.split("\n") || []

        return stack.filter(v => !v.includes("src/utils/log.ts")).join("\n")
    }

    static create(conf?: Config) {
        return new LoggerClass(conf)
    }

    make(conf?: Config) {
        return LoggerClass.create(conf)
    }

    log(level: string, msg: string, headColor: string = "color: #555;", ...opt: any[]) {

        const count = msg.match(/({})/gm)?.length || -1

        opt = opt.map((v, idx) => {
            if (this.config.errPrintStack && v instanceof Error) {
                return LoggerClass.getStack(v)
            }
            if(idx < count){
                switch(varType(v)){
                    case "array":
                    case "object":
                        return JSON.stringify(v)
                }
            }
            return v;
        })

        let space = "".padEnd(10 - level.length, " ")

        let formatStr = `%c[${formatDate(new Date(), "Y-m-d H:i:s.ms")}] [${level.toUpperCase()}]%c${space}${msg.replace(/({})/gm, "%s")}`;
        opt.unshift(headColor, "color: #555;");
        console.log(formatStr, ...opt)
    }

    info(msg: string, ...opt: any[]) {
        this.log("INFO", msg, 'color: #67c23a;', ...opt)
    }
    debug(msg: string, ...opt: any[]) {
        this.log("DEBUG", msg, 'color: #909399;', ...opt)
    }

    warn(msg: string, ...opt: any[]) {
        this.log("WARNING", msg, 'color: #e6a23c;', ...opt)
    }
    error(msg: string, ...opt: any[]) {
        this.log("ERROR", msg, 'color: #f56c6c;', ...opt)
    }
    alert(msg: string, ...opt: any[]) {
        this.log("ALERT", msg, 'color: #626aef;', ...opt)
    }

}


const Logger = new LoggerClass();
export default Logger;