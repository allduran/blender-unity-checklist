import { useState } from "react";

const PIPELINE = [
  {
    phase: "MODELADO",
    icon: "⬡",
    color: "#E8C547",
    items: [
      { id: "m1", label: "Escala aplicada (Apply Scale → Ctrl+A)", note: "Unity usa metros. 1 BU = 1m." },
      { id: "m2", label: "Rotación aplicada (Apply Rotation)", note: "Evita rotaciones inesperadas al importar." },
      { id: "m3", label: "Origen en posición correcta", note: "Base del objeto o centro de masa según uso." },
      { id: "m4", label: "Sin vértices duplicados (Merge by Distance)", note: "M → Merge by Distance en Edit Mode." },
      { id: "m5", label: "Normales coherentes (Face Orientation overlay)", note: "Todo azul = correcto. Rojo = flip needed." },
      { id: "m6", label: "N-gons eliminados (solo tris/quads)", note: "Unity triangula en import; mejor controlarlo tú." },
      { id: "m7", label: "Low poly conteo verificado", note: "Personajes ~1k–3k tris, props ~200–800 tris." },
    ],
  },
  {
    phase: "UVs",
    icon: "◫",
    color: "#5BC8A8",
    items: [
      { id: "u1", label: "UV Unwrap limpio (sin overlaps para lightmap)", note: "Overlaps OK para tileable textures, NO para baked light." },
      { id: "u2", label: "Isla UV dentro del 0–1 space", note: "Verifica con el UV Editor." },
      { id: "u3", label: "Margen entre islas ≥ 2px al resolución target", note: "Evita bleeding en texture atlas." },
      { id: "u4", label: "Segundo canal UV para Lightmap (si aplica)", note: "Unity puede auto-generar, pero manual es más limpio." },
      { id: "u5", label: "Texel density consistente entre objetos relacionados", note: "Especialmente importante para el world-building cubano." },
    ],
  },
  {
    phase: "MATERIALES",
    icon: "◈",
    color: "#E87B5A",
    items: [
      { id: "mat1", label: "Un material por mesh (o atlas strategy definida)", note: "Menos draw calls = mejor performance." },
      { id: "mat2", label: "Nombres de materiales sin espacios ni caracteres especiales", note: "Usa PascalCase: WallDirty, WoodFloor." },
      { id: "mat3", label: "Texturas guardadas como PNG o TGA", note: "No usar .psd ni .blend textures embebidas." },
      { id: "mat4", label: "Resolución de textura en potencia de 2", note: "256, 512, 1024, 2048. Requerido para mipmaps." },
      { id: "mat5", label: "Normal map en formato correcto (OpenGL vs DirectX)", note: "Unity usa DirectX. En Blender: invertir canal G si es necesario." },
    ],
  },
  {
    phase: "RIG & ANIMACIÓN",
    icon: "⬡",
    color: "#A78BFA",
    items: [
      { id: "r1", label: "Armature con nombres en inglés y sin espacios", note: "Spine, Hip, UpperArm.L — convención clara." },
      { id: "r2", label: "Root bone en origen del mundo", note: "Necesario para Root Motion en Unity." },
      { id: "r3", label: "Weights pintados sin influences < 0.01", note: "Normalize All weights antes de exportar." },
      { id: "r4", label: "Animaciones en NLA Editor separadas por nombre", note: "Idle, Walk, Vault, Climb — cada una como Action." },
      { id: "r5", label: "Root Motion baked si es animación de desplazamiento", note: "Vault/Climb necesitan Root Motion para tu pipeline IK." },
      { id: "r6", label: "Pose Mode → Rest Pose verificada antes de export", note: "T-Pose o A-Pose consistente." },
    ],
  },
  {
    phase: "EXPORT FBX",
    icon: "↗",
    color: "#60A5FA",
    items: [
      { id: "e1", label: "Path Mode: Copy + icono embed (si incluye texturas)", note: "O exportar texturas por separado a /Textures." },
      { id: "e2", label: "Apply Unit: habilitado", note: "Convierte escala de Blender a Unity correctamente." },
      { id: "e3", label: "Apply Transform: habilitado", note: "Aplica transformaciones residuales al exportar." },
      { id: "e4", label: "Forward Axis: -Z Forward, Up Axis: Y Up", note: "Estándar Unity. Evita el rotation bug de 90°." },
      { id: "e5", label: "Mesh: Triangulate Faces activado", note: "Controlas tú la triangulación, no Unity." },
      { id: "e6", label: "Armature: Add Leaf Bones desactivado", note: "Leaf bones crean huesos extra innecesarios en Unity." },
      { id: "e7", label: "Bake Animation si hay constraints o drivers", note: "Unity no interpreta constraints de Blender." },
    ],
  },
  {
    phase: "UNITY IMPORT",
    icon: "▶",
    color: "#34D399",
    items: [
      { id: "i1", label: "Model tab: Scale Factor = 1", note: "Si exportaste con Apply Unit correcto." },
      { id: "i2", label: "Rig tab: Animation Type correcto (Humanoid/Generic)", note: "Humanoid para personaje principal, Generic para props animados." },
      { id: "i3", label: "Animation tab: clips renombrados y configurados", note: "Loop Time activado para Idle/Walk. Root Motion según clip." },
      { id: "i4", label: "Materials tab: asignar materiales URP correctamente", note: "Reasignar a tus Shader Graph materials." },
      { id: "i5", label: "Verificar en Scene: escala, orientación, pivot", note: "Debe pararse en Y=0 sin offset extraño." },
      { id: "i6", label: "Animation Rigging: IK constraints configurados post-import", note: "Two Bone IK para manos en vault/climb." },
    ],
  },
];

