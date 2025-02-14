import { createStream } from "../stream/manage.js";

let apiVar = {
    allowed: {
        vFormat: ["mp4", "webm"],
        vQuality: ["max", "hig", "mid", "low", "los"],
        aFormat: ["best", "mp3", "ogg", "wav", "opus"]
    },
    booleanOnly: ["isAudioOnly", "isNoTTWatermark", "isTTFullAudio"]
}

export function apiJSON(type, obj) {
    try {
        switch (type) {
            case 0:
                return { status: 400, body: { status: "error", text: obj.t } };
            case 1:
                return { status: 200, body: { status: "redirect", url: obj.u } };
            case 2:
                return { status: 200, body: { status: "stream", url: createStream(obj) } };
            case 3:
                return { status: 200, body: { status: "success", text: obj.t } };
            case 4:
                return { status: 429, body: { status: "rate-limit", text: obj.t } };
            case 5:
                let pickerType = "various", audio = false
                switch (obj.service) {
                    case "douyin":
                    case "tiktok":
                        audio = createStream(obj)
                        pickerType = "images"
                        break;
                }
                return { status: 200, body: { status: "picker", pickerType: pickerType, picker: obj.picker, audio: audio } };
            default:
                return { status: 400, body: { status: "error", text: "Bad Request" } };
        }
    } catch (e) {
        return { status: 500, body: { status: "error", text: "Internal Server Error" } };
    }
}
export function metadataManager(obj) {
    let keys = Object.keys(obj);
    let tags = ["album", "composer", "genre", "copyright", "encoded_by", "title", "language", "artist", "album_artist", "performer", "disc", "publisher", "track", "encoder", "compilation", "date", "creation_time", "comment"]
    let commands = []

    for (let i in keys) { if (tags.includes(keys[i])) commands.push('-metadata', `${keys[i]}=${obj[keys[i]]}`) }
    return commands;
}
export function msToTime(d) {
    let milliseconds = parseInt((d % 1000) / 100, 10),
        seconds = parseInt((d / 1000) % 60, 10),
        minutes = parseInt((d / (1000 * 60)) % 60, 10),
        hours = parseInt((d / (1000 * 60 * 60)) % 24, 10),
        r;

    hours = (hours < 10) ? `0${hours}` : hours;
    minutes = (minutes < 10) ? `0${minutes}` : minutes;
    seconds = (seconds < 10) ? `0${seconds}` : seconds;
    r = `${hours}:${minutes}:${seconds}`;
    if (milliseconds) r += `.${milliseconds}`;
    return r;
}
export function cleanURL(url, host) {
    let forbiddenChars = ['}', '{', '(', ')', '\\', '@', '%', '>', '<', '^', '*', '!', '~', ';', ':', ',', '`', '[', ']', '#', '$', '"', "'"]
    for (let i in forbiddenChars) {
        url = url.replaceAll(forbiddenChars[i], '')
    }
    url = url.replace('https//', 'https://')
    if (url.includes('youtube.com/shorts/')) {
        url = url.split('?')[0].replace('shorts/', 'watch?v=');
    }
    if (host === "youtube") {
        url = url.split('&')[0];
    } else {
        url = url.split('?')[0];
        if (url.substring(url.length - 1) === "/") {
            url = url.substring(0, url.length - 1);
        }
    }
    return url.slice(0, 128)
}
export function languageCode(req) {
    return req.header('Accept-Language') ? req.header('Accept-Language').slice(0, 2) : "en"
}
export function unicodeDecode(str) {
    return str.replace(/\\u[\dA-F]{4}/gi, (unicode) => {
        return String.fromCharCode(parseInt(unicode.replace(/\\u/g, ""), 16));
    });
}
export function checkJSONPost(obj) {
    let def = {
        vFormat: "mp4",
        vQuality: "hig",
        aFormat: "mp3",
        isAudioOnly: false,
        isNoTTWatermark: false,
        isTTFullAudio: false
    }
    try {
        let objKeys = Object.keys(obj);
        if (objKeys.length < 8 && obj.url) {
            let defKeys = Object.keys(def);
            for (let i in objKeys) {
                if (String(objKeys[i]) !== "url" && defKeys.includes(objKeys[i])) {
                    if (apiVar.booleanOnly.includes(objKeys[i])) {
                        def[objKeys[i]] = obj[objKeys[i]] ? true : false;
                    } else {
                        if (apiVar.allowed[objKeys[i]].includes(obj[objKeys[i]])) def[objKeys[i]] = String(obj[objKeys[i]])
                    }
                }
            }
            obj["url"] = decodeURIComponent(String(obj["url"]))
            let hostname = obj["url"].replace("https://", "").replace(' ', '').split('&')[0].split("/")[0].split("."),
                host = hostname[hostname.length - 2]
            def["url"] = encodeURIComponent(cleanURL(obj["url"], host))
            return def
        } else {
            return false
        }
    } catch (e) {
        return false;
    }
}
