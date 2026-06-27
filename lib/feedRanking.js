// „Für dich"-Ranking für den Entdecken-Feed. Bewusst einfach + deterministisch
// (keine ML), läuft im Speicher über ein Kandidatenfenster der neuesten Beiträge.
//
// score = base / (alterInStunden + 2)^GRAVITY  × Personalisierungs-Boosts
//   base   = 1 + likes + 2·kommentare(inkl. Antworten) + Medien-/Auto-Bonus
//   Boosts = eigenes Team ×2 · gefolgt ×1.8 · gleiche Liga ×1.5 · gleiches Bundesland ×1.3
//
// ctx: { now, followingSet:Set<string>, teamId, followingTeamsSet:Set<string>,
//        bundesland, leagueId, teamMeta:Map<string,{leagueId,bundesland}> }

const GRAVITY = 1.5;

export function computeScore(post, ctx) {
  const comments = post.comments || [];
  const commentTotal =
    comments.length + comments.reduce((s, c) => s + (c.replies?.length || 0), 0);
  const likes = (post.likes || []).length;
  const mediaBonus = post.image ? 0.5 : 0;
  // Auto-Posts starten ohne Engagement – kleiner Sockel, damit sie nicht sofort versinken.
  const autoBonus = post.kind === "auto" ? 1 : 0;
  const base = 1 + likes + 2 * commentTotal + mediaBonus + autoBonus;

  const created = new Date(post.createdAt).getTime();
  const ageHours = Math.max(0, (ctx.now - created) / 3600000);

  // Relevante Personen/Teams des Beitrags bestimmen.
  const authorId = post.player?._id
    ? String(post.player._id)
    : post.subjectPlayer
    ? String(post.subjectPlayer)
    : null;
  const relTeamIds = new Set((post.teams || []).map(String));
  if (post.player?.teamId) relTeamIds.add(String(post.player.teamId));

  let boost = 1;

  // Eigenes Team
  if (ctx.teamId && relTeamIds.has(String(ctx.teamId))) boost *= 2;

  // Gefolgt (Person ODER Team)
  const followedAuthor = authorId && ctx.followingSet.has(authorId);
  const followedTeam = [...relTeamIds].some((t) => ctx.followingTeamsSet.has(t));
  if (followedAuthor || followedTeam) boost *= 1.8;

  // Gleiche Liga (über die Liga der beteiligten Teams)
  if (ctx.leagueId) {
    const sameLeague = [...relTeamIds].some(
      (t) => String(ctx.teamMeta.get(t)?.leagueId || "") === String(ctx.leagueId)
    );
    if (sameLeague) boost *= 1.5;
  }

  // Gleiches Bundesland (Autor oder beteiligtes Team)
  if (ctx.bundesland) {
    const bls = new Set();
    if (post.player?.bundesland) bls.add(post.player.bundesland);
    relTeamIds.forEach((t) => {
      const b = ctx.teamMeta.get(t)?.bundesland;
      if (b) bls.add(b);
    });
    if (bls.has(ctx.bundesland)) boost *= 1.3;
  }

  return (base / Math.pow(ageHours + 2, GRAVITY)) * boost;
}

// Stabil sortieren (bei Score-Gleichstand neuere zuerst), damit Offset-Paginierung
// zwischen zwei Requests konsistent bleibt.
export function rankPosts(posts, ctx) {
  return posts
    .map((p) => ({ p, s: computeScore(p, ctx) }))
    .sort(
      (a, b) =>
        b.s - a.s ||
        new Date(b.p.createdAt).getTime() - new Date(a.p.createdAt).getTime()
    )
    .map((x) => x.p);
}
