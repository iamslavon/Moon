var width, // window width
    height, // window height
    renderer,
    scene,
    camera,
    moon,
    light;

var settings = {
    camera: {
        angle: 45,
        far: 10000,
        position: {
            x: 0,
            y: 0,
            z: 1000
        }
    },
    shadowsEnabled: true,
    backgroundColor: 0x05060d,
    ambientLight: {
        enabled: true,
        color: 0xffffff,
        intensity: 0.15
    },
    lightHelpersEnabled: false
};

function onWindowResize() {
    updateSizes();
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
};

function updateSizes() {
    width = window.innerWidth;
    height = window.innerHeight;
};

function createPointLight() {
    light = new THREE.PointLight(0xffffff, 1.2, 10000);
    light.position.set(300, 300, 400);
    light.castShadow = true;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 10000;
    light.shadow.mapSize.width = width;
    light.shadow.mapSize.height = height;
    scene.add(light);

    if (settings.lightHelpersEnabled) {
        var lightHelper = new THREE.PointLightHelper(light, 30);
        scene.add(lightHelper);
    }
};

function createMoon() {
    var geometry = new THREE.SphereGeometry(200, 30, 30);
    var material = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        map: new THREE.TextureLoader().load("img/moon.jpg")
    });
    moon = new THREE.Mesh(geometry, material);
    scene.add(moon);
};

function animateMoon() {
    moon.rotation.y += 0.002;
};

function animateLight() {
    timestamp = Date.now() * 0.0001;
    light.position.x = Math.cos(timestamp * 5) * 1500;
    light.position.z = Math.sin(timestamp * 5) * 1500;
};

function createControls() {
    var controls = new THREE.OrbitControls(camera, renderer.domElement);
}

function init() {
    updateSizes();
    var canvas = document.getElementById("canvas");
    canvas.setAttribute("width", width);
    canvas.setAttribute("height", height);
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(settings.camera.angle, width / height, 0.1, settings.camera.far);
    camera.position.set(settings.camera.position.x, settings.camera.position.y, settings.camera.position.z);
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setClearColor(settings.backgroundColor);
    renderer.shadowMap.enabled = settings.shadowsEnabled;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    if (settings.ambientLight.enabled) {
        var ambientLight = new THREE.AmbientLight(settings.ambientLight.color, settings.ambientLight.intensity);
        scene.add(ambientLight);
    }

    //var gui = new dat.GUI();

    window.addEventListener('resize', onWindowResize, true);

    createControls();
    createMoon();
    createPointLight();
};

function animate() {
    requestAnimationFrame(animate);
    animateMoon();
    //animateLight();
    renderer.render(scene, camera);
};

window.onload = function () {
    init();
    animate();
}
