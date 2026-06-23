import { redirect } from "next/navigation";

// Spieler-geführtes Modell: das Team-Dashboard ist das Admin-Panel.
export default function TeamDashboardPage() {
  redirect("/team/admin");
}
