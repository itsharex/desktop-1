//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { type CSSProperties, useState, useEffect } from "react";
import { Image } from 'antd';
import { download_file, get_cache_file } from '@/api/fs';
import { readBinaryFile } from '@tauri-apps/api/fs';
import type { ImagePreviewType } from 'rc-image';
import { useLocation } from "react-router-dom";
import { get_admin_session } from "@/api/admin_auth";
import { get_session } from "@/api/user";
import { fetch, ResponseType } from '@tauri-apps/api/http';


export interface AsyncImageProps {
    src: string;
    width?: number | string | undefined;
    height?: number | string | undefined;
    className?: string | undefined;
    style?: CSSProperties | undefined;
    fallback?: string;
    preview?: boolean | ImagePreviewType;
    onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
    useRawImg: boolean;
}



const AsyncImage: React.FC<AsyncImageProps> = (props) => {
    const location = useLocation();

    const [imgSrc, setImgSrc] = useState("");

    const convertToB64 = (data: Uint8Array): string => {
        const chunk = 8 * 1024;
        const dataStrList = [] as string[];
        for (let i = 0; i < data.length / chunk; i++) {
            const buf = data.slice(i * chunk, (i + 1) * chunk);
            dataStrList.push(String.fromCharCode(...buf));
        }
        return btoa(dataStrList.join(""));
    }

    const guessReferer = (srcUrl: string): string => {
        if (srcUrl.includes("gitcode.com")) {
            return "https://gitcode.com";
        } else {
            return srcUrl;
        }
    }
    const adjustImgSrc = async () => {
        if (props.src.startsWith("fs://localhost/") || props.src.startsWith("https://fs.localhost/")) {
            const tmpSrc = props.src.replace("fs://localhost/", "").replace("https://fs.localhost/", "");
            const parts = tmpSrc.split("/");
            let asName = "";
            if (parts.length == 3) {
                asName = parts[2];
            }
            asName = asName.replaceAll(/\s/g, "");
            let sessionId = ""
            if (location.pathname.startsWith("/admin/")) {
                sessionId = await get_admin_session();
            } else {
                sessionId = await get_session();
            }

            try {
                const cacheRes = await get_cache_file(parts[0], parts[1], asName);
                let localPath = ""
                if (cacheRes.exist_in_local) {
                    localPath = cacheRes.local_path;
                } else {
                    // console.log(sessionId, parts[0], parts[1], "", asName);
                    const res = await download_file(sessionId, parts[0], parts[1], "", asName);
                    localPath = res.local_path;
                }
                const data = await readBinaryFile(localPath);
                setImgSrc(`data:image/*;base64,${convertToB64(data)}`);
            } catch (e) {
                console.log(e);
                if (props.fallback != undefined) {
                    setImgSrc(props.fallback);
                }
            }
        } else {
            if (props.src != "") {
                if (props.src.startsWith("http")) {
                    const data = await fetch<Uint8Array>(props.src, {
                        method: "GET",
                        headers: {
                            "Referer": guessReferer(props.src),
                        },
                        responseType: ResponseType.Binary,
                    });
                    setImgSrc(`data:image/*;base64,${convertToB64(data.data)}`);
                } else {
                    setImgSrc(props.src);
                }
            } else {
                setImgSrc(props.fallback ?? "");
            }

        }
    };

    useEffect(() => {
        adjustImgSrc();
    }, [props.src]);


    return (
        <>
            {imgSrc != "" && (
                <>
                    {props.useRawImg && (
                        <img src={imgSrc} width={props.width} height={props.height}
                            className={props.className} style={props.style} />
                    )}
                    {props.useRawImg == false && (
                        <Image src={imgSrc} width={props.width} height={props.height}
                            className={props.className} style={props.style}
                            preview={props.preview} onClick={props.onClick} />
                    )}
                </>
            )}
        </>

    );
};

export default AsyncImage;