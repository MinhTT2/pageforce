import { LogOut } from "lucide-react";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";

type LogoutButtonProps = Omit<ComponentProps<typeof Button>, "asChild" | "children" | "type">;

export function LogoutButton(props: LogoutButtonProps) {
  return (
    <form action="/auth/logout" method="post">
      <Button type="submit" variant="secondary" {...props}>
        <LogOut />
        Logout
      </Button>
    </form>
  );
}
