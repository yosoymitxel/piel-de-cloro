/**
 * Piel de Cloro — deterministic, code-authored pixel portrait generator.
 * Portrait appearance is cosmetic. Infection is drawn only when explicitly revealed.
 */
const PALETTES = [
  { name:"Acero húmedo", skin:"#b78f78", skinLight:"#d5ad91", skinShadow:"#745448", hair:"#20242c", hairLight:"#414753", eye:"#d8e4d9", accent:"#70bcb2", background:"#101a20", bgLight:"#263640", shirt:"#344a52", shirtLight:"#57717a", shirtDark:"#1d2d35" },
  { name:"Óxido", skin:"#d0a886", skinLight:"#edc7a3", skinShadow:"#906451", hair:"#342523", hairLight:"#62413a", eye:"#d4e6de", accent:"#c8a260", background:"#211a1b", bgLight:"#392627", shirt:"#62423b", shirtLight:"#8d6251", shirtDark:"#38282b" },
  { name:"Carbón", skin:"#896b5d", skinLight:"#b18c74", skinShadow:"#503c39", hair:"#11151a", hairLight:"#2f353d", eye:"#e0ddc9", accent:"#bd555c", background:"#15171d", bgLight:"#292b34", shirt:"#303943", shirtLight:"#515b68", shirtDark:"#1c232c" },
  { name:"Sal pálida", skin:"#c8a68b", skinLight:"#ead0ad", skinShadow:"#84695d", hair:"#b6a17a", hairLight:"#d7c59a", eye:"#d9e7e1", accent:"#78a4c1", background:"#182129", bgLight:"#293b49", shirt:"#334b61", shirtLight:"#587895", shirtDark:"#1e3142" },
  { name:"Cemento", skin:"#a68a78", skinLight:"#c8aa91", skinShadow:"#655149", hair:"#454441", hairLight:"#747066", eye:"#e1d9c8", accent:"#9c766f", background:"#201f20", bgLight:"#363436", shirt:"#4b4f4d", shirtLight:"#727775", shirtDark:"#2e3333" }
];

const HAIR = {
  bald:     { rear:[], top:[], temples:[] },
  short:    { rear:[], top:[[11,5,10,2],[9,7,14,2],[9,9,4,2],[21,9,3,1]], temples:[[9,10,2,5],[21,10,2,4]] },
  shaved:   { rear:[], top:[[11,6,10,1],[9,7,14,1]], temples:[] },
  long:     { rear:[[8,10,3,13],[21,10,3,13],[9,19,2,5],[22,18,2,6]], top:[[11,5,10,2],[9,7,14,2],[9,9,14,1]], temples:[] },
  bob:      { rear:[[8,10,4,9],[20,10,4,9]], top:[[11,5,10,2],[9,7,14,2],[9,9,14,2]], temples:[] },
  ponytail: { rear:[[22,9,4,4],[24,12,3,7],[23,19,3,4],[22,22,2,2]], top:[[11,5,10,2],[9,7,14,2],[9,9,12,1]], temples:[[9,10,2,4]] },
  bun:      { rear:[[21,5,5,5],[22,4,3,2]], top:[[11,5,10,2],[9,7,14,2],[9,9,14,1]], temples:[[9,10,2,4]] },
  wild:     { rear:[[8,10,3,8],[21,10,3,8]], top:[[10,4,4,4],[14,3,5,5],[18,5,5,4],[8,7,7,4],[10,9,13,2]], temples:[[8,10,3,5],[21,10,3,5]] },
  mohawk:   { rear:[], top:[[14,2,4,4],[13,5,6,4],[12,8,8,2]], temples:[[9,10,2,3],[21,10,2,3]] },
  punk:     { rear:[], top:[[9,6,4,4],[12,3,4,6],[16,2,4,7],[19,5,4,5],[9,9,15,2]], temples:[[9,10,2,3],[21,10,2,3]] }
};

const SKIN_PALETTE = {
  "--avatar-skin-1":0, "--avatar-skin-2":1, "--avatar-skin-3":3,
  "--avatar-skin-4":2, "--avatar-skin-5":4
};

