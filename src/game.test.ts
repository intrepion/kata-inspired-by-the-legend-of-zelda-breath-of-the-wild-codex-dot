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
