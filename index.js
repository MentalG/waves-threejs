import * as THREE from "three";
import gsap from "gsap";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";

// Initialize Dat GUI
const gui = new dat.GUI();
const world = {
  plane: {
    width: 1920,
    height: 1080,
    widthSegments: 50,
    heightSegments: 30
  }
};

const { width, height, widthSegments, heightSegments } = world.plane;

// Set GUI settings
const resizePlane = () => {
  planeMesh.geometry.dispose();
  planeMesh.geometry = new THREE.PlaneGeometry(
    width,
    height,
    widthSegments,
    heightSegments
  );

  const {
    array: planeGeometryPositionArray,
    count: planeGeometryAttributeLegth
  } = planeMesh.geometry.attributes.position;

  for (let i = 0; i < planeGeometryPositionArray.length; i += 3) {
    planeGeometryPositionArray[i + 2] = Math.random();
  }

  const colors = [];

  for (let i = 0; i < planeGeometryAttributeLegth; i++) {
    colors.push(0, 0.19, 0.4);
  }

  planeMesh.geometry.setAttribute(
    "color",
    new THREE.BufferAttribute(new Float32Array(colors), 3)
  );
};

gui.add(world.plane, "width", 1, 20).onChange(resizePlane);
gui.add(world.plane, "height", 1, 20).onChange(resizePlane);
gui.add(world.plane, "widthSegments", 1, 20).onChange(resizePlane);
gui.add(world.plane, "heightSegments", 1, 20).onChange(resizePlane);

// WebGL's preset
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
const raycaster = new THREE.Raycaster();

// Creating Box
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial = new THREE.MeshBasicMaterial({ color: 0x00cc00 });
const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);

// Creating Plane
const planeGeometry = new THREE.PlaneGeometry(
  width,
  height,
  widthSegments,
  heightSegments
);
const planeMaterial = new THREE.MeshPhongMaterial({
  side: THREE.DoubleSide,
  flatShading: THREE.FlatShading,
  vertexColors: true
});
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);

// Set Plane geometry
const {
  array: planeGeometryPositionArray,
  count: planeGeometryAttributeLegth
} = planeMesh.geometry.attributes.position;

const randomValues = [];

for (let i = 0; i < planeGeometryPositionArray.length; i++) {
  if (i % 3 === 0) {
    const x = planeGeometryPositionArray[i];
    const y = planeGeometryPositionArray[i + 1];
    const z = planeGeometryPositionArray[i + 2];
  
    planeGeometryPositionArray[i] = x + (Math.random() - 0.5) * 3;
    planeGeometryPositionArray[i + 1] = y + (Math.random() - 0.5) * 3;
    planeGeometryPositionArray[i + 2] = z + ((Math.random() - 0.5) * 3);
  }

  randomValues.push(Math.random() - 0.5);
}

planeMesh.geometry.attributes.position.originalPosition =
  planeGeometryPositionArray;
planeMesh.geometry.attributes.position.randomValues = randomValues;

// Set Plane colors
const colors = [];

for (let i = 0; i < planeGeometryAttributeLegth; i++) {
  colors.push(0, 0.19, 0.4);
}

planeMesh.geometry.setAttribute(
  "color",
  new THREE.BufferAttribute(new Float32Array(colors), 3)
);

// Creating Lights
const light = new THREE.DirectionalLight(0xffffff, 1);
const backLight = new THREE.DirectionalLight(0xffffff, 1);

// Set lights settings
light.position.set(0, -0.5, 1);
backLight.position.set(0, 0, -1);

// Set rendering settings
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);

// Append renderer to DOM element
document.body.appendChild(renderer.domElement);

// Adding Meshes to the scene
// scene.add(boxMesh);
scene.add(planeMesh);
scene.add(light);
scene.add(backLight);

// Creating Orbit Controls
// new OrbitControls(camera, renderer.domElement);

// Setting camera positon
camera.position.z = 600;

// Setiing mouse movement
const mouse = {
  x: undefined,
  y: undefined
};

// Recurstion animation funtion
let frame = 0;

const animate = () => {
  renderer.render(scene, camera);
  raycaster.setFromCamera(mouse, camera);
  frame += 0.01;

  const { array, originalPosition, randomValues } = planeMesh.geometry.attributes.position;

  for (let i = 0; i < array.length; i += 3) {
    array[i] = originalPosition[i] + Math.cos(frame + randomValues[i]) * 0.3;
    array[i+1] = originalPosition[i+1] + Math.sin(frame + randomValues[i+1]) * 0.3;
    array[i+2] = originalPosition[i+2] + Math.cos(frame + randomValues[i+2]) * 0.006;

    if (i === 0) {
      // console.log(Math.cos(frame));
    }
  }

  planeMesh.geometry.attributes.position.needsUpdate = true;

  const intersects = raycaster.intersectObject(planeMesh);

  if (intersects.length > 0) {
    const { a, b, c } = intersects[0].face;
    const { color } = intersects[0].object.geometry.attributes;

    const initialColor = {
      r: 0,
      g: 0.19,
      b: 0.4
    };

    const hoverColor = {
      r: 0.1,
      g: 0.5,
      b: 1
    };

    // vertice 1
    color.setX(a, 0.1);
    color.setY(a, 0.5);
    color.setZ(a, 1);

    // vertice 2
    color.setX(b, 0.1);
    color.setY(b, 0.5);
    color.setZ(b, 1);

    // vertice 3
    color.setX(c, 0.1);
    color.setY(c, 0.5);
    color.setZ(c, 1);

    color.needsUpdate = true;

    gsap.to(hoverColor, {
      r: initialColor.r,
      g: initialColor.g,
      b: initialColor.b,
      duration: 1,
      onUpdate: () => {
        color.setX(a, hoverColor.r);
        color.setY(a, hoverColor.g);
        color.setZ(a, hoverColor.b);

        // vertice 2
        color.setX(b, hoverColor.r);
        color.setY(b, hoverColor.g);
        color.setZ(b, hoverColor.b);

        // vertice 3
        color.setX(c, hoverColor.r);
        color.setY(c, hoverColor.g);
        color.setZ(c, hoverColor.b);

        color.needsUpdate = true;
      }
    });
  }

  requestAnimationFrame(animate);
};

// Set mouse position for threejs validation
addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / innerHeight) * 2 + 1;
});

animate();
