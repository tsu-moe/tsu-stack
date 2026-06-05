import { useImgproxyLoader } from "@lonik/oh-image/imgproxy";
import { type ImageProps as OhImageProps } from "@lonik/oh-image/react";
import { Image as OhImage } from "@lonik/oh-image/react";
import { isDevelopment } from "std-env";

// #region Helper Types
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

// #region Component
type ImageFormat =
  | "png"
  | "jpg"
  | "jxl"
  | "webp"
  | "avif"
  | "gif"
  | "ico"
  | "svg"
  | "heic"
  | "bmp"
  | "tiff"
  | "pdf"
  | "mp4";

type ImageProps = OhImageProps & {
  siteBaseUrl?: string;
  imgProxyBaseUrl?: string;
  imgProxySignature?: "insecure" | (string & {});
  quality?: number;
  format?: ImageFormat;
  placeholder?: "blur";
};

// Omit the injected base URL props from the consumer-facing type since we want to inject our own
export type WrapperImageProps = DistributiveOmit<
  ImageProps,
  "siteBaseUrl" | "imgProxyBaseUrl" | "imgProxySignature"
>;

export function Image(rawProps: ImageProps) {
  const {
    siteBaseUrl,
    imgProxyBaseUrl,
    imgProxySignature: _imgProxySignature,
    quality: _quality,
    format: _format,
    placeholder: _placeholder,
    ...props
  } = rawProps;

  const isImageRelative = typeof rawProps.src === "string" && rawProps.src.startsWith("/");
  const src = isImageRelative && siteBaseUrl ? `${siteBaseUrl}${rawProps.src}` : rawProps.src;

  if (isDevelopment || !imgProxyBaseUrl) {
    return <OhImage {...props} src={src} />;
  }

  return <ImgProxyImage {...rawProps} src={src} />;
}

function ImgProxyImage(rawProps: ImageProps) {
  const {
    siteBaseUrl: _,
    imgProxyBaseUrl,
    imgProxySignature,
    quality = 80,
    format,
    placeholder,
    ...props
  } = rawProps;

  const loader = useImgproxyLoader({
    path: imgProxyBaseUrl,
    signature: imgProxySignature ?? "_",
    placeholder:
      placeholder === "blur"
        ? {
            format: "webp",
            quality: 10
          }
        : undefined,
    transforms: {
      format: format ?? "webp",
      quality
    }
  });

  return <OhImage {...props} loader={loader} />;
}
