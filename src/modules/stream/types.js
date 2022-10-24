import { spawn } from "child_process";
import ffmpeg from "ffmpeg-static";
import got from "got";
import { ffmpegArgs, genericUserAgent } from "../config.js";
import { metadataManager, msToTime } from "../sub/utils.js";

export function streamDefault(streamInfo, res) {
    try {
        res.setHeader('Content-disposition', `attachment; filename="${streamInfo.isAudioOnly ? `${streamInfo.filename}.${streamInfo.audioFormat}` : streamInfo.filename}"`);
        const stream = got.get(streamInfo.urls, {
            headers: {
                "user-agent": genericUserAgent
            },
            isStream: true
        });
        stream.pipe(res).on('error', (err) => {
            res.end();
        });
        stream.on('error', (err) => {
            res.end();
        });
    } catch (e) {
        res.end();
    }
}
export function streamLiveRender(streamInfo, res) {
    try {
        if (streamInfo.urls.length === 2) {
            let format = streamInfo.filename.split('.')[streamInfo.filename.split('.').length - 1], args = [
                '-loglevel', '-8',
                '-i', streamInfo.urls[0],
                '-i', streamInfo.urls[1],
                '-map', '0:v',
                '-map', '1:a',
            ];
            args = args.concat(ffmpegArgs[format])
            if (streamInfo.time) args.push('-t', msToTime(streamInfo.time));
            args.push('-f', format, 'pipe:4');
            const ffmpegProcess = spawn(ffmpeg, args, {
                windowsHide: true,
                stdio: [
                    'inherit', 'inherit', 'inherit',
                    'pipe', 'pipe',
                ],
            });
            res.setHeader('Content-Disposition', `attachment; filename="${streamInfo.filename}"`);
            ffmpegProcess.stdio[4].pipe(res);

            ffmpegProcess.on('error', (err) => {
                ffmpegProcess.kill();
                res.end();
            });
        } else {
            res.end();
        }
    } catch (e) {
        res.end();
    }
}
export function streamAudioOnly(streamInfo, res) {
    try {
        let args = [
            '-loglevel', '-8',
            '-i', streamInfo.urls
        ]
        if (streamInfo.metadata) {
            if (streamInfo.metadata.cover) { // doesn't work on the server but works locally, no idea why
                args.push('-i', streamInfo.metadata.cover, '-map', '0:a', '-map', '1:0', '-filter:v', 'scale=w=400:h=400,format=yuvj420p')
            } else {
                args.push('-vn')
            }
            args = args.concat(metadataManager(streamInfo.metadata))
        }
        let arg = streamInfo.copy ? ffmpegArgs["copy"] : ffmpegArgs["audio"]
        args = args.concat(arg)
        if (streamInfo.metadata.cover) args.push("-c:v", "mjpeg")
        if (ffmpegArgs[streamInfo.audioFormat]) args = args.concat(ffmpegArgs[streamInfo.audioFormat]);
        args.push('-f', streamInfo.audioFormat === "m4a" ? "ipod" : streamInfo.audioFormat, 'pipe:4');
        const ffmpegProcess = spawn(ffmpeg, args, {
            windowsHide: true,
            stdio: [
                'inherit', 'inherit', 'inherit',
                'pipe', 'pipe'
            ],
        });
        ffmpegProcess.on('error', (err) => {
            ffmpegProcess.kill();
            res.end();
        });
        res.setHeader('Content-Disposition', `attachment; filename="${streamInfo.filename}.${streamInfo.audioFormat}"`);
        ffmpegProcess.stdio[4].pipe(res);

    } catch (e) {
        res.end();
    }
}
