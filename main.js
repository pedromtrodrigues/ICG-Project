import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'dat.gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Water } from 'three/examples/jsm/objects/Water.js';

let camera, scene, renderer;
let score = 0;
let controls;
let gaivotas;
const loadingManager = new THREE.LoadingManager();
const loader = new GLTFLoader(loadingManager);
const gold_positions = [];
let golds = []
const gold_count = 10
let dry_grasses = []

const progessBar = document.getElementById('progess-bar')
loadingManager.onProgress = function (url, loaded, total){
    progessBar.value = (loaded / total) * 100;
}
const progessBarContainer = document.querySelector('.progress-bar-container');
const textBar = document.querySelector('.follow-text');
loadingManager.onLoad = function(){
    progessBarContainer.style.display = 'none';
    textBar.style.display = 'flex';
}
var btn = document.getElementById("myBtn");
btn.addEventListener("click", createGolds);

const options = {
    angle: 0.2
};

class Gaivotas{
    constructor(){
        loader.load("assets/gaivotas/scene.gltf", (gltf) =>{
            scene.add(gltf.scene)
            gltf.scene.scale.set(150,150,150)
            gltf.scene.position.set(-1000,1000,-3500)
            this.gaivotas = gltf.scene
            this.gaiv = {
                rota: 0.03,
            }
        });
    }
    update() {
        if (this.gaivotas){
          var gaivota = this.gaivotas.getObjectByName('Dummy001');
          if (gaivota !== null){
            gaivota.rotation.y += this.gaiv.rota;
          }
        }
    }      
}

class Viking {
    constructor(){
        loader.load("assets/viking/scene.gltf", (gltf)=>{

        scene.add(gltf.scene);
        gltf.scene.scale.set(4,4,4);
        gltf.scene.position.set(0,-150,0);

        gltf.scene.traverse(function(object){
            if (object.isMesh) object.castShadow= true;
        })

        this.viking = gltf.scene

        this.speed ={
            vel: 0,
            rot: 0
        }
        });

        this.minX = -750;
        this.maxX = 4000;
        this.minZ = -3480; 
        this.maxZ = 3240;
    }
    stop(){
        this.speed.vel = 0
        this.speed.rot = 0
    }
    update(){
        if (this.viking){ 
            this.viking.rotation.y += this.speed.rot
            this.viking.translateZ( this.speed.vel)   

            if (this.viking.position.x < this.minX) {
                this.viking.position.x = this.minX;
            } else if (this.viking.position.x > this.maxX) {
                this.viking.position.x = this.maxX;
            }
            
            if (this.viking.position.z < this.minZ) {
                this.viking.position.z = this.minZ;
            } else if (this.viking.position.z > this.maxZ) {
                this.viking.position.z = this.maxZ;
            }
            
        }
    }
}

class Boat {
    constructor(){
        loader.load("assets/viking_ship/scene.gltf", (gltf) => {
            scene.add(gltf.scene)
            gltf.scene.scale.set(200,200,200)
            gltf.scene.position.set(-750,-150,-500)

            this.boat = gltf.scene
            this.speed ={
                vel: 0,
                rot: 0
            }
        })
    }

    stop(){
        this.speed.vel = 0
        this.speed.rot = 0
    }

    update(){
        if (this.boat){      
            this.boat.rotation.y += this.speed.rot
            this.boat.translateZ( this.speed.vel)
            
        }
    }
}

class Gold{
    constructor(_scene){
        scene.add(_scene);
        _scene.scale.set(30,30,30);
        _scene.position.set(random(-750,3500),-150,random(-3500,2800));

        this.gold = _scene
        }
        
}
class Grass{
    constructor(_scene){
        scene.add(_scene)
        _scene.scale.set(300,300,300)
        _scene.position.set(random(-750,3500), -140, random(-3500,2800));

        this.grass = _scene;
    }
}


async function loadModel(url){
    return new Promise((resolve, reject) => {
        loader.load(url, (gltf) =>{
            resolve(gltf.scene)
        })
    })
}

let grass_model = null
async function createGrass(){
    if (!grass_model){
        grass_model = await loadModel("assets/dry_grass/scene.gltf");
    }
    return new Grass(grass_model.clone())
}
let boat_model = null
async function createGold(){
    if (!boat_model){
        boat_model = await loadModel("assets/gold/scene.gltf")
    }
    return new Gold(boat_model.clone())
}

