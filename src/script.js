import * as THREE from "three";
import { MeshSurfaceSampler } from "three";
import { GLTFLoader } from "three";
import Stats from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const canvas = document.querySelector("canvas.webgl");

// Textures
// plane texture
// Instantiate the texture loader.
const textureLoader = new THREE.TextureLoader();
const gridTexture = textureLoader.load('textures/grid.png');

const gutterTerrainDisplacement = textureLoader.load('textures/gutter_displacement.png');

// const metalnessNormalMap = textureLoader.load('textures/metalness.png');

// Scene
const scene = new THREE.Scene();

// Add some fog to the back of the scene
const fog = new THREE.Fog("#4205fa", 0, 1.5);
scene.fog = fog;


// Objects
/**
 * Here I use a Plane Geometry of width 1 and height 2
 * It's also subdivided into 24 square along the width and the height
 * which adds more vertices and edges to play with when we'll build our terrain
 */
const geometry = new THREE.PlaneGeometry(1, 2, 24, 24);
const material = new THREE.MeshStandardMaterial({
	color: 0xffffff,
	map: gridTexture,
	displacementMap: gutterTerrainDisplacement,
	displacementScale: 0.6,
});


const obstacleGeometry = new THREE.ConeGeometry(0.2, 0.26, 5 );
const coneMaterial = new THREE.MeshStandardMaterial({
	color: 0x00ffff,
	roughness: 0.25,
    map: gridTexture,
});

const cone = new THREE.Mesh(obstacleGeometry, coneMaterial);
cone.position.x = 0;
cone.position.y = 0.0;
cone.position.z = 0;

scene.add(cone);


const plane = new THREE.Mesh(geometry, material);
// Here we position our plane flat in front of the camera
plane.rotation.x = -Math.PI * 0.5;
plane.position.y = 0.0;
plane.position.z = 0.15;

// copy of the plane for infinity cycle:
const plane2 = new THREE.Mesh(geometry, material);
plane2.rotation.x = -Math.PI * 0.5;
plane2.position.y = 0.0;
plane2.position.z = -1.85; // 0.15 - 2 (the length of the first plane)


scene.add(plane);
// add the second copy to the scene
scene.add(plane2);

// Sizes
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

const ambientLight = new THREE.AmbientLight("#40cf8c", 10);
scene.add(ambientLight);

// Adds two spot lights
const spotlightLeft = new THREE.SpotLight('#2d9ffc', 80, 15, Math.PI * 0.1, 0.25);
spotlightLeft.position.set(0.5, 0.75, 2.2);
spotlightLeft.target.position.x = -1;
spotlightLeft.target.position.y = 0.25;
spotlightLeft.target.position.z = 0.25;
scene.add(spotlightLeft);
scene.add(spotlightLeft.target);

const spotlightRight = new THREE.SpotLight("#2dfc87", 90, 15, Math.PI * 0.1, 0.25);
spotlightRight.position.set(-0.5, 0.75, 2.2);
spotlightRight.target.position.x = 1;
spotlightRight.target.position.y = 0.25;
spotlightRight.target.position.z = 0.25;
scene.add(spotlightRight);
scene.add(spotlightRight.target);



// Camera
const camera = new THREE.PerspectiveCamera(
	// field of view
	75,
	// aspect ratio
	sizes.width / sizes.height,
	// near plane: it's low since we want our mesh to be visible even from very close
	0.01,
	// far plane: how far we're rendering
	20
);

// Position the camera a bit higher on the y axis and a bit further back from the center
camera.position.x = 0;
camera.position.y = 0.06;
camera.position.z = 1.1;

// Controls
// These are custom controls I like using for dev: we can drag/rotate the scene easily
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Renderer
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Event listener to handle screen resize
window.addEventListener("resize", () => {
	// Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera's aspect ratio and projection matrix
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	// Note: We set the pixel ratio of the renderer to at most 2
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const clock = new THREE.Clock();

// Animate: we call this tick function on every frame
const tick = () => {

    // get the time since the scene rendered from the clock
    const elapsedTime = clock.getElapsedTime();

	// Update controls
    controls.update();

    // infinity cycle:
    // copy the plane technique 
    // when the first plane reaches z = 2 we reset that plan to 0
    plane.position.z = (elapsedTime * 0.15) % 2
    cone.position.z = (elapsedTime * 0.15) % 2;

    plane2.position.z = ((elapsedTime * 0.15) % 2) - 2;

	// Update the rendered scene
	renderer.render(scene, camera);
    

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

// Calling tick will initiate the rendering of the scene
tick();
