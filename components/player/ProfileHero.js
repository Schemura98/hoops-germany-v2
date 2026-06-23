import Link from "next/link";
import { FaUsers } from "react-icons/fa";

// Navy-Profil-Hero für öffentliche und eigene Spielerprofile.
// Großes Foto, Name, Position/Nationalität, Team-Chip, Transfer-Badge.
// `actions` rendert kontextabhängige Buttons (Folgen / Bearbeiten / Instagram).
export default function ProfileHero({ player, actions }) {
  if (!player) return null;
  const initials =
    `${player.firstName?.[0] || ""}${player.lastName?.[0] || ""}`.toUpperCase() || "?";
  const team = player.teamId || player.team || null;

  return (
    <div className="bg-gradient-to-r from-slate-950 to-slate-800">
      <div className="max-w-3xl mx-auto px-4 py-10 flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-left">
        {player.profileImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={player.profileImage}
            alt={initials}
            className="h-28 w-28 rounded-full object-cover ring-4 ring-white/10 flex-shrink-0"
          />
        ) : (
          <span className="h-28 w-28 rounded-full bg-brand-500/20 text-brand-300 text-3xl font-bold flex items-center justify-center ring-4 ring-white/10 flex-shrink-0">
            {initials}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
            {player.firstName} {player.lastName}
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            {player.position || "Position nicht angegeben"}
            {player.nationality ? ` · ${player.nationality}` : ""}
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
            {team && (
              <Link
                href={`/team/team-detail/${team.slug}`}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
              >
                {team.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={team.logo} alt="" className="h-4 w-4 rounded-full object-cover" />
                ) : (
                  <FaUsers className="text-brand-400" />
                )}
                {team.teamName}
              </Link>
            )}
            {player.transferStatus === "verfuegbar" && (
              <span className="inline-block text-xs font-semibold bg-green-500/20 text-green-300 rounded-full px-3 py-1.5">
                Transferbereit
              </span>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex flex-wrap items-center justify-center gap-3 sm:ml-auto">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
