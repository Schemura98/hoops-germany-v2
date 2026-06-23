import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Player from "@/models/Player";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// Öffentliche Profilfelder (keine E-Mail, kein Passwort, keine Tokens).
const PUBLIC_FIELDS =
  "firstName lastName slug position profileImage nationality height weight age birthdate country hometown bundesland aboutPlayer instagram fibaLink preferredLeague transferStatus teamId followers following";

// POST /api/player/fetchsingleplayerinfo – Einzelprofil per Slug (oder _id als Fallback).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const key = body.slug;
  if (!key) {
    return fail("Kein Spieler angegeben", 400);
  }

  await connectDB();

  let player = await Player.findOne({ slug: key })
    .select(PUBLIC_FIELDS)
    .populate("teamId", "teamName slug logo");

  // Fallback: direkter ObjectId-Zugriff (alte Accounts ohne Slug / id-Links)
  if (!player && mongoose.isValidObjectId(key)) {
    player = await Player.findById(key)
      .select(PUBLIC_FIELDS)
      .populate("teamId", "teamName slug logo");
  }

  if (!player) {
    return fail("Spieler nicht gefunden", 404);
  }

  const out = player.toObject();
  out.followersCount = out.followers?.length || 0;
  out.followingCount = out.following?.length || 0;
  delete out.followers;
  delete out.following;

  return ok({ player: out });
}

export const POST = withErrorHandling(handler);
