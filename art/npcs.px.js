// Hand-authored close-up NPC portraits for Piel de Cloro.
// Build: npm run build:npc-art
// Keep hidden infection data out of ordinary portraits; npc_infected is only
// for explicitly revealed states and must never be selected from generic NPC state.
use("sweetie16")
pal({
  k:"#11131c", s:"#313849", b:"#5b6578", p:"#a9b2c3", w:"#e3e7ec",
  r:"#8c394b", R:"#d45c65", g:"#416b55", G:"#8fbc88", y:"#c2a36a", c:"#6e9eaa",
  f:"#725547", F:"#c39b7f", h:"#292a31", H:"#50515b", u:"#29394a", U:"#587287",
  e:"#15171d", m:"#b8c5bf", M:"#d8dfd7"
})

// Neutral civilian: cropped shoulders-up, dark swept hair and a worn blue jacket.
sprite("npc_human", { w:24, h:32, outline:"k" },
  rect(3,23,18,9,"u"), rect(5,24,14,8,"U"), rect(10,21,4,5,"F"),
  rect(4,23,5,9,"u"), rect(15,23,5,9,"u"),
  rect(7,6,10,14,"F"), rect(5,9,2,8,"f"), rect(17,9,2,8,"f"),
  rect(6,5,12,3,"h"), rect(5,7,3,4,"h"), rect(16,7,3,4,"h"),
  rect(7,8,4,2,"H"), rect(13,8,4,2,"H"),
  rect(7,11,4,2,"w"), rect(13,11,4,2,"w"),
  rect(8,11,2,2,"e"), rect(14,11,2,2,"e"),
  rect(11,13,2,3,"f"), rect(9,17,6,1,"f"),
  rect(9,19,6,1,"f"), rect(8,24,2,2,"c"), rect(14,24,2,2,"c"),
  rect(11,26,2,5,"s")
)

// Archivist: silver side-part, square glasses, high collar and an old brass tag.
sprite("npc_archivist", { w:24, h:32, outline:"k" },
  rect(3,23,18,9,"s"), rect(5,24,14,8,"b"), rect(7,22,10,4,"p"),
  rect(10,20,4,5,"F"), rect(6,6,12,14,"F"), rect(4,10,2,7,"f"), rect(18,9,2,8,"f"),
  rect(5,4,14,3,"p"), rect(4,6,4,5,"p"), rect(16,6,4,4,"p"),
  rect(6,7,5,2,"w"), rect(13,7,5,2,"w"), rect(6,10,5,1,"k"), rect(13,10,5,1,"k"),
  rect(6,10,1,3,"y"), rect(10,10,1,3,"y"), rect(13,10,1,3,"y"), rect(17,10,1,3,"y"),
  rect(11,11,2,1,"y"), rect(8,12,2,2,"e"), rect(14,12,2,2,"e"),
  rect(11,14,2,2,"f"), rect(9,17,6,1,"f"), rect(9,19,6,1,"f"),
  rect(7,24,3,2,"U"), rect(14,24,3,2,"U"), rect(10,26,4,5,"p"), rect(10,27,4,1,"y")
)

// Kael: uneven dark fringe, narrow teal scarf and asymmetrical jacket.
sprite("npc_kael", { w:24, h:32, outline:"k" },
  rect(2,23,20,9,"u"), rect(4,24,16,8,"s"), rect(10,21,4,5,"F"),
  rect(6,6,12,14,"F"), rect(4,9,2,7,"h"), rect(18,9,2,7,"h"),
  rect(5,4,5,4,"h"), rect(9,3,4,4,"H"), rect(13,5,5,3,"h"),
  rect(7,7,10,2,"h"), rect(8,11,3,2,"w"), rect(14,11,3,2,"w"),
  rect(9,11,1,2,"e"), rect(15,11,1,2,"e"), rect(12,13,1,3,"f"),
  rect(9,17,7,1,"f"), rect(10,19,4,1,"f"),
  rect(10,23,4,9,"c"), rect(9,24,6,2,"M"), rect(10,27,4,1,"M"),
  rect(5,25,4,2,"U"), rect(15,24,4,4,"u"), rect(17,8,1,3,"f")
)

// Hive: hooded subject behind a segmented respirator; visually distinct but not a diagnosis.
sprite("npc_hive", { w:24, h:32, outline:"k" },
  rect(3,23,18,9,"s"), rect(5,24,14,8,"u"), rect(10,21,4,5,"b"),
  rect(5,5,14,16,"s"), rect(4,8,3,13,"k"), rect(17,8,3,13,"k"),
  rect(6,7,12,12,"p"), rect(7,9,4,3,"w"), rect(13,9,4,3,"w"),
  rect(8,10,2,2,"e"), rect(14,10,2,2,"e"),
  rect(7,13,10,5,"b"), rect(8,14,8,1,"s"), rect(8,16,8,1,"s"),
  rect(5,4,14,3,"k"), rect(6,3,12,2,"k"),
  rect(7,23,4,3,"c"), rect(13,23,4,3,"c"),
  rect(9,26,6,4,"s"), rect(11,27,2,2,"p")
)

// Patient Zero: close-cropped pale hair, tired eyes, and a damaged clinical collar.
sprite("npc_patient_zero", { w:24, h:32, outline:"k" },
  rect(3,23,18,9,"p"), rect(5,24,14,8,"w"), rect(7,21,10,5,"M"),
  rect(10,20,4,5,"F"), rect(6,6,12,14,"F"),
  rect(5,7,3,8,"p"), rect(16,7,3,8,"p"), rect(7,5,10,2,"M"),
  rect(7,9,4,2,"b"), rect(13,9,4,2,"b"),
  rect(7,11,4,1,"e"), rect(13,11,4,1,"e"),
  rect(8,12,2,1,"s"), rect(14,12,2,1,"s"),
  rect(11,13,2,3,"f"), rect(9,17,6,1,"f"), rect(10,19,4,1,"f"),
  rect(5,24,4,3,"U"), rect(15,24,4,3,"U"),
  rect(10,25,4,5,"s"), rect(11,27,2,2,"r")
)

// Explicit reveal-only sprite. Never choose this from hidden infection state in the normal NPC renderer.
sprite("npc_infected", { w:24, h:32, outline:"k" },
  rect(3,23,18,9,"r"), rect(5,24,14,8,"R"), rect(10,21,4,5,"s"),
  rect(6,6,12,14,"r"), rect(4,9,3,9,"R"), rect(17,8,3,10,"R"),
  rect(5,4,14,3,"k"), rect(6,3,12,2,"k"), rect(7,7,10,2,"r"),
  rect(7,11,4,2,"w"), rect(13,11,4,2,"w"), rect(8,11,2,2,"k"), rect(14,11,2,2,"k"),
  rect(11,13,2,3,"k"), rect(8,17,8,2,"k"), rect(9,19,6,1,"R"),
  rect(7,24,3,4,"k"), rect(14,24,3,4,"k"), rect(10,26,4,4,"r")
)

sheet("npc_portraits", ["npc_human", "npc_infected", "npc_archivist", "npc_kael", "npc_hive", "npc_patient_zero"], { cols:3, pad:1 })
