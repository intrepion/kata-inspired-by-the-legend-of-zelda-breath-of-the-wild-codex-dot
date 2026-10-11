import { BEACONS, BERRIES, DIALS, ENEMIES, HEART, OBSTACLES, SHARDS, distance, height } from './world';
export { SHARDS } from './world';
export interface Input { x:number; z:number; sprint:boolean }
export interface State {
 x:number;z:number;y:number;vy:number;facing:number;health:number;stamina:number;shards:number;berries:number;
 collected:number[];pickedBerries:number[];beacons:boolean[];dials:number[];defeated:number[];checkpoint:number;completed:boolean;
}
export interface Enemy {x:number;z:number;health:number;phase:'idle'|'warning'|'strike'|'rest';timer:number;targetX:number;targetZ:number}
export function initialState():State{return {x:0,z:72,y:height(0,72),vy:0,facing:Math.PI,health:5,stamina:100,shards:0,berries:2,collected:[],pickedBerries:[],beacons:[false,false,false],dials:[2,0,1],defeated:[],checkpoint:-1,completed:false};}
export class Game {
 state:State=initialState();
 enemies:Enemy[]=ENEMIES.map(p=>({...p,health:3,phase:'idle',timer:0,targetX:p.x,targetZ:p.z}));
 gliding=false;attackTime=0;invulnerable=0;message='Follow the amber stones to the Meadow Offering.';
 get airborne(){return this.state.y>height(this.state.x,this.state.z)+.15;}
 update(dt:number,input:Input){
  dt=Math.max(0,Math.min(dt,2));
  const s=this.state; const moving=Math.hypot(input.x,input.z)>0;
  const sprint=moving&&input.sprint&&s.stamina>1&&!this.airborne;
  const length=Math.max(1,Math.hypot(input.x,input.z));
  let speed=this.gliding?11:sprint?14:7;
  const nx=Math.max(-108,Math.min(108,s.x+input.x/length*dt*speed));
  const nz=Math.max(-108,Math.min(108,s.z+input.z/length*dt*speed));
  const rise=height(nx,nz)-height(s.x,s.z);
  const steep=moving&&rise>Math.hypot(nx-s.x,nz-s.z)*.42&&!this.airborne;
  if(steep&&!sprint){speed=0;this.message='Steep ground • hold Shift / Sprint to climb.';}
  let nextX=s.x+input.x/length*dt*speed,nextZ=s.z+input.z/length*dt*speed;
  nextX=Math.max(-108,Math.min(108,nextX));nextZ=Math.max(-108,Math.min(108,nextZ));
  for(const o of OBSTACLES){
   const d=Math.hypot(nextX-o.x,nextZ-o.z);
   if(d<o.radius+.65&&s.y<height(o.x,o.z)+5){const scale=(o.radius+.65)/Math.max(d,.001);nextX=o.x+(nextX-o.x)*scale;nextZ=o.z+(nextZ-o.z)*scale;}
  }
  s.x=nextX;s.z=nextZ;
  if(moving)s.facing=Math.atan2(input.x,input.z);
  const draining=(sprint?22:0)+(steep&&sprint?12:0)+(this.gliding?13:0);
  s.stamina=Math.min(100,Math.max(0,s.stamina+(draining?-draining:!this.airborne?28:0)*dt));
  if(s.stamina<=0)this.gliding=false;
  const ground=height(s.x,s.z);
  s.vy-= (this.gliding?3.2:22)*dt;
  if(this.gliding)s.vy=Math.max(-2.4,s.vy);
  s.y+=s.vy*dt;
  if(s.y<=ground){
   if(s.vy< -22){this.damage(1);this.message='Hard landing • open your glider with Space.';}
   s.y=ground;s.vy=0;this.gliding=false;
  }
  this.attackTime=Math.max(0,this.attackTime-dt);this.invulnerable=Math.max(0,this.invulnerable-dt);
  this.updateEnemies(dt);
 }
 jump(){if(!this.airborne){this.state.vy=10;this.state.y+=.2;this.message='Space again in the air opens your glider.';}else {this.gliding=!this.gliding&&this.state.stamina>0;}}
 attack(){
  if(this.attackTime>0)return false;
  this.attackTime=.45;
  let hit=false;
  this.enemies.forEach((e,i)=>{if(!this.state.defeated.includes(i)&&distance(e,this.state)<5&&Math.abs(this.state.y-height(e.x,e.z))<4&&e.health>0){
   e.health--;hit=true;this.message='Stone fractures • '+e.health+' strikes remain.';e.phase='rest';e.timer=.6;
   if(e.health<=0){this.state.defeated.push(i);this.message='Sentinel quieted. The court remembers.';}
  }});return hit;
 }
 heal(){if(this.state.berries>0&&this.state.health<5){this.state.berries--;this.state.health=Math.min(5,this.state.health+2);this.message='A sunberry restores two hearts.';return true;}this.message='Save your sunberries for when you are hurt.';return false;}
 damage(amount:number){if(this.invulnerable>0)return;this.state.health-=amount;this.invulnerable=1.2;if(this.state.health<=0)this.recover();}
 recover(){const s=this.state;const p=s.checkpoint>=0?BEACONS[s.checkpoint]:{x:0,z:72};s.x=p.x+5;s.z=p.z+5;s.y=height(s.x,s.z);s.vy=0;s.health=5;s.stamina=100;this.gliding=false;this.invulnerable=3;this.enemies.forEach((e,i)=>{Object.assign(e,ENEMIES[i],{phase:'idle',timer:0});});this.message='The wind carries you back. Your discoveries remain.';}
 interact(){
  const s=this.state;
  const shard=SHARDS.findIndex((p,i)=>!s.collected.includes(i)&&distance(p,s)<3.8);
  if(shard>=0){s.collected.push(shard);s.shards++;return this.message='Aster shard found • '+s.shards+' / 5 for the meadow.';}
  const berry=BERRIES.findIndex((p,i)=>!s.pickedBerries.includes(i)&&distance(p,s)<3.8);
  if(berry>=0){s.pickedBerries.push(berry);s.berries++;return this.message='Sunberry gathered • R to restore two hearts.';}
  const dial=DIALS.findIndex(p=>distance(p,s)<3.3);
  if(dial>=0&&!s.beacons[1]){s.dials[dial]=(s.dials[dial]+1)%3;return this.message='Wind dial '+(dial+1)+': '+['Sun','Moon','Star'][s.dials[dial]];}
  const beacon=BEACONS.findIndex(p=>distance(p,s)<6);
  if(beacon>=0){
   if(s.beacons[beacon]){s.checkpoint=beacon;s.health=5;return this.message='Rest beneath the beacon. Hearts restored.';}
   if(beacon===0&&s.shards<5)return this.message='Gather five aster shards from the glowing meadow stones.';
   if(beacon===1&&s.dials.join(',')!=='0,1,2')return this.message='The arch reads: SUN · MOON · STAR. Turn the three dials.';
   if(beacon===2&&s.defeated.length<3)return this.message='Quiet all three sentinels. Strike with F; retreat when the ring glows.';
   if(beacon===0)s.shards-=5;
   s.beacons[beacon]=true;s.checkpoint=beacon;s.health=5;s.stamina=100;
   return this.message=s.beacons.every(Boolean)?'All currents restored. Reach the Heartspire in the north.':'Wind beacon restored • a new recovery point awakens.';
  }
  if(distance(s,HEART)<7){if(s.beacons.every(Boolean)){s.completed=true;return this.message='ASTER VALE AWAKENS • You returned the wind to its home.';}return this.message='The Heartspire awaits all three wind currents.';}
  return this.message='Explore the valley. E interacts with nearby glowing objects.';
 }
 nearby(){const s=this.state;
  if(SHARDS.some((p,i)=>!s.collected.includes(i)&&distance(p,s)<3.8))return 'E · Gather aster shard';
  if(BERRIES.some((p,i)=>!s.pickedBerries.includes(i)&&distance(p,s)<3.8))return 'E · Gather sunberry';
  const dial=DIALS.findIndex(p=>distance(p,s)<3.3);if(dial>=0&&!s.beacons[1])return 'E · Turn dial '+(dial+1)+' · '+['Sun','Moon','Star'][s.dials[dial]];
  const beacon=BEACONS.findIndex(p=>distance(p,s)<6);if(beacon>=0)return 'E · '+(s.beacons[beacon]?'Rest at ': 'Awaken ')+BEACONS[beacon].name;
  if(distance(s,HEART)<7)return 'E · Reunite the currents';return '';
 }
 private updateEnemies(dt:number){this.enemies.forEach((e,i)=>{
  if(this.state.defeated.includes(i))return;
  e.timer-=dt;const d=distance(e,this.state);
  if(e.phase==='idle'&&d<15&&Math.abs(this.state.y-height(e.x,e.z))<5){
   if(d>3.5){e.x+=(this.state.x-e.x)/d*2.7*dt;e.z+=(this.state.z-e.z)/d*2.7*dt;}
   else {e.phase='warning';e.timer=.95;e.targetX=this.state.x;e.targetZ=this.state.z;}
  } else if(e.phase==='warning'&&e.timer<=0){e.phase='strike';e.timer=.2;if(distance(this.state,{x:e.targetX,z:e.targetZ})<3.8&&Math.abs(this.state.y-height(e.x,e.z))<3)this.damage(1);}
  else if(e.phase==='strike'&&e.timer<=0){e.phase='rest';e.timer=1.3;}
  else if(e.phase==='rest'&&e.timer<=0)e.phase='idle';
  if(distance(e,ENEMIES[i])>20){e.x=ENEMIES[i].x;e.z=ENEMIES[i].z;e.phase='idle';}
 });}
}
