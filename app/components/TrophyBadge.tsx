import Image from "next/image";

/**
 * Single trophy badge, rendered from /public/trophies/<id>.png.
 * The image is a circular medal on a transparent background.
 */
export function TrophyBadge({
  id,
  unlocked,
  size = 80,
}: {
  id: string;
  unlocked: boolean;
  size?: number;
}) {
  return (
    <Image
      src={`/trophies/${id}.png`}
      alt=""
      width={size}
      height={size}
      unoptimized
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        imageRendering: "pixelated",
        filter: unlocked
          ? "drop-shadow(0 0 8px rgba(255,210,74,0.5))"
          : "grayscale(0.85) brightness(0.55) contrast(0.9)",
        opacity: unlocked ? 1 : 0.65,
        transition: "filter 200ms ease-out, opacity 200ms ease-out",
      }}
    />
  );
}
