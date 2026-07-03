import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <form action="/auth/logout" method="post">
      <Button type="submit" variant="secondary">
        Logout
      </Button>
    </form>
  );
}