function hashSeed(value) {
  const input=String(value ?? "unknown-npc");
  let hash=2166136261;
  for(let i=0;i<input.length;i++){ hash^=input.charCodeAt(i); hash=Math.imul(hash,16777619); }
  return hash>>>0;
}
function makeRandom(seed) {
  let state=seed>>>0;
  return ()=>{ state+=0x6D2B79F5; let t=state; t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61); return ((t^(t>>>14))>>>0)/4294967296; };
}
const rect=(x,y,w,h,fill,extra="")=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
const poly=(points,fill)=>`<polygon points="${points}" fill="${fill}"/>`;
const stroke=(x1,y1,x2,y2,color,width=1)=>`<path d="M${x1} ${y1}H${x2}V${y2}" fill="none" stroke="${color}" stroke-width="${width}"/>`;
function drawRects(items,color){return items.map(([x,y,w,h])=>rect(x,y,w,h,color)).join("");}
function row(cx,y,width,color){return rect(cx-Math.floor(width/2),y,width,1,color);}
function shapeRows(cx,rows,color){return rows.map(([y,w])=>row(cx,y,w,color)).join("");}
function safeHair(value){return Object.hasOwn(HAIR,value)?value:"short";}
function safeOption(value,choices,fallback){return choices.includes(value)?value:fallback;}
function skinIndex(value){return SKIN_PALETTE[value];}

/**
 * @param {string|number} seed Stable NPC ID.
 * @param {{hair?:string,facialHair?:string,clothes?:string,accessory?:string,eyeType?:string,mouthType?:string,skinColor?:string,paletteIndex?:number,exhausted?:boolean,infected?:boolean,revealed?:boolean}} options
 * @returns {string} Crisp-edge SVG on a 32×40 logical pixel grid.
 */
