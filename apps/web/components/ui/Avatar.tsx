import Image from "next/image";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: number;
}

export function Avatar({ src, name, size = 64 }: AvatarProps) {
  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  if (src) {
    return (
      <div
        className="rounded-full p-[3px] bg-gradient-to-br from-brand to-brand-hover shadow-md shrink-0"
        style={{ width: size + 6, height: size + 6 }}
      >
        <Image
          className="rounded-full object-cover w-full h-full"
          src={src}
          alt={name ?? "avatar"}
          width={size}
          height={size}
        />
      </div>
    );
  }

  return (
    <div
      className="rounded-full bg-gradient-to-br from-brand to-brand-hover text-white font-bold flex items-center justify-center shadow-md shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  );
}