export default function BlenderUnityChecklist() {
  const [checked, setChecked] = useState({});
  const [expanded, setExpanded] = useState({ MODELADO: true });
  const [activeNote, setActiveNote] = useState(null);

  const toggle = (id) => setChecked((p) => ({ ...p, [id]: !p[id] }));
  const togglePhase = (phase) => setExpanded((p) => ({ ...p, [phase]: !p[phase] }));

  const totalItems = PIPELINE.reduce((a, p) => a + p.items.length, 0);
  const doneItems = Object.values(checked).filter(Boolean).length;
  const pct = Math.round((doneItems / totalItems) * 100);

  const phaseProgress = (phase) => {
    const done = phase.items.filter((i) => checked[i.id]).length;
    return { done, total: phase.items.length, pct: Math.round((done / phase.items.length) * 100) };
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0E0F14",
      fontFamily: "'Courier New', Courier, monospace",
      color: "#e0e0ef",
      padding: "24px 16px",
    }}>
      {/* Header */}
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4 }}>
            <span style={{ fontSize: 11, letterSpacing: 4, color: "#5BC8A8", textTransform: "uppercase" }}>
              PIPELINE
            </span>
            <span style={{ fontSize: 11, letterSpacing: 2, color: "#444" }}>v1.0</span>
          </div>
          <h1 style={{
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: -0.5,
            color: "#F0EEE8",
            margin: "0 0 4px",
            fontFamily: "'Courier New', monospace",
          }}>
            Blender → Unity
          </h1>
          <p style={{ fontSize: 12, color: "#555", margin: 0 }}>
            Low poly · URP · Unity 6
          </p>
        </div>

        {/* Progress bar global */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "#777", letterSpacing: 2 }}>PROGRESO TOTAL</span>
            <span style={{ fontSize: 13, color: pct === 100 ? "#5BC8A8" : "#E8C547", fontWeight: 700 }}>
              {doneItems}/{totalItems} — {pct}%
            </span>
          </div>
          <div style={{ height: 3, background: "#1E1F26", borderRadius: 2 }}>
            <div style={{
              height: "100%",
              width: `${pct}%`,
              background: pct === 100
                ? "linear-gradient(90deg, #5BC8A8, #34D399)"
                : "linear-gradient(90deg, #E8C547, #E87B5A)",
              borderRadius: 2,
              transition: "width 0.4s ease",
            }} />
          </div>
        </div>

        {/* Phases */}
        {PIPELINE.map((phase) => {
          const prog = phaseProgress(phase);
          const isOpen = expanded[phase.phase];
          const allDone = prog.done === prog.total;

          return (
            <div key={phase.phase} style={{ marginBottom: 12 }}>
              {/* Phase header */}
              <button
                onClick={() => togglePhase(phase.phase)}
                style={{
                  width: "100%",
                  background: allDone ? "rgba(91,200,168,0.06)" : "#13141A",
                  border: `1px solid ${allDone ? phase.color + "55" : "#1E1F26"}`,
                  borderRadius: 6,
                  padding: "12px 16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  transition: "background 0.2s",
                }}
              >
                <span style={{ fontSize: 16, color: phase.color }}>{phase.icon}</span>
                <span style={{
                  flex: 1,
                  textAlign: "left",
                  fontSize: 12,
                  letterSpacing: 3,
                  fontWeight: 700,
                  color: allDone ? phase.color : "#888",
                  textTransform: "uppercase",
                }}>
                  {phase.phase}
                </span>
                <span style={{ fontSize: 11, color: allDone ? phase.color : "#555" }}>
                  {prog.done}/{prog.total}
                </span>
                <div style={{ width: 48, height: 2, background: "#1E1F26", borderRadius: 2 }}>
                  <div style={{
                    height: "100%",
                    width: `${prog.pct}%`,
                    background: phase.color,
                    borderRadius: 2,
                    transition: "width 0.3s",
                  }} />
                </div>
                <span style={{
                  fontSize: 10,
                  color: "#444",
                  transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                  display: "inline-block",
                }}>▶</span>
              </button>

              {/* Items */}
              {isOpen && (
                <div style={{
                  background: "#0B0C11",
                  border: "1px solid #1A1B22",
                  borderTop: "none",
                  borderRadius: "0 0 6px 6px",
                  overflow: "hidden",
                }}>
                  {phase.items.map((item, idx) => {
                    const done = !!checked[item.id];
                    const noteOpen = activeNote === item.id;
                    return (
                      <div
                        key={item.id}
                        style={{
                          borderBottom: idx < phase.items.length - 1 ? "1px solid #13141A" : "none",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "10px 16px",
                            cursor: "pointer",
                            background: done ? "rgba(255,255,255,0.015)" : "transparent",
                            transition: "background 0.15s",
                          }}
                          onClick={() => toggle(item.id)}
                        >
                          {/* Checkbox */}
                          <div style={{
                            width: 16,
                            height: 16,
                            border: `1.5px solid ${done ? phase.color : "#333"}`,
                            borderRadius: 3,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            background: done ? phase.color + "22" : "transparent",
                            transition: "all 0.15s",
                          }}>
                            {done && <span style={{ fontSize: 9, color: phase.color, fontWeight: 700 }}>✓</span>}
                          </div>

                          {/* Label */}
                          <span style={{
                            flex: 1,
                            fontSize: 12,
                            color: done ? "#555" : "#B8B8C4",
                            textDecoration: done ? "line-through" : "none",
                            textDecorationColor: "#444",
                            transition: "color 0.15s",
                            lineHeight: 1.4,
                          }}>
                            {item.label}
                          </span>

                          {/* Note toggle */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveNote(noteOpen ? null : item.id);
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              fontSize: 10,
                              color: noteOpen ? phase.color : "#333",
                              padding: "2px 4px",
                              borderRadius: 3,
                              transition: "color 0.15s",
                              flexShrink: 0,
                            }}
                          >
                            {noteOpen ? "▲" : "▼"}
                          </button>
                        </div>

                        {/* Note */}
                        {noteOpen && (
                          <div style={{
                            padding: "8px 16px 10px 44px",
                            background: "#0D0E13",
                            borderTop: `1px solid ${phase.color}22`,
                          }}>
                            <span style={{
                              fontSize: 11,
                              color: phase.color + "BB",
                              lineHeight: 1.5,
                              fontStyle: "italic",
                            }}>
                              ↳ {item.note}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Footer */}
        <div style={{
          marginTop: 32,
          padding: "16px",
          background: "#0B0C11",
          border: "1px solid #1A1B22",
          borderRadius: 6,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <span style={{ fontSize: 11, color: "#444", letterSpacing: 2 }}>
            {pct === 100 ? "✓ READY TO IMPORT" : "PIPELINE IN PROGRESS"}
          </span>
          <button
            onClick={() => setChecked({})}
            style={{
              background: "none",
              border: "1px solid #222",
              borderRadius: 4,
              color: "#555",
              fontSize: 10,
              letterSpacing: 2,
              padding: "5px 10px",
              cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            RESET
          </button>
        </div>
      </div>
    </div>
  );
}
