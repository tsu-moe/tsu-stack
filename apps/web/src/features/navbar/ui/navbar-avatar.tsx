import { Avatar, AvatarFallback, AvatarImage } from "@tsu-stack/ui/components/avatar";

export function NavbarAvatar({
  avatarImgSrc,
  name,
  email
}: {
  avatarImgSrc?: string | null;
  name?: string;
  email?: string;
}) {
  return (
    <>
      <Avatar>
        <AvatarImage src={avatarImgSrc ?? undefined} alt={name ?? "User"} />
        <AvatarFallback>{name?.charAt(0).toUpperCase() ?? "?"}</AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium text-foreground">{name ?? "Guest"}</span>
        <span className="truncate text-xs font-normal text-muted-foreground">
          {email ?? "You are not authenticated"}
        </span>
      </div>
    </>
  );
}
