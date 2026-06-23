import { redirect } from "next/navigation";

// /home ist der Einstieg für eingeloggte Spieler → echter Newsfeed.
// (Auth-Guard greift in /player/newsfeed; ausgeloggte Nutzer landen dort bei /login.)
export default function HomePage() {
  redirect("/player/newsfeed");
}
