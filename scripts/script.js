'use strict';

const settings = {
    camera: {
        fov: 45,
        near: 0.1,
        far: 10000,
        position: { x: 0, y: 0, z: 1000 }
    },
    shadowsEnabled: true,
    backgroundColor: 0x05060d,
    ambientLight: {
        enabled: true,
        color: 0xffffff,
        intensity: 0.15
    },
    pointLight: {
        color: 0xffffff,
        intensity: 1.2,
        distance: 10000,
        position: { x: 300, y: 300, z: 400 }
    },
    moon: {
        radius: 200,
        widthSegments: 30,
        heightSegments: 30,
        rotationSpeed: 0.002,
        textureUrl: 'img/moon.jpg'
    },
    lightHelpersEnabled: false,
    animateLightEnabled: false
};

let width = window.innerWidth;
let height = window.innerHeight;
let renderer;
let scene;
let camera;
let controls;
let moon;
let light;

function updateSizes() {
    width = window.innerWidth;
    height = window.innerHeight;
}

function onWindowResize() {
    updateSizes();
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

function createCamera() {
    const { fov, near, far, position } = settings.camera;
    camera = new THREE.PerspectiveCamera(fov, width / height, near, far);
    camera.position.set(position.x, position.y, position.z);
}

function createRenderer(canvas) {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setClearColor(settings.backgroundColor);
    renderer.shadowMap.enabled = settings.shadowsEnabled;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(width, height);
}

function createAmbientLight() {
    if (!settings.ambientLight.enabled) {
        return;
    }
    const { color, intensity } = settings.ambientLight;
    scene.add(new THREE.AmbientLight(color, intensity));
}

function createPointLight() {
    const { color, intensity, distance, position } = settings.pointLight;
    light = new THREE.PointLight(color, intensity, distance);
    light.position.set(position.x, position.y, position.z);
    light.castShadow = true;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = settings.camera.far;
    light.shadow.mapSize.width = width;
    light.shadow.mapSize.height = height;
    scene.add(light);

    if (settings.lightHelpersEnabled) {
        scene.add(new THREE.PointLightHelper(light, 30));
    }
}

function createMoon() {
    const { radius, widthSegments, heightSegments, textureUrl } = settings.moon;
    const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    const material = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        map: new THREE.TextureLoader().load(textureUrl)
    });
    moon = new THREE.Mesh(geometry, material);
    scene.add(moon);
}

function createControls() {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
}

function animateMoon() {
    moon.rotation.y += settings.moon.rotationSpeed;
}

function animateLight() {
    const timestamp = Date.now() * 0.0001;
    light.position.x = Math.cos(timestamp * 5) * 1500;
    light.position.z = Math.sin(timestamp * 5) * 1500;
}

function init() {
    updateSizes();

    const canvas = document.getElementById('canvas');
    canvas.setAttribute('width', width);
    canvas.setAttribute('height', height);

    scene = new THREE.Scene();
    createCamera();
    createRenderer(canvas);
    createAmbientLight();
    createControls();
    createMoon();
    createPointLight();

    window.addEventListener('resize', onWindowResize);
}

function animate() {
    requestAnimationFrame(animate);
    animateMoon();
    if (settings.animateLightEnabled) {
        animateLight();
    }
    controls.update();
    renderer.render(scene, camera);
}

document.addEventListener('DOMContentLoaded', () => {
    init();
    animate();
});
