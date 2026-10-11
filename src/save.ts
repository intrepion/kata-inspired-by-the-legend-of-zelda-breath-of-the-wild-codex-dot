import { initialState, type State } from './game';
import { height } from './world';
export const SAVE_KEY='aster-vale-v1';
export function encodeSave(state:State){return JSON.stringify({version:1,state});}
export function decodeSave(raw:string|null):State|null{
 try{
  if(!raw)return null;const data=JSON.parse(raw);if(data.version!==1||!data.state)return null;
  const s=data.state;const bounded=(n:unknown,min:number,max:number)=>typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max;
  if(!bounded(s.x,-108,108)||!bounded(s.z,-108,108)||!bounded(s.health,1,5)||!bounded(s.stamina,0,100)||!bounded(s.shards,0,12)||!bounded(s.berries,0,8))return null;
  const indices=(a:unknown,max:number)=>Array.isArray(a)&&a.every(n=>Number.isInteger(n)&&n>=0&&n<max)&&new Set(a).size===a.length;
  if(!indices(s.collected,12)||!indices(s.pickedBerries,6)||!indices(s.defeated,3))return null;
  if(!Array.isArray(s.beacons)||s.beacons.length!==3||!s.beacons.every((b:unknown)=>typeof b==='boolean'))return null;
  if(!Array.isArray(s.dials)||s.dials.length!==3||!s.dials.every((n:unknown)=>bounded(n,0,2)&&Number.isInteger(n)))return null;
  if(!Number.isInteger(s.checkpoint)||s.checkpoint< -1||s.checkpoint>2||(s.checkpoint>=0&&!s.beacons[s.checkpoint]))return null;
  if(typeof s.completed!=='boolean'||(s.completed&&!s.beacons.every(Boolean)))return null;
  return {...initialState(),x:s.x,z:s.z,y:height(s.x,s.z),health:s.health,stamina:s.stamina,shards:s.shards,berries:s.berries,collected:s.collected,pickedBerries:s.pickedBerries,defeated:s.defeated,beacons:s.beacons,dials:s.dials,checkpoint:s.checkpoint,completed:s.completed};
 }catch{return null;}
}
