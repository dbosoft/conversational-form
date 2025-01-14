export class CFGlobals {
    public static illustrateAppFlow: boolean = true;
    public static suppressLog: boolean = true;

    // to illustrate the event flow of the app
    public static illustrateFlow(classRef: any, type: string, eventType: string, detail: any = null) {

        if (CFGlobals.illustrateAppFlow) {
            const highlight: string = "font-weight: 900; background: " + (type == "receive" ? "#e6f3fe" : "pink") + "; color: black; padding: 0px 5px;";
            if (!CFGlobals.suppressLog) console.log("%c** event flow: %c" + eventType + "%c flow type: %c" + type + "%c from: %c" + (<any>classRef.constructor).name, "font-weight: 900;", highlight, "font-weight: 400;", highlight, "font-weight: 400;", highlight);
            if (detail)
                if (!CFGlobals.suppressLog) console.log("** event flow detail:", detail);
        }
    }
}