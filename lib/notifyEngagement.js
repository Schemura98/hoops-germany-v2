import Player from "@/models/Player";

// Benachrichtigungen für Feed-Interaktionen (Like / Kommentar / Antwort).
// Grundsätze: nie sich selbst benachrichtigen; Likes auf denselben Beitrag werden
// gebündelt (eine Notification mit Zähler statt Flut); jeder Helfer ist
// fehlertolerant – ein Problem hier darf den eigentlichen Like/Kommentar nie kippen.

function fullName(p) {
  return `${p?.firstName || ""} ${p?.lastName || ""}`.trim() || "Jemand";
}

// Like auf einen Beitrag → den Beitrags-Autor benachrichtigen (gebündelt).
export async function notifyPostLike({ recipientId, actor, postId }) {
  try {
    if (!recipientId || !actor?._id || String(recipientId) === String(actor._id)) return;

    const recipient = await Player.findById(recipientId).select("notifications");
    if (!recipient) return;

    const name = fullName(actor);
    // Bestehende UNGELESENE Like-Notification für denselben Beitrag wiederverwenden.
    const existing = (recipient.notifications || []).find(
      (n) => n.type === "post_like" && String(n.postId) === String(postId) && !n.read
    );

    if (existing) {
      existing.count = (existing.count || 1) + 1;
      existing.fromPlayerId = actor._id;
      existing.message = `${name} und ${existing.count - 1} weitere${
        existing.count - 1 === 1 ? "" : ""
      } mögen deinen Beitrag`;
      existing.createdAt = new Date();
      existing.read = false;
    } else {
      recipient.notifications.push({
        type: "post_like",
        fromPlayerId: actor._id,
        postId,
        count: 1,
        message: `${name} gefällt dein Beitrag`,
        read: false,
        createdAt: new Date(),
      });
    }
    await recipient.save();
  } catch (err) {
    console.error("[NOTIFY post_like]", err);
  }
}

// Kommentar unter einem Beitrag → Beitrags-Autor benachrichtigen.
export async function notifyPostComment({ recipientId, actor, postId }) {
  try {
    if (!recipientId || !actor?._id || String(recipientId) === String(actor._id)) return;
    await Player.updateOne(
      { _id: recipientId },
      {
        $push: {
          notifications: {
            type: "post_comment",
            fromPlayerId: actor._id,
            postId,
            message: `${fullName(actor)} hat deinen Beitrag kommentiert`,
            read: false,
            createdAt: new Date(),
          },
        },
      }
    );
  } catch (err) {
    console.error("[NOTIFY post_comment]", err);
  }
}

// In einem Beitrag erwähnte Spieler benachrichtigen (kein Self-Notify).
// `recipientIds` = aufgelöste Mention-playerIds; `authorName` = Anzeigename des Autors.
export async function notifyMentions({ recipientIds, actorId, authorName, postId }) {
  try {
    const ids = [...new Set((recipientIds || []).map(String))].filter(
      (id) => id && id !== String(actorId || "")
    );
    if (!ids.length) return;
    await Player.updateMany(
      { _id: { $in: ids } },
      {
        $push: {
          notifications: {
            type: "mention",
            fromPlayerId: actorId || undefined,
            postId,
            message: `${authorName || "Jemand"} hat dich in einem Beitrag erwähnt`,
            read: false,
            createdAt: new Date(),
          },
        },
      }
    );
  } catch (err) {
    console.error("[NOTIFY mention]", err);
  }
}

// Antwort auf einen Kommentar → den Kommentar-Autor benachrichtigen.
export async function notifyCommentReply({ recipientId, actor, postId }) {
  try {
    if (!recipientId || !actor?._id || String(recipientId) === String(actor._id)) return;
    await Player.updateOne(
      { _id: recipientId },
      {
        $push: {
          notifications: {
            type: "comment_reply",
            fromPlayerId: actor._id,
            postId,
            message: `${fullName(actor)} hat auf deinen Kommentar geantwortet`,
            read: false,
            createdAt: new Date(),
          },
        },
      }
    );
  } catch (err) {
    console.error("[NOTIFY comment_reply]", err);
  }
}
