export interface Point {x:number;z:number}
export const BEACONS=[{x:-48,z:35,name:'Meadow Offering',hint:'Offer five aster shards',color:0xffcf78},{x:-58,z:-53,name:'Wind Observatory',hint:'Align the dials: Sun · Moon · Star',color:0x9ce6ef},{x:65,z:-14,name:'Sentinel Court',hint:'Quiet the three stone sentinels',color:0xffa894}];
export const HEART={x:5,z:-76};
export const SHARDS:(Point & {y?:number})[]=[{x:-12,z:60},{x:-23,z:53},{x:-35,z:62},{x:-43,z:49},{x:-60,z:54},{x:-70,z:27},{x:-32,z:23},{x:13,z:37},{x:28,z:18},{x:-77,z:-17},{x:42,z:-57},{x:35,z:61}];
export const BERRIES:Point[]=[{x:8,z:61},{x:-23,z:31},{x:-41,z:-13},{x:48,z:12},{x:75,z:-44},{x:-68,z:-61}];
export const DIALS:Point[]=[{x:-65,z:-46},{x:-58,z:-46},{x:-51,z:-46}];
export const ENEMIES:Point[]=[{x:54,z:-5},{x:75,z:-10},{x:65,z:-30}];
export function height(x:number,z:number){
 const highland=23*Math.exp(-((x+58)**2+(z+53)**2)/750);
 const ridge=9*Math.exp(-((x-54)**2+(z+65)**2)/1100);
 return highland+ridge+Math.sin(x*.043)*2.4+Math.cos(z*.053)*2+Math.sin((x+z)*.07)*.8;
}
export const OBSTACLES: (Point & {radius:number})[] = [{x:-48,z:35,radius:2},{x:-58,z:-53,radius:2},{x:65,z:-14,radius:2},...DIALS.map(p=>({...p,radius:1.2})),{x:5,z:-76,radius:2.6}];
export const distance=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.z-b.z);

export interface Scenery extends Point {kind:'tree'|'rock';scale:number;tint:number}
export const SCENERY:Scenery[]=[];
let scenerySeed=9123;
export function worldRandom(){scenerySeed=(scenerySeed*1664525+1013904223)>>>0;return scenerySeed/4294967296;}
for(let i=0;i<170;i++){
 const x=(worldRandom()-.5)*216,z=(worldRandom()-.5)*216;
 if(BEACONS.some(p=>distance({x,z},p)<12)||distance({x,z},{x:0,z:72})<10||distance({x,z},{x:-58,z:-53})<19)continue;
 const kind=worldRandom()<.65?'tree':'rock';
 SCENERY.push({x,z,kind,scale:.7+worldRandom()*.7,tint:worldRandom()});
}
OBSTACLES.push(...SCENERY.map(p=>({...p,radius:p.kind==='tree'?.55*p.scale:1.1*p.scale})));
for(const p of BEACONS)for(let j=0;j<5;j++){const angle=j/5*Math.PI*2;OBSTACLES.push({x:p.x+Math.cos(angle)*9,z:p.z+Math.sin(angle)*9,radius:1.05});}
OBSTACLES.push({x:HEART.x-7,z:HEART.z+9,radius:1.3},{x:HEART.x+7,z:HEART.z+9,radius:1.3});

/** Optional authored vertical route, separate from all existing beacon checkpoints. */
export const LOOKOUT={x:23,z:53,radius:4,height:12,name:'Windward Lookout'};
export const LOOKOUT_TOP=height(LOOKOUT.x,LOOKOUT.z)+LOOKOUT.height;
export const GLIDE_LANDING={x:23,z:92,radius:9};
SHARDS[11]={x:LOOKOUT.x,z:LOOKOUT.z,y:LOOKOUT_TOP+1};
export function surfaceGround(x:number,z:number,y:number){return distance({x,z},LOOKOUT)<=LOOKOUT.radius&&y>=LOOKOUT_TOP-.15?LOOKOUT_TOP:height(x,z);}
export function restoreGroundPosition(x:number,z:number){const d=distance({x,z},LOOKOUT);if(d<LOOKOUT.radius+.8){const nx=d?(x-LOOKOUT.x)/d:0,nz=d?(z-LOOKOUT.z)/d:1;x=LOOKOUT.x+nx*(LOOKOUT.radius+.85);z=LOOKOUT.z+nz*(LOOKOUT.radius+.85);}return{x,z,y:height(x,z)};}

// Keep this authored route free of randomly placed trunks/rocks.
for(let i=SCENERY.length-1;i>=0;i--)if(distance(SCENERY[i],LOOKOUT)<LOOKOUT.radius+3)SCENERY.splice(i,1);
for(let i=OBSTACLES.length-1;i>=0;i--)if(distance(OBSTACLES[i],LOOKOUT)<LOOKOUT.radius+3)OBSTACLES.splice(i,1);
