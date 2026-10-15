import { DIALS, HEART, height } from './world';
import { decodeSave, encodeSave } from './save';
import { describe, it, expect } from 'vitest';
import { Game, SHARDS } from './game';
describe('wayfarer commands',()=>{
 it('spends stamina sprinting and recovers when resting',()=>{
  const game=new Game(); const start=game.state.z;
  game.update(1,{x:0,z:-1,sprint:true});
  expect(game.state.z).toBeLessThan(start-8); expect(game.state.stamina).toBeLessThan(100);
  game.update(2,{x:0,z:0,sprint:false}); expect(game.state.stamina).toBe(100);
 });
});
it('collects each shard once and requires a real offering to kindle a beacon',()=>{
 const game=new Game(); game.state.x=-48;game.state.z=35;
 expect(game.interact()).toContain('five');
 for(const p of SHARDS.slice(0,5)){game.state.x=p.x;game.state.z=p.z; game.interact();game.interact();}
 expect(game.state.shards).toBe(5);
 game.state.x=-48;game.state.z=35;game.interact();game.interact();
 expect(game.state.beacons).toEqual([true,false,false]);expect(game.state.shards).toBe(0);
});
it('requires the visible dial sequence and all sentinels before the finale',()=>{
 const game=new Game(); game.state.x=-58;game.state.z=-53;
 expect(game.interact()).toContain('SUN');
 for(let i=0;i<3;i++){game.state.x=DIALS[i].x;game.state.z=DIALS[i].z;while(game.state.dials[i]!==i)game.interact();}
 game.state.x=-58;game.state.z=-53;game.interact();expect(game.state.beacons[1]).toBe(true);
 game.state.x=65;game.state.z=-14;expect(game.interact()).toContain('three');
 for(const enemy of game.enemies){game.state.x=enemy.x;game.state.z=enemy.z;game.state.y=height(enemy.x,enemy.z);for(let j=0;j<3;j++){game.attack();game.update(.5,{x:0,z:0,sprint:false});}}
 game.state.x=65;game.state.z=-14;game.interact();expect(game.state.beacons[2]).toBe(true);
 game.state.x=HEART.x;game.state.z=HEART.z;game.interact();expect(game.state.completed).toBe(false);
 game.state.beacons[0]=true;game.interact();expect(game.state.completed).toBe(true);
});
it('can glide from a jump and recovers without losing discoveries',()=>{
 const game=new Game();game.jump();game.jump();expect(game.gliding).toBe(true);
 game.state.beacons[0]=true;game.state.checkpoint=0;game.state.collected=[0];
 game.damage(5);expect(game.state.health).toBe(5);expect(game.state.collected).toEqual([0]);expect(game.state.x).toBe(-43);
});
it('round-trips progress and rejects corrupt or impossible saves',()=>{
 const game=new Game();game.state.collected=[0,2];game.state.shards=2;game.state.dials=[0,1,2];
 const restored=decodeSave(encodeSave(game.state));expect(restored?.collected).toEqual([0,2]);expect(restored?.shards).toBe(2);
 expect(decodeSave('{broken')).toBeNull();expect(decodeSave('{"version":99}')).toBeNull();
 expect(decodeSave(encodeSave({...game.state,x:999}))).toBeNull();
});
it('warns before striking and lets the wayfarer retreat from the marked ground',()=>{
 const game=new Game();game.state.x=54;game.state.z=-5;game.state.y=height(54,-5);
 game.update(.1,{x:0,z:0,sprint:false});expect(game.state.health).toBe(5);expect(game.enemies[0].phase).toBe('warning');
 game.update(.6,{x:-1,z:0,sprint:true});game.update(.5,{x:-1,z:0,sprint:true});expect(game.state.health).toBe(5);
});
it('rejects forged inventory, fractional counters and unearned beacons',()=>{
 const s=new Game().state;
 expect(decodeSave(encodeSave({...s,shards:5}))).toBeNull();
 expect(decodeSave(encodeSave({...s,health:2.5}))).toBeNull();
 expect(decodeSave(encodeSave({...s,beacons:[false,false,true]}))).toBeNull();
});
it('recovers at the checkpoint altitude after a lethal highland landing',()=>{
 const game=new Game();Object.assign(game.state,{x:-58,z:-53,y:height(-58,-53)+.01,vy:-30,health:1,checkpoint:0,beacons:[true,false,false]});
 game.update(.01,{x:0,z:0,sprint:false});
 expect(game.state.x).toBe(-43);expect(game.state.y).toBeCloseTo(height(-43,40));expect(game.message).toContain('discoveries');
});
it('blocks walking on a steep slope but permits stamina sprinting uphill',()=>{
 const game=new Game();Object.assign(game.state,{x:-58,z:-28,y:height(-58,-28)});
 game.update(.2,{x:0,z:-1,sprint:false});expect(game.state.z).toBe(-28);
 game.update(.2,{x:0,z:-1,sprint:true});expect(game.state.z).toBeLessThan(-30);expect(game.state.stamina).toBeLessThan(100);
});
it('collides with the beacon and stays inside the world boundary',()=>{
 const game=new Game();Object.assign(game.state,{x:-48,z:41,y:height(-48,41)});
 game.update(.5,{x:0,z:-1,sprint:false});expect(game.state.z).toBeGreaterThan(37.6);
 Object.assign(game.state,{x:107,z:90,y:height(107,90)});game.update(1,{x:1,z:0,sprint:true});expect(game.state.x).toBe(108);
});