export function generateAvatarSvg(seed,options={}) {
  const random=makeRandom(hashSeed(seed));
  const mappedSkin=skinIndex(options.skinColor);
  const paletteIndex=Number.isInteger(options.paletteIndex)
    ? ((options.paletteIndex%PALETTES.length)+PALETTES.length)%PALETTES.length
    : mappedSkin ?? Math.floor(random()*PALETTES.length);
  const p=PALETTES[paletteIndex];
  const hairStyle=safeHair(options.hair);
  const hair=HAIR[hairStyle];
  const clothes=safeOption(options.clothes,["worker","civilian","scavenger","suit","rags"],"scavenger");
  const accessory=safeOption(options.accessory,["none","glasses","mask","scar","patch","earring","hood"],"none");
  const eyeType=safeOption(options.eyeType,["normal","narrow","big","tired","squint"],"normal");
  const mouthType=safeOption(options.mouthType,["smile","frown","open","tight","crooked"],"tight");
  const shirtMap={
    worker:{base:"#8d4a2e",light:"#c77a48",dark:"#4b2d2a"},
    civilian:{base:"#345a70",light:"#5f899a",dark:"#203744"},
    scavenger:{base:"#39454b",light:"#65737a",dark:"#242d33"},
    suit:{base:"#252a31",light:"#48505a",dark:"#151a20"},
    rags:{base:"#66675c",light:"#92917c",dark:"#3a403c"}
  };
  const shirt=shirtMap[clothes];
  const anomaly=options.revealed===true && options.infected===true;
  const cx=16;
  const headOuter=[[7,6],[8,10],[9,12],[10,14],[11,14],[12,14],[13,14],[14,14],[15,14],[16,14],[17,14],[18,14],[19,14],[20,14],[21,12],[22,10],[23,8]];
  const headInner=headOuter.map(([y,w])=>[y+1,Math.max(4,w-2)]);
  const eyeY=eyeType==="tired"?15:14+Math.floor(random()*2);
  const eyeW=eyeType==="big"?4:eyeType==="narrow"||eyeType==="squint"?2:3;
  const leftEye=11,rightEye=18;
  const eyeFill=anomaly?"#d8f3a4":p.eye;
  const pupil=anomaly?"#bf3f49":"#15191e";
  const brows=rect(10,eyeY-2,5,1,p.skinShadow)+rect(18,eyeY-2,5,1,p.skinShadow);
  const eyes=rect(leftEye,eyeY,eyeW,eyeType==="squint"?1:2,eyeFill)+rect(rightEye,eyeY,eyeW,eyeType==="squint"?1:2,eyeFill)
    +rect(leftEye+1,eyeY,1,2,pupil)+rect(rightEye+1,eyeY,1,2,pupil);
  const underEyes=(options.exhausted||eyeType==="tired")
    ?rect(leftEye,eyeY+2,eyeW,1,p.skinShadow)+rect(rightEye,eyeY+2,eyeW,1,p.skinShadow):"";
  const nose=rect(15,eyeY+1,2,3,p.skinShadow)+rect(16,eyeY+2,1,2,p.skinLight);
  const mouth=mouthType==="smile"
    ?rect(13,21,6,1,p.skinShadow)+rect(14,22,4,1,p.skinShadow)
    :mouthType==="frown"
      ?rect(13,22,6,1,p.skinShadow)+rect(14,21,4,1,p.skinShadow)
      :mouthType==="open"?rect(14,21,4,3,"#211a1b")+rect(15,22,2,1,"#9f5b59")
      :mouthType==="crooked"?rect(13,21,5,1,p.skinShadow)+rect(17,22,2,1,p.skinShadow)
      :rect(13,21,6,1,p.skinShadow);
  const beard=options.facialHair==="beard"
    ?poly("10,19 12,21 13,24 19,24 21,21 22,19 22,23 19,26 13,26 10,23",p.hair)
    :options.facialHair==="stubble"
      ?rect(11,21,1,1,p.skinShadow)+rect(13,23,1,1,p.skinShadow)+rect(18,22,1,1,p.skinShadow)+rect(20,21,1,1,p.skinShadow)
      :options.facialHair==="mustache"?rect(12,20,3,1,p.hair)+rect(17,20,3,1,p.hair):"";
  const accessoryLayer=accessory==="glasses"
    ?rect(10,eyeY-1,6,4,"none",'stroke="#10161b" stroke-width="1"')+rect(17,eyeY-1,6,4,"none",'stroke="#10161b" stroke-width="1"')+rect(16,eyeY,1,1,"#10161b")
      +rect(11,eyeY,2,1,"#c7dedb") + rect(18,eyeY,2,1,"#c7dedb")
    :accessory==="mask"
      ?rect(10,19,13,5,"#b4c1ba")+rect(11,19,11,1,"#e0e6dc")+rect(12,21,2,1,"#687978")+rect(17,21,2,1,"#687978")+rect(9,20,2,1,p.skinShadow)+rect(22,20,2,1,p.skinShadow)
    :accessory==="patch"?rect(10,12,3,4,p.hair)+rect(11,12,1,2,p.hairLight)
    :accessory==="scar"?poly("21,13 22,13 20,17 19,17",p.accent)
    :accessory==="earring"?rect(22,18,1,3,p.accent)+rect(22,20,2,1,p.accent)
    :accessory==="hood"?poly("8,13 8,9 11,5 21,5 24,10 24,24 21,22 21,10 11,10 11,24 8,25",p.shirtDark)+rect(10,7,2,10,p.shirt):"";
  const facialAnomaly=anomaly
    ?poly("10,12 12,11 13,13 12,16 10,17", "#a43e4b")+poly("21,17 23,17 22,21 20,20","#a43e4b")+rect(15,8,2,1,"#a43e4b"):"";
  const ponytailTie=hairStyle==="ponytail"?rect(23,12,3,1,p.accent)+rect(24,13,1,1,p.skinLight):"";
  const hairHighlights=hairStyle==="bald"||hairStyle==="shaved"?"":rect(11,7,4,1,p.hairLight)+rect(16,6,3,1,p.hairLight);

  const parts=[
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40" width="256" height="320" shape-rendering="crispEdges" role="img" aria-label="Retrato pixel art de NPC">',
    rect(0,0,32,40,p.background),rect(1,2,5,1,p.accent,'opacity="0.55"'),rect(25,4,6,1,p.bgLight),
    rect(2,7,1,11,p.bgLight,'opacity="0.6"'),rect(4,11,1,5,p.accent,'opacity="0.25"'),rect(27,8,2,13,p.bgLight,'opacity="0.55"'),
    // Shoulder and jacket silhouette, with lit left plane and dark right plane.
    poly("7,29 10,27 13,26 19,26 22,28 26,31 29,40 3,40",shirt.base),
    poly("7,30 11,28 14,28 14,40 4,40",shirt.light),poly("19,28 22,29 26,32 28,40 19,40",shirt.dark),
    rect(15,29,2,11,shirt.dark),rect(13,29,1,3,p.accent),rect(18,30,1,7,shirt.light),
    // Neck, ears and rear hair are behind the face.
    rect(13,23,6,7,p.skinShadow),rect(14,24,4,5,p.skin),
    rect(8,15,3,5,p.skinShadow),rect(9,15,2,4,p.skin),rect(21,15,3,5,p.skinShadow),rect(21,15,2,4,p.skin),
    drawRects(hair.rear,p.hair),drawRects(hair.temples,p.hair),ponytailTie,
    // Head contour and skin planes; rows create a deliberate stepped silhouette.
    shapeRows(cx,headOuter.map(([y,w])=>[y,w+2]),"#101419"),
    shapeRows(cx,headInner,p.skin),
    row(cx,10,10,p.skinLight),row(cx,11,12,p.skinLight),row(cx,12,12,p.skin),
    rect(10,16,2,4,p.skinShadow,'opacity="0.55"'),rect(21,16,1,4,p.skinShadow,'opacity="0.65"'),
    rect(12,10,2,2,p.skinLight),rect(19,10,2,2,p.skinLight),
    drawRects(hair.top,p.hair),hairHighlights,
    // Hair and clothing are built from discrete color planes, not texture noise.
    brows,eyes,underEyes,nose,mouth,beard,
    // Clothes collar, seams and restrained wear.
    poly("11,27 14,29 16,31 18,29 21,27 19,33 13,33",shirt.dark),
    rect(15,31,2,8,shirt.light),rect(10,34,1,4,shirt.dark),rect(22,34,1,4,shirt.light),
    rect(6,33,2,5,p.bgLight,'opacity="0.5"'),rect(24,33,2,5,p.bgLight,'opacity="0.4"'),
    accessoryLayer,facialAnomaly,
    // Sparse CRT accents; no random speckle laid over the face.
    rect(0,25,32,1,"#081115",'opacity="0.2"'),rect(0,37,32,1,"#081115",'opacity="0.45"'),
    rect(2,38,4,1,p.accent,'opacity="0.45"'),rect(27,3,3,1,p.accent,'opacity="0.3"'),
    "</svg>"
  ];
  return parts.join("");
}

