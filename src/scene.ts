import * as THREE from 'three';
import { Game } from './game';
import { BEACONS, BERRIES, DIALS, HEART, SHARDS, SCENERY, height } from './world';
const palette={grass:0x89996b,stone:0x535d63,amber:0xffd88b,teal:0x89d6df};
export class WorldView {
 readonly renderer:THREE.WebGLRenderer;readonly scene=new THREE.Scene();readonly camera=new THREE.PerspectiveCamera(53,1,.1,700);
 private player=new THREE.Group();private cloak:THREE.Mesh;private glider=new THREE.Group();private sword:THREE.Mesh;
 private shards:THREE.Mesh[]=[];private berries:THREE.Group[]=[];private beacons:THREE.Group[]=[];private beams:THREE.Mesh[]=[];private dials:THREE.Group[]=[];
 private enemies:THREE.Group[]=[];private rings:THREE.Mesh[]=[];private time=0;private motes:THREE.Points;private orbit=0;private pitch=.23;private initialized=false;
 constructor(private game:Game,container:HTMLElement){
  this.renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.02;
  container.appendChild(this.renderer.domElement);this.scene.background=new THREE.Color(0xc1d8dd);this.scene.fog=new THREE.FogExp2(0xc1d8dd,.0045);
  this.scene.add(new THREE.HemisphereLight(0xf4e6ce,0x596d68,2));
  const sun=new THREE.DirectionalLight(0xffddab,2.7);sun.position.set(-60,90,35);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-125,right:125,top:125,bottom:-125,near:1,far:230});sun.shadow.bias=-.0004;this.scene.add(sun);
  const terrain=new THREE.PlaneGeometry(240,240,140,140);terrain.rotateX(-Math.PI/2);const pos=terrain.attributes.position;const colors=[];
  for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i),y=height(x,z);pos.setY(i,y);const c=new THREE.Color(y>14?0x8e9690:x>36&&z<20?0xa5a18a:palette.grass);c.multiplyScalar(.89+.13*Math.sin(x*1.3+z*.9));colors.push(c.r,c.g,c.b);}
  terrain.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));terrain.computeVertexNormals();const ground=new THREE.Mesh(terrain,new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:1}));ground.receiveShadow=true;this.scene.add(ground);
  let seed=9123;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(const p of SCENERY){const {x,z}=p;
   if(p.kind==='tree'){const tree=new THREE.Group();const trunk=this.mesh(new THREE.CylinderGeometry(.22,.5,4,5),0x6d6050);trunk.position.y=2;tree.add(trunk);const foliage=this.mesh(new THREE.ConeGeometry(2.8,7,6),p.tint<.5?0x416d63:0x71816b);foliage.position.y=6;tree.add(foliage);tree.position.set(x,height(x,z),z);tree.scale.setScalar(p.scale);this.scene.add(tree);}
   else {const rock=this.mesh(new THREE.DodecahedronGeometry(1.3),0x9ba69d);rock.position.set(x,height(x,z)+.6,z);rock.scale.set(p.scale,.6*p.scale,p.scale);rock.rotation.y=p.tint*6;this.scene.add(rock);}
  }
  const grassGeometry=new THREE.ConeGeometry(.18,.9,3);const grassMaterial=new THREE.MeshStandardMaterial({color:0x899867,flatShading:true});const grass=new THREE.InstancedMesh(grassGeometry,grassMaterial,1100);const transform=new THREE.Object3D();
  for(let i=0;i<1100;i++){const x=(random()-.5)*214,z=(random()-.5)*214;transform.position.set(x,height(x,z)+.25,z);transform.rotation.set(.1,random()*6,.15);transform.scale.set(1,.5+random(),1);transform.updateMatrix();grass.setMatrixAt(i,transform.matrix);}this.scene.add(grass);
  for(let i=0;i<25;i++){const a=i/25*Math.PI*2;const mountain=this.mesh(new THREE.ConeGeometry(35+random()*22,35+random()*50,5),i%2?0x8599a0:0x9dabab);mountain.position.set(Math.sin(a)*190,5,Math.cos(a)*190);this.scene.add(mountain);}
  // Amber trail stones connect the arrival to the meadow; three routes fork at the valley.
  for(const target of [BEACONS[0],BEACONS[1],BEACONS[2],HEART])for(let i=0;i<22;i++){const t=i/22,x=target.x*t,z=72+(target.z-72)*t;const pebble=this.mesh(new THREE.DodecahedronGeometry(.35),0xd6c0a0);pebble.position.set(x,height(x,z)+.12,z);pebble.scale.y=.4;this.scene.add(pebble);}
  const lake=this.mesh(new THREE.CircleGeometry(11,48),0x689eab);lake.rotation.x=-Math.PI/2;lake.position.set(34,height(34,48)+.18,48);lake.scale.set(1,.6,1);this.scene.add(lake);
  this.addRuins();
  SHARDS.forEach(p=>{const shard=this.mesh(new THREE.OctahedronGeometry(.65),palette.teal,true);shard.position.set(p.x,height(p.x,p.z)+1,p.z);this.scene.add(shard);this.shards.push(shard);const base=this.mesh(new THREE.DodecahedronGeometry(.8),0x767e70);base.position.set(p.x,height(p.x,p.z)+.3,p.z);base.scale.y=.4;this.scene.add(base);});
  BERRIES.forEach(p=>{const bush=new THREE.Group();const leaves=this.mesh(new THREE.IcosahedronGeometry(1.2),0x566d54);leaves.position.y=.6;bush.add(leaves);for(let i=0;i<4;i++){const berry=this.mesh(new THREE.SphereGeometry(.22,6,5),0xee967e);berry.position.set(Math.sin(i*2)*.7,1,Math.cos(i*2)*.7);bush.add(berry);}bush.position.set(p.x,height(p.x,p.z),p.z);this.scene.add(bush);this.berries.push(bush);});
  const body=this.mesh(new THREE.CylinderGeometry(.55,.7,1.35,7),0x435c66);body.position.y=1.2;this.player.add(body);
  this.cloak=this.mesh(new THREE.ConeGeometry(.9,1.4,7),0xcb765a);this.cloak.position.y=1.5;this.player.add(this.cloak);
  const head=this.mesh(new THREE.SphereGeometry(.4,8,6),0xe9bb91);head.position.y=2.35;this.player.add(head);
  const hat=this.mesh(new THREE.CylinderGeometry(.75,.75,.13,8),0xe3d1a0);hat.position.y=2.63;this.player.add(hat);
  const pack=this.mesh(new THREE.BoxGeometry(.65,.85,.35),0xa7a287);pack.position.set(0,1.5,-.65);this.player.add(pack);
  for(const x of [-.3,.3]){const boot=this.mesh(new THREE.BoxGeometry(.3,.7,.4),0x4b5357);boot.position.set(x,.35,0);this.player.add(boot);}
  this.sword=this.mesh(new THREE.BoxGeometry(.12,1.7,.18),0xe0e0cc);this.sword.position.set(.9,1.25,.3);this.sword.rotation.z=-.3;this.player.add(this.sword);
  const wing=this.mesh(new THREE.ConeGeometry(2.8,.45,4),0xe0b879);wing.scale.set(1,1,.65);wing.rotation.y=Math.PI/4;wing.position.y=3.4;this.glider.add(wing);
  for(const x of [-1,1]){const rope=this.mesh(new THREE.CylinderGeometry(.025,.025,1.7,4),0x4f5756);rope.position.set(x,2.65,0);rope.rotation.z=x*.35;this.glider.add(rope);}this.player.add(this.glider);this.scene.add(this.player);
  game.enemies.forEach(()=>{const enemy=new THREE.Group();const body=this.mesh(new THREE.DodecahedronGeometry(1.2),0x6d7479);body.position.y=1.4;body.scale.y=1.2;enemy.add(body);const eye=this.mesh(new THREE.BoxGeometry(.9,.18,.22),0xff9d7e,true);eye.position.set(0,1.7,.95);enemy.add(eye);for(const x of [-.7,.7]){const foot=this.mesh(new THREE.BoxGeometry(.55,.7,.7),0x535e65);foot.position.set(x,.35,0);enemy.add(foot);}const ring=new THREE.Mesh(new THREE.RingGeometry(2.9,3.2,40),new THREE.MeshBasicMaterial({color:0xff754a,transparent:true,opacity:.7,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.15;enemy.add(ring);this.rings.push(ring);this.scene.add(enemy);this.enemies.push(enemy);});
  const moteGeo=new THREE.BufferGeometry();const points=[];for(let i=0;i<100;i++)points.push((random()-.5)*200,3+random()*28,(random()-.5)*200);moteGeo.setAttribute('position',new THREE.Float32BufferAttribute(points,3));this.motes=new THREE.Points(moteGeo,new THREE.PointsMaterial({color:0xffefc4,size:.17,transparent:true,opacity:.7}));this.scene.add(this.motes);
  this.resize();window.addEventListener('resize',()=>this.resize());
 }
 private mesh(geometry:THREE.BufferGeometry,color:number,glow=false){const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color,flatShading:true,roughness:.85,emissive:glow?color:0,emissiveIntensity:glow?.6:0}));mesh.castShadow=true;mesh.receiveShadow=true;return mesh;}
 private text(text:string,width=12){const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=128;const ctx=canvas.getContext('2d')!;ctx.fillStyle='rgba(20,43,49,.75)';ctx.roundRect(8,8,1008,112,20);ctx.fill();ctx.fillStyle='#f7e9cb';ctx.textAlign='center';ctx.font='600 40px Georgia';ctx.fillText(text,512,80);const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(canvas),depthTest:false}));sprite.scale.set(width,width/8,1);return sprite;}
 private addRuins(){
  BEACONS.forEach((p,i)=>{const group=new THREE.Group();const base=this.mesh(new THREE.CylinderGeometry(3.8,4.5,.7,8),0xa1a898);base.position.y=.2;group.add(base);const pillar=this.mesh(new THREE.CylinderGeometry(.85,1.3,6,6),palette.stone);pillar.position.y=3;group.add(pillar);const crystal=this.mesh(new THREE.OctahedronGeometry(1.5),p.color,true);crystal.position.y=7;group.add(crystal);const beam=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,90,12),new THREE.MeshBasicMaterial({color:p.color,transparent:true,opacity:.2,depthWrite:false}));beam.position.y=49;group.add(beam);this.beams.push(beam);const label=this.text(p.name.toUpperCase(),15);label.position.y=10;group.add(label);group.position.set(p.x,height(p.x,p.z),p.z);this.scene.add(group);this.beacons.push(group);
   for(let j=0;j<5;j++){const angle=j/5*Math.PI*2;const ruin=this.mesh(new THREE.BoxGeometry(1.5,2+j%2*2,1.5),0x848f89);const x=p.x+Math.cos(angle)*9,z=p.z+Math.sin(angle)*9;ruin.position.set(x,height(x,z)+(2+j%2*2)/2,z);this.scene.add(ruin);}
   if(i===1){const clue=this.text('SUN  ·  MOON  ·  STAR',15);clue.position.set(p.x,height(p.x,p.z)+4,p.z+9);this.scene.add(clue);}
  });
  DIALS.forEach(p=>{const group=new THREE.Group();const base=this.mesh(new THREE.CylinderGeometry(1.2,1.4,1.5,8),0x647475);base.position.y=.75;group.add(base);const rune=this.text('STAR',4);rune.position.y=2.5;group.add(rune);const ring=this.mesh(new THREE.TorusGeometry(.95,.15,5,12),palette.teal,true);ring.rotation.x=Math.PI/2;ring.position.y=1.6;group.add(ring);group.position.set(p.x,height(p.x,p.z),p.z);this.scene.add(group);this.dials.push(group);});
  const spire=new THREE.Group();const base=this.mesh(new THREE.CylinderGeometry(4.2,5.5,2,8),0x818e8a);base.position.y=1;spire.add(base);const needle=this.mesh(new THREE.ConeGeometry(2.6,16,5),0x536c72);needle.position.y=9;spire.add(needle);const halo=this.mesh(new THREE.TorusGeometry(4,.18,6,40),palette.amber,true);halo.position.y=13;halo.rotation.x=Math.PI/2;spire.add(halo);const label=this.text('THE HEARTSPIRE',17);label.position.y=18;spire.add(label);spire.position.set(HEART.x,height(HEART.x,HEART.z),HEART.z);this.scene.add(spire);
  for(let i=0;i<2;i++){const post=this.mesh(new THREE.BoxGeometry(1.8,8,2),0x798c86);post.position.set(HEART.x+(i?7:-7),height(HEART.x,HEART.z)+4,HEART.z+9);this.scene.add(post);}const arch=this.mesh(new THREE.BoxGeometry(16,1.3,2),0x798c86);arch.position.set(HEART.x,height(HEART.x,HEART.z)+8,HEART.z+9);this.scene.add(arch);
 }
 turn(dx:number,dy:number){this.orbit-=dx*.006;this.pitch=THREE.MathUtils.clamp(this.pitch+dy*.004,.22,.92);}
 get yaw(){return this.orbit;}
 resize(){const w=window.innerWidth,h=window.innerHeight;this.renderer.setSize(w,h);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();}
 render(dt:number,moving:boolean){
  this.time+=dt;const s=this.game.state;this.player.position.set(s.x,s.y,s.z);this.player.rotation.y=s.facing;this.glider.visible=this.game.gliding;
  this.cloak.rotation.z=moving?Math.sin(this.time*12)*.06:0;this.sword.rotation.x=this.game.attackTime>0?-2+this.game.attackTime*6:0;this.player.visible=this.game.invulnerable===0||Math.sin(this.time*30)>-.4;
  this.shards.forEach((m,i)=>{m.visible=!s.collected.includes(i);m.rotation.y=this.time*.8;m.position.y=height(SHARDS[i].x,SHARDS[i].z)+1+Math.sin(this.time*2+i)*.2;});
  this.berries.forEach((g,i)=>{for(let j=1;j<g.children.length;j++)g.children[j].visible=!s.pickedBerries.includes(i);});
  this.beams.forEach((m,i)=>{(m.material as THREE.MeshBasicMaterial).opacity=s.beacons[i]?.48:.08;this.beacons[i].children[2].rotation.y=this.time*.3;});
  this.dials.forEach((g,i)=>{const old=(g.children[1] as THREE.Sprite);const value=['SUN','MOON','STAR'][s.dials[i]];if(old.userData.value!==value){const replacement=this.text(value,4);replacement.position.y=2.5;replacement.userData.value=value;g.remove(old);(old.material.map)?.dispose();old.material.dispose();g.add(replacement); // keep rune in slot 1
    const ring=g.children[1];g.children[1]=replacement;g.children[2]=ring;
   }});
  this.enemies.forEach((g,i)=>{const e=this.game.enemies[i];g.visible=!s.defeated.includes(i);g.position.set(e.x,height(e.x,e.z),e.z);g.rotation.y=Math.atan2(s.x-e.x,s.z-e.z);this.rings[i].visible=e.phase==='warning'||e.phase==='strike';this.rings[i].scale.setScalar(e.phase==='warning'?1+(1-e.timer)*.25:1.3);g.children[0].rotation.z=e.phase==='warning'?Math.sin(this.time*25)*.08:0;});
  this.motes.rotation.y=this.time*.009;
  const target=new THREE.Vector3(s.x,s.y+2,s.z);const distance=window.innerWidth<700?22:22;
  const desired=new THREE.Vector3(s.x+Math.sin(this.orbit)*distance*Math.cos(this.pitch),s.y+distance*Math.sin(this.pitch)+3,s.z+Math.cos(this.orbit)*distance*Math.cos(this.pitch));desired.y=Math.max(desired.y,height(desired.x,desired.z)+3);
  if(!this.initialized){this.camera.position.copy(desired);this.initialized=true;}else this.camera.position.lerp(desired,1-Math.exp(-dt*8));this.camera.lookAt(target);this.renderer.render(this.scene,this.camera);
 }
}
