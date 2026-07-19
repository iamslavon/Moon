'use strict';

const settings = {
    camera: {
        fov: 45,
        near: 0.1,
        far: 10000,
        position: { x: 0, y: 300, z: 1000 }
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
    ground: {
        size: 4000,
        color: 0x1b1e29,
        y: -200
    },
    moon: {
        radius: 200,
        widthSegments: 30,
        heightSegments: 30,
        startHeight: 700,
        textureUrl: 'img/moon.jpg'
    },
    physics: {
        gravity: 900,
        acceleration: 700,
        maxSpeed: 450,
        friction: 550,
        maxDeltaTime: 0.1
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
let clock;
let moon;
let light;
let ground;

const velocity = new THREE.Vector3(0, 0, 0);
const cameraForward = new THREE.Vector3(0, 0, -1);
const cameraRight = new THREE.Vector3(1, 0, 0);

const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

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

function onKeyDown(event) {
    if (event.code in keys) {
        keys[event.code] = true;
        event.preventDefault();
    }
}

function onKeyUp(event) {
    if (event.code in keys) {
        keys[event.code] = false;
        event.preventDefault();
    }
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

function createGround() {
    const { size, color, y } = settings.ground;
    const geometry = new THREE.PlaneGeometry(size, size);
    const material = new THREE.MeshLambertMaterial({ color });
    ground = new THREE.Mesh(geometry, material);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = y;
    ground.receiveShadow = true;
    scene.add(ground);
}

function createMoon() {
    const { radius, widthSegments, heightSegments, startHeight, textureUrl } = settings.moon;
    const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    const material = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        map: new THREE.TextureLoader().load(textureUrl)
    });
    moon = new THREE.Mesh(geometry, material);
    moon.position.y = startHeight;
    moon.castShadow = true;
    scene.add(moon);
}

function createControls() {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableKeys = false;
}

function updateCameraAxes() {
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;

    if (forward.lengthSq() > 1e-6) {
        forward.normalize();
        cameraForward.copy(forward);
        cameraRight.crossVectors(cameraForward, camera.up).normalize();
    }
}

function updatePhysics(dt) {
    velocity.y -= settings.physics.gravity * dt;
    updateCameraAxes();

    const moveDir = new THREE.Vector3();
    if (keys.ArrowUp) {
        moveDir.add(cameraForward);
    }
    if (keys.ArrowDown) {
        moveDir.sub(cameraForward);
    }
    if (keys.ArrowRight) {
        moveDir.add(cameraRight);
    }
    if (keys.ArrowLeft) {
        moveDir.sub(cameraRight);
    }

    if (moveDir.lengthSq() > 0) {
        moveDir.normalize().multiplyScalar(settings.physics.acceleration * dt);
        velocity.x += moveDir.x;
        velocity.z += moveDir.z;

        const speed = Math.hypot(velocity.x, velocity.z);
        if (speed > settings.physics.maxSpeed) {
            const scale = settings.physics.maxSpeed / speed;
            velocity.x *= scale;
            velocity.z *= scale;
        }
    } else {
        const speed = Math.hypot(velocity.x, velocity.z);
        if (speed > 0) {
            const drop = Math.min(settings.physics.friction * dt, speed);
            const scale = (speed - drop) / speed;
            velocity.x *= scale;
            velocity.z *= scale;
        }
    }

    moon.position.x += velocity.x * dt;
    moon.position.y += velocity.y * dt;
    moon.position.z += velocity.z * dt;

    const groundLevel = settings.ground.y + settings.moon.radius;
    if (moon.position.y <= groundLevel) {
        moon.position.y = groundLevel;
        velocity.y = 0;
    }
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
    clock = new THREE.Clock();
    createCamera();
    createRenderer(canvas);
    createAmbientLight();
    createControls();
    createGround();
    createMoon();
    createPointLight();

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
}

function animate() {
    requestAnimationFrame(animate);

    const dt = Math.min(clock.getDelta(), settings.physics.maxDeltaTime);
    updatePhysics(dt);
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
