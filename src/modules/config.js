import loadJson from "./sub/loadJSON.js";
const config = loadJson("./src/config.json");
const packageJson = loadJson("./package.json");
const servicesConfigJson = loadJson("./src/modules/processing/servicesConfig.json");

export const
    services = servicesConfigJson.config,
    audioIgnore = servicesConfigJson.audioIgnore,
    appName = packageJson.name,
    version = packageJson.version,
    streamLifespan = config.streamLifespan,
    maxVideoDuration = config.maxVideoDuration,
    maxAudioDuration = config.maxAudioDuration,
    genericUserAgent = config.genericUserAgent,
    repo = packageJson["bugs"]["url"].replace('/issues', ''),
    authorInfo = config.authorInfo,
    quality = config.quality,
    internetExplorerRedirect = config.internetExplorerRedirect,
    donations = config.donations,
    ffmpegArgs = config.ffmpegArgs,
    supportedAudio = config.supportedAudio,
    celebrations = config.celebrations
