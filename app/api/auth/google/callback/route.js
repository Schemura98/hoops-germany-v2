import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Player from "@/models/Player";
import { signPlayerToken } from "@/lib/auth";
import { uniqueSlug } from "@/lib/slug";
import { getBaseUrl, googleRedirectUri } from "@/lib/baseUrl";
import { sendMail } from "@/lib/mailer";
import { welcomeEmail } from "@/lib/emailTemplates";

// Dekodiert das JWT-Payload eines Google id_token (ohne Signaturprüfung –
// der Token stammt direkt vom Google-Token-Endpunkt über TLS).
function decodeIdToken(idToken) {
  const payload = idToken.split(".")[1];
  if (!payload) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

// GET /api/auth/google/callback
export async function GET(req) {
  const base = getBaseUrl(req);
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const fail = (reason) =>
    NextResponse.redirect(`${base}/login?error=${encodeURIComponent(reason)}`);

  if (error || !code) {
    return fail("google_auth_failed");
  }

  // CSRF-State prüfen
  const cookieState = req.cookies.get("g_oauth_state")?.value;
  if (!cookieState || cookieState !== state) {
    return fail("invalid_state");
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return fail("oauth_not_configured");
  }

  try {
    // 1. Authorization-Code gegen Tokens tauschen
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: googleRedirectUri(req),
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      return fail("token_exchange_failed");
    }

    const tokens = await tokenRes.json();
    const profile = decodeIdToken(tokens.id_token);
    if (!profile?.email) {
      return fail("no_profile");
    }

    const email = profile.email.toLowerCase().trim();
    const googleId = profile.sub;

    // 2. Player finden oder erstellen
    await connectDB();
    let player = await Player.findOne({
      $or: [{ googleId }, { email }],
    });
    let isNewPlayer = false;

    if (player) {
      // Bestehenden Account mit Google verknüpfen, falls noch nicht geschehen
      if (!player.googleId) {
        player.googleId = googleId;
        if (player.status !== "active") player.status = "active";
        await player.save();
      }
    } else {
      const slug = await uniqueSlug(
        Player,
        `${profile.given_name || ""}-${profile.family_name || "spieler"}`
      );
      player = await Player.create({
        firstName: profile.given_name || "",
        lastName: profile.family_name || "",
        email,
        slug,
        googleId,
        profileImage: profile.picture || "",
        status: "active",
      });
      isNewPlayer = true;
    }

    // Willkommensmail nur für neu via Google angelegte Konten (fire-and-forget).
    if (isNewPlayer) {
      const { subject, html, text } = welcomeEmail({
        firstName: player.firstName,
        baseUrl: base,
      });
      sendMail({ to: player.email, subject, html, text }).catch((err) =>
        console.error("[WELCOME MAIL ERROR]", err?.message || err)
      );
    }

    // 3. JWT erstellen und zum OAuth-Landing weiterleiten (Zielort erhalten)
    const token = signPlayerToken({ id: player._id.toString() });
    const nextDest = req.cookies.get("g_oauth_next")?.value;
    let landing = `${base}/oauth-landing?token=${encodeURIComponent(token)}`;
    if (nextDest && nextDest.startsWith("/") && !nextDest.startsWith("//")) {
      landing += `&next=${encodeURIComponent(nextDest)}`;
    }
    const res = NextResponse.redirect(landing);
    res.cookies.delete("g_oauth_state");
    res.cookies.delete("g_oauth_next");
    return res;
  } catch (err) {
    console.error("[GOOGLE OAUTH CALLBACK ERROR]", err);
    return fail("server_error");
  }
}
