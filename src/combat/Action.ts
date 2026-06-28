// --- Battle actions (FF12-style) --------------------------------------------
//
// When a combatant's ATB gauge fills, it may perform exactly ONE action — not necessarily
// an attack. This is the shared vocabulary of those actions; performing any of them spends
// the gauge. The controlled player picks an action via the on-screen buttons (Attack stays
// the ⚔ button/click; the rest are dedicated buttons gated by the gauge); AI members pick
// via their gambit. Execution lives in the mode (it touches enemies, arrows, the runner…),
// keyed by these ids.

export type ActionId = "attack" | "guard" | "transform" | "item" | "magic";

export interface ActionInfo {
  id: ActionId;
  nameKey: string;
  icon: string;
}

export const ACTION_INFO: Record<ActionId, ActionInfo> = {
  attack: { id: "attack", nameKey: "action.attack", icon: "⚔" },
  guard: { id: "guard", nameKey: "action.guard", icon: "🛡" },
  transform: { id: "transform", nameKey: "action.transform", icon: "✨" },
  item: { id: "item", nameKey: "action.item", icon: "🧪" },
  magic: { id: "magic", nameKey: "action.magic", icon: "🔮" },
};
