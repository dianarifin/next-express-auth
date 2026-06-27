import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { IdIcon, MailIcon, LinkIcon, ShieldIcon } from "@/components/ui/icons";
import type { UserData } from "@/lib/api";

interface UserProfileCardProps {
  user: UserData;
}

interface Field {
  label: string;
  icon: React.ReactNode;
  getValue: (u: UserData) => string;
}

const fields: Field[] = [
  { label: "User ID", icon: <IdIcon />, getValue: (u) => u.id },
  { label: "Email", icon: <MailIcon />, getValue: (u) => u.email },
  { label: "Provider", icon: <LinkIcon />, getValue: () => "Google OAuth 2.0" },
  { label: "Role", icon: <ShieldIcon />, getValue: (u) => u.role },
];

export function UserProfileCard({ user }: UserProfileCardProps) {
  return (
    <Card>
      {/* Profile header */}
      <div className="flex items-center gap-4 px-6 py-6 border-b border-hairline">
        <Avatar src={user.avatarUrl} name={user.name} size={64} />
        <div className="min-w-0 flex-1">
          <h2 className="text-[17px] font-normal text-ink leading-tight truncate">
            {user.name ?? "\u2014"}
          </h2>
          <p className="text-sm text-body-mid mt-0.5 truncate">
            {user.email}
          </p>
        </div>
        <Badge variant={user.role === "ADMIN" ? "accent" : "muted"}>
          {user.role}
        </Badge>
      </div>

      {/* Fields */}
      <CardContent className="px-0 py-0">
        <div className="divide-y divide-hairline">
          {fields.map((f) => (
            <div
              key={f.label}
              className="flex items-center gap-4 px-6 py-4 hover:bg-canvas-soft/30 transition-colors duration-150"
            >
              <div className="flex items-center gap-2.5 w-32 shrink-0 text-body-mid">
                <span className="text-body-mid/60">{f.icon}</span>
                <span className="font-mono text-[10px] uppercase tracking-[1.2px]">
                  {f.label}
                </span>
              </div>
              <span className="text-sm text-ink font-mono break-all leading-snug min-w-0">
                {f.getValue(user)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