import {LOOKOUT,LOOKOUT_TOP,GLIDE_LANDING,distance} from './world';
function approachLookout(){const g=new Game();Object.assign(g.state,{x:LOOKOUT.x,z:LOOKOUT.z+LOOKOUT.radius+2,y:height(LOOKOUT.x,LOOKOUT.z+LOOKOUT.radius+2)});g.update(.4,{x:0,z:-1,sprint:false});return g;}
it('enters a real vertical surface and climbs without uphill horizontal motion',()=>{
 const g=approachLookout();expect(g.climbing).not.toBeNull();expect(g.climbing!.normalZ).toBeGreaterThan(.99);
 const before={...g.state};g.update(1,{x:0,z:-1,sprint:false});expect(g.state.y).toBeGreaterThan(before.y+2);expect(g.state.x).toBeCloseTo(before.x);expect(g.state.z).toBeCloseTo(before.z);expect(g.state.stamina).toBeLessThan(before.stamina);
});
it('stationary clinging preserves stamina and lateral movement follows the surface',()=>{
 const g=approachLookout();const stamina=g.state.stamina,y=g.state.y;g.update(1,{x:0,z:0,sprint:false});expect(g.state.stamina).toBeCloseTo(stamina);expect(g.state.y).toBeCloseTo(y);
 g.update(.5,{x:1,z:0,sprint:false});expect(g.state.x).toBeGreaterThan(LOOKOUT.x);expect(distance(g.state,LOOKOUT)).toBeCloseTo(LOOKOUT.radius+.65);
});
it('stamina exhaustion releases into a fall and jump-away permits a glider handoff',()=>{
 const g=approachLookout();g.state.y+=4;g.state.stamina=.5;g.update(.2,{x:0,z:-1,sprint:false});expect(g.climbing).toBeNull();expect(g.state.vy).toBeLessThan(0);const y=g.state.y;g.update(.2,{x:0,z:0,sprint:false});expect(g.state.y).toBeLessThan(y);
 const jump=approachLookout();jump.state.y+=4;const z=jump.state.z;jump.jump();expect(jump.climbing).toBeNull();expect(jump.state.z).toBeGreaterThan(z);jump.jump();expect(jump.gliding).toBe(true);
});
it('tops out onto a standable ledge, collects its raised reward and glides to the marked landing',()=>{
 const g=approachLookout();for(let i=0;i<140&&g.climbing;i++)g.update(.05,{x:0,z:-1,sprint:false});expect(g.climbing).toBeNull();expect(g.state.y).toBeCloseTo(LOOKOUT_TOP);expect(g.airborne).toBe(false);
 g.interact();expect(g.state.collected).toContain(11);g.update(2,{x:0,z:0,sprint:false});g.jump();g.jump();
 for(let i=0;i<180&&g.gliding;i++)g.update(.05,{x:0,z:1,sprint:false});expect(g.airborne).toBe(false);expect(g.gliding).toBe(false);expect(distance(g.state,GLIDE_LANDING)).toBeLessThan(GLIDE_LANDING.radius);expect(g.message).toContain('landing');
});
it('the tower reward cannot be gathered from below and old saved progress restores safely outside its solid',()=>{
 const g=new Game();Object.assign(g.state,{x:LOOKOUT.x,z:LOOKOUT.z,y:height(LOOKOUT.x,LOOKOUT.z)});g.interact();expect(g.state.collected).not.toContain(11);
 g.state.collected=[0,2];g.state.shards=2;const saved=decodeSave(encodeSave(g.state));expect(saved?.collected).toEqual([0,2]);expect(distance(saved!,LOOKOUT)).toBeGreaterThan(LOOKOUT.radius+.8);expect(saved?.y).toBeCloseTo(height(saved!.x,saved!.z));
});

it('lets go without a jump and clears wall and flight state on a new journey',()=>{
 const g=approachLookout();g.state.y+=4;const z=g.state.z;expect(g.drop()).toBe(true);expect(g.climbing).toBeNull();expect(g.state.z).toBeGreaterThan(z);expect(g.state.vy).toBeLessThan(0);expect(g.drop()).toBe(false);
 g.jump();expect(g.gliding).toBe(true);g.reset();expect(g.gliding).toBe(false);expect(g.climbing).toBeNull();expect(g.climbCooldown).toBe(0);expect(g.state.collected).toEqual([]);expect(g.state.y).toBeCloseTo(height(0,72));
});
it('restores a summit save safely below the new solid while keeping its discovery',()=>{
 const g=new Game();Object.assign(g.state,{x:LOOKOUT.x,z:LOOKOUT.z,y:LOOKOUT_TOP,collected:[11],shards:1});
 const restored=decodeSave(encodeSave(g.state));expect(restored).not.toBeNull();expect(restored?.collected).toEqual([11]);expect(distance(restored!,LOOKOUT)).toBeGreaterThan(LOOKOUT.radius+.8);expect(restored?.y).toBeCloseTo(height(restored!.x,restored!.z));
});