export function generateAvatarDataUri(seed,options={}) {
  const svg=generateAvatarSvg(seed,options);
  const encoded=typeof btoa==="function"
    ?btoa(unescape(encodeURIComponent(svg)))
    :Buffer.from(svg,"utf8").toString("base64");
  return `data:image/svg+xml;base64,${encoded}`;
}

export function renderAvatar(container,seed,options={}) {
  if(!container||typeof container.appendChild!=="function") throw new TypeError("renderAvatar necesita un contenedor DOM válido.");
  const image=document.createElement("img");
  image.className="npc-avatar npc-avatar--pixel";
  image.alt=options.alt??"Retrato de personaje";
  image.width=options.size??128;
  image.height=options.size??160;
  image.decoding="async";
  image.src=generateAvatarDataUri(seed,options);
  container.replaceChildren(image);
  return image;
}

export const avatarGeneratorOptions = Object.freeze({
  palettes: PALETTES.map(({name,skin,skinLight,skinShadow,hair,accent,background,shirt})=>({name,skin,skinLight,skinShadow,hair,accent,background,shirt})),
  hairStyles: Object.freeze(Object.keys(HAIR)),
  clothesStyles: Object.freeze(["worker","civilian","scavenger","suit","rags"]),
  accessories: Object.freeze(["none","glasses","mask","scar","patch","earring","hood"]),
  eyeTypes: Object.freeze(["normal","narrow","big","tired","squint"]),
  mouthTypes: Object.freeze(["smile","frown","open","tight","crooked"])
});