function random(min,max){
    return Math.random() * (max - min) + min;
}


function isColliding(obj1, obj2){
    return (
      Math.abs(obj1.position.x - obj2.position.x) < 300 &&
      Math.abs(obj1.position.z - obj2.position.z) < 300
    )
}

function checkCollisions(){
    if (viking.viking) {
        golds.forEach((gold, index) => {
          if (gold.gold) {
            if (isColliding(viking.viking, gold.gold)) {
              scene.remove(gold.gold);
              score += 10;
              golds.splice(index, 1); // Remove the gold from the golds array
            }
          }
        });
      } 
}


async function createGolds(){
    for(let i = 0; i < gold_count; i++){
        const gold = await createGold()
        golds.push(gold)
    } 
}


const boat = new Boat();
const viking =  new Viking();
init();
animate();

async function init() {
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer();
    renderer.shadowMap.enabled=true;
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    document.body.appendChild( renderer.domElement );
    renderer.setClearColor(0x87CEEB);

    camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 1, 20000 );
    camera.position.set(-5500, 5000, -4500); 
    controls = new OrbitControls( camera, renderer.domElement );
    //const axesHelper = new THREE.AxesHelper( 1000 );
    //scene.add( axesHelper );

    controls.target.set( 0, 10, 0 );
    controls.maxDistance = 20000.0;
    controls.maxPolarAngle = Math.PI / 3;
    controls.update();

    const ambientLight = new THREE.AmbientLight(0xBA944E);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xFFFFFF,0.8);
    scene.add(directionalLight);
    directionalLight.position.set(-1000,3000,-1500);
    directionalLight.castShadow = true;
    const d = 2000;
    directionalLight.shadow.camera.bottom = - (2*d);
    directionalLight.shadow.camera.top = (2*d);
    directionalLight.shadow.camera.left = - (2*d) ;
    directionalLight.shadow.camera.right = 2*d;
    directionalLight.shadow.camera.far = 20000;
    directionalLight.shadow.bias = -0.005;
    //const dLightHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
    //scene.add(dLightHelper);
    //const dLightHelp = new THREE.DirectionalLightHelper(directionalLight,200);
    //scene.add(dLightHelp);

    // sand
    const sand = new Animacoes("assets/sand/scene.gltf",[1250,100,500],[5500,0,600],[0,1.63,0]);
   
    // House and Shield 1
    const house_1 = new Animacoes("assets/viking_tent/scene.gltf",[150,150,150],[0,-150,1000],[0,1.5,0]);
    const shield1 =  new Animacoes("assets/vikings_shield_and_axe/scene.gltf", [200,200,200],[30,-80,900],[0,1,0]);

    // House and Shield 2
    const house_2 = new Animacoes("assets/viking_tent/scene.gltf",[150,150,150],[0,-150,2150],[0,2,0]);
    const shield2 =  new Animacoes("assets/vikings_shield_and_axe/scene.gltf", [200,200,200],[60,-40,2300],[0,2,0]);

    // Runic Stone
    const runic_stone = new Animacoes("assets/runes_stone/scene.gltf",[200,200,200], [3500,-310,2000], [0,-2,0]);

    // Camp Fire
    const camp_fire =  new Animacoes("assets/campfire_fbx/scene.gltf", [400,400,400],[1300,-120,1200],[0,0,0]);

    // Table
    const viking_table =  new Animacoes("assets/viking_table/scene.gltf", [2.5,2.5,2.5],[2500,-140,1300],[0,1,0]);

    // Chairs
    const viking_chair =  new Animacoes("assets/wooden_chair/scene.gltf", [300,300,300],[2350,-140,1400],[0,1,0]);
    const viking_chair1 =  new Animacoes("assets/wooden_chair/scene.gltf", [300,300,300],[2150,-140,1600],[0,2,0]);
    const viking_chair2 =  new Animacoes("assets/wooden_chair/scene.gltf", [300,300,300],[2600,-65,1750],[0,-2,-1.5]);

    // Sword Racks
    const sword_rack =  new Animacoes("assets/a_simple_sword_rack/scene.gltf", [280,280,280],[1200,-125,2400],[0,0,0]);
    const sword_rack1 =  new Animacoes("assets/a_simple_sword_rack/scene.gltf", [280,280,280],[1450,-125,2300],[0,0.5,0]);
    const sword_rack2 =  new Animacoes("assets/a_simple_sword_rack/scene.gltf", [280,280,280],[950,-125,2400],[0,-0.5,0]);
   
    // Manger
    const manger =  new Animacoes("assets/manger/scene.gltf", [300,120,120],[2150,-50,3000],[0,0,0]);

    // Horse
    const horse =  new Animacoes("assets/horse/scene.gltf", [150,150,150],[2150,20,520],[0,-1,0]);

    // Rocks 
    const rocks = new Animacoes("assets/rocks/scene.gltf",[0.3,0.3,0.3],[-750,-40,1800],[0,0,0]);
    const rocks1 = new Animacoes("assets/rocks/scene.gltf",[0.3,0.3,0.3],[-750,-40,1700],[0,-1,0]);
    const rocks2 = new Animacoes("assets/rocks/scene.gltf",[0.2,0.2,0.2],[900,-60,400],[0,0,0]);
    const rocks3 = new Animacoes("assets/rocks/scene.gltf",[0.2,0.2,0.2],[800,-60,400],[0,-1,0]); 

    // Trees
    const tree = new Animacoes("assets/pine_tree/scene.gltf",[5,5,5],[-750,-150,-1000],[0,0,0]);
    const tree1 = new Animacoes("assets/pine_tree/scene.gltf",[5,5,5],[0,-150,-3000],[0,0,0]);
    const tree2 = new Animacoes("assets/pine_tree/scene.gltf",[5,5,5],[600,-150,-1600],[0,0,0]);
    const tree3 = new Animacoes("assets/pine_tree/scene.gltf",[5,5,5],[1800,-150,-2500],[0,0,0]);
    const tree4 =  new Animacoes("assets/pine_tree/scene.gltf",[5,5,5],[2300,-150,-1000],[0,0,0]);
    const tree5 =  new Animacoes("assets/pine_tree/scene.gltf",[5,5,5],[3000,-150,-2000],[0,0,0]);
    const tree6 =  new Animacoes("assets/pine_tree/scene.gltf",[5,5,5],[3000,-140,1300],[0,0,0]);
    const tree7 =  new Animacoes("assets/pine_tree/scene.gltf",[5,5,5],[1200,-150,2800],[0,0,0]);
    
    //Wood Log
    const wood_log =  new Animacoes("assets/wood_logs/scene.gltf",[50,50,50],[3000,-140,520],[0,0,0]);    
        
    // Genereate 100 random dry grass
    for(let i = 0; i<100; i++){
        const dry_grass = await createGrass()
        dry_grasses.push(dry_grass)
    }
    
    // A e D para rodar o Barco
    // Seta para cima, Seta para baixo, Seta para a direita, Seta para esquerda para mexer o vikin
    window.addEventListener ('keydown', function(e){
        if (e.keyCode == 65){
            boat.speed.rot = 0.05;
        }
        if (e.keyCode == 68){
            boat.speed.rot = -0.05;
        }
        if (e.key == "ArrowUp"){
            viking.speed.vel = 20;
        }
        if (e.key == "ArrowDown"){
            viking.speed.vel = -20;
        }
        if (e.key == "ArrowLeft"){
            viking.speed.rot = 0.1;
        }
        if (e.key == "ArrowRight"){
            viking.speed.rot = -0.1;
            
        }

    })

    // Parar de mexer o viking
    window.addEventListener ('keyup', function(e){
        boat.stop()
        viking.stop();
    })

    // Generate random gold 
    createGolds();

    gaivotas =  new Gaivotas();
    animate();
}

function animate() {
    requestAnimationFrame( animate ); 
    render();
    if (gaivotas != undefined){
        gaivotas.update();
    }
    viking.update();   
    boat.update();
    document.getElementById("score").textContent = score;
    checkCollisions();
}

function render(){
    renderer.render( scene, camera );
}

function Animacoes(url,scale,position,rotation){
    loader.load(url, function(gltf){
        const model = gltf.scene;
        scene.add(model);
        model.scale.set(scale[0],scale[1],scale[2]);
        model.position.set(position[0],position[1],position[2]);
        model.rotation.x = rotation[0];
        model.rotation.y = rotation[1];
        model.rotation.z = rotation[2];
        model.castShadow = true;
        model.receiveShadow = true;

        model.traverse(function(node){
            if(node.isMesh)
                node.receiveShadow = true;
                node.castShadow = true;
            });
    });
}
