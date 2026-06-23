import { redirect } from "next/navigation";

// Spieler-geführtes Modell: Team-Daten werden im Admin-Panel ("Einstellungen") bearbeitet.
export default function TeamEditTeamPage() {
  redirect("/team/admin");
}
