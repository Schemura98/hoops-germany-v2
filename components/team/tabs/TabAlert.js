import FormAlert from "@/components/ui/FormAlert";

// Einheitliche Flash-Meldung der Team-Admin-Tabs.
// Ersetzt den bis Welle 2b in jedem Tab kopierten Meldungs-Block ({type,text})
// durch FormAlert – gleiche Optik, aber mit role="alert" + aria-live="polite",
// damit Screenreader Erfolg/Fehler sofort vorlesen.
export default function TabAlert({ msg, className = "" }) {
  if (!msg?.text) return null;
  return (
    <FormAlert type={msg.type === "ok" ? "success" : "error"} className={className}>
      {msg.text}
    </FormAlert>
  );
}
