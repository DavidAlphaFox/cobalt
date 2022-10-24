import { replaceBase } from "../../localization/manager.js";
import loadJSON from "../sub/loadJSON.js";

let changelog = loadJSON('./src/modules/changelog/changelog.json')

export default function(string) {
    try {
        switch (string) {
            case "title":
                return `${replaceBase(changelog["current"]["title"])} (${changelog["current"]["version"]})` ;
            case "content":
                return replaceBase(changelog["current"]["content"]);
            case "history":
                return changelog["history"].map((i) => {
                    return {
                        title: replaceBase(i["title"]),
                        content: replaceBase(i["content"]),
                        version: i["version"],
                    }
                });
            default:
                return replaceBase(changelog[string])
        }
    } catch (e) {
        return `!!CHANGELOG_${string}!!`
    }
}
