"use strict"
import * as THREE from '../three.js-master/build/three.module.js';
import { OrbitControls } from '../three.js-master/examples/jsm/controls/OrbitControls.js';
import { GUI } from '../three.js-master/examples/jsm/libs/dat.gui.module.js';

import { parse_grid, parse_file_name, parse_poses } from '../js/parse-module.js';
import * as CUSTOM_PAD from '../js/custom_module.js';
import * as STORED_SHAPE_PAD from '../js/stored_shape_module.js';
import { stored_para } from "../js/shape_para.js";
import * as GLB_LOAD from "../js/import_glb_mods.js";
import { generateGrid } from "../js/canvas_grid_genration.js"

// ======================parameter===============================
// config
let agent_types = ["cube", "sphere", "slime", "man", "puppy"];
let agent_id = 1;
let fp_mov = 80;
let pause_frame = 60;
let per_mov = 1 / fp_mov;
let bounce_height = [];
let mov_para = {
    frame: 0,
    dirX: 0,
    dirY: 0,
    step: 0
};
let sphere_r = 0.45;
let ori_height = 0.5;
let outline_h = 1;

let mod_file = {
    "slime": "../glb/Slime.glb",
    "man": "../glb/Worker_Male.glb",
    "puppy": "../glb/Pug.glb",
}
let scale_config = {
    "slime": 0.3,
    "man": 0.5,
    "puppy": 0.27,
}
let init_rotation = {
    "slime": {
        x: Math.PI / 2,
        y: Math.PI * 3 / 2
    },
    "man": {
        x: Math.PI / 2,
        y: Math.PI * 2
    },
    "puppy": {
        x: Math.PI / 2,
        y: 2 * Math.PI
    },
}
let animation_idx = {
    "slime": 0,
    "man": 9,
    "puppy": 1,
}
function dirX2rotation(x, y) {
    if (x === 0 && y === 0) {
        throw ("the object shouldn't move");
    }
    let agent_name = agent_types[agent_id];
    if (x === 1 && y === 0) return init_rotation[agent_name].y - Math.PI * 3 / 2;
    if (x === 1 && y === 1) return Math.PI / 4 + init_rotation[agent_name].y - Math.PI * 3 / 2;
    if (x === 1 && y === -1) return 7 * Math.PI / 4 + init_rotation[agent_name].y - Math.PI * 3 / 2;
    if (x === 0 && y === 1) return Math.PI / 2 + init_rotation[agent_name].y - Math.PI * 3 / 2;
    if (x === 0 && y === -1) return 3 * Math.PI / 2 + init_rotation[agent_name].y - Math.PI * 3 / 2;
    if (x === -1 && y === 0) return Math.PI + init_rotation[agent_name].y - Math.PI * 3 / 2;
    if (x === -1 && y === 1) return 3 * Math.PI / 4 + init_rotation[agent_name].y - Math.PI * 3 / 2;
    if (x === -1 && y === -1) return 5 * Math.PI / 4 + init_rotation[agent_name].y - Math.PI * 3 / 2;
}

let custom_shape_id = 10;

// shape parameter
let shape_config = {
    grid_w: null,
    grid_h: null,
    shape_num: null,
    agent_num: null,
    file_path: '../data/grid_3_60.txt',
    pose_path: '../data/poses_3_60.txt'
}

let params = {
    speed: 13 - fp_mov / 10,
    agent_type: agent_types[agent_id],
    show_grid: {
        get ShowGrid() {
            return grid.material.visible;
        },
        set ShowGrid(v) {
            grid.material.visible = v;
        }
    },
    custom_pad: CUSTOM_PAD.popup_custom_pad,
    image_upload_pad: CUSTOM_PAD.show_image_upload_popup,
    stored_shape_pad: STORED_SHAPE_PAD.popup_stored_shape,
}

// global
let scene = new THREE.Scene();
let renderer = new THREE.WebGLRenderer();
let controls = null;
let grid = null;
let plane = null;
let camera = null;

let agents_num = 0;
let total_step = 0; // steps of iteration
let horizon_line = [], vertical_line = [];

let objects = [];
let shadows = [];
let groups = [];
let walls = [];

let poses_data = [];// poses_data[i][2*r]:x of agent r in i-th step

// 3d场景离页面边缘距离
let window_margin = 50;

let done = false;
// ================================================================

// ========================main====================================
window.addEventListener("load", function () {
    CUSTOM_PAD.init_custom_pad();
});
// load data
let { grid_w, grid_h, content: grid_data, shape_num, a_num } = parse_grid(shape_config.file_path);
init_shape_data();
let { len, res } = parse_poses(shape_config.pose_path);
total_step = len;
poses_data = res;
// load shadow texture & create shadow geometry and material
const loader = new THREE.TextureLoader();
const shadowTexture = loader.load('./img/roundshadow.png'); // load the fake shadow texture
const planeSize = 1;
const shadowGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);

STORED_SHAPE_PAD.init_stored_shape();
let web_worker = create_web_worker();
web_worker.postMessage({ MessagePurpose: "SetUp" });
init();
reset_shape();
done = true;
create_GUI();
// =================================================================
function init_shape_data() {
    shape_config.grid_w = grid_w, shape_config.grid_h = grid_h;
    shape_config.shape_num = shape_num;
    shape_config.agent_num = a_num;
}

// 创建web worker
function create_web_worker() {
    let web_worker = new Worker("../js/webWorker.js", { name: "mainWorker" });
    web_worker.onerror = function (evt) { console.log(`Error from Web Worker: ${evt.message}`); }
    web_worker.onmessage = web_worker_receive_msg;
    return web_worker;
}

// web worker消息处理
function web_worker_receive_msg(evt) {
    let obj = evt.data;
    if (obj.cmd === "ready") { // main logic
        console.log("ready!")
        // web_worker.postMessage({ MessagePurpose: "getAgentNum", width: grid_w, height: grid_h });
        // web_worker.postMessage({
        //     MessagePurpose: "getPoseData", width: shape_config.grid_w, height: shape_config.grid_h, shape_num: shape_config.shape_num,
        //     agent_num: shape_config.agent_num, grid_data: grid_data
        // });
    } else if (obj.cmd === "poseData") {
        poses_data.push(obj.data);
        total_step = poses_data.length;
        if (obj.step === 1) {
            reset_shape();
        }
    } else if (obj.cmd === "done") {
        done = true;
    }
}

// create config pad
function create_GUI() {
    let gui = new GUI({ autoPlace: false });
    // 动画渲染参数设置
    let animation = gui.addFolder("Animation");
    // 自定义形状设置
    let custom_folder = gui.addFolder("Custom Shape Setting");
    document.getElementById("GUI").appendChild(gui.domElement);
    animation.add(params, "speed", 1, 10, 1).name('Speed');
    animation.add(params, "agent_type").name('Agent type').options(agent_types);
    animation.add(params.show_grid, "ShowGrid").name('Show Grid');
    custom_folder.add(params, 'custom_pad').name('Draw a shape');
    custom_folder.add(params, 'image_upload_pad').name('Upload a pic')
    gui.add(params, "stored_shape_pad").name("Select a shape");
}

// compute the shape of pattern to draw the outline
function outline_grid() {
    // 清除旧数据，保证可复用性
    // for (let obj of horizon_line)
    //     scene.remove(obj);
    // for (let obj of vertical_line)
    //     scene.remove(obj);
    horizon_line.length = 0, vertical_line.length = 0;

    let last_up = -1, last_down = -1, start_node = -1, cur_node = -1, cur_up = -1, cur_down = -1;
    for (let i = 1; i < shape_config.grid_h; i++) {
        for (let j = 0; j < shape_config.grid_w; j++) {
            cur_up = grid_data[i - 1][j], cur_down = grid_data[i][j];
            if (cur_up === last_up && cur_down === last_down) {
                cur_node = j + 1;
                continue;
            }
            if (last_up !== last_down)
                horizon_line.push([i, start_node, cur_node]);
            if (cur_up !== cur_down) {
                start_node = j;
                cur_node = j + 1;
            }
            last_up = cur_up, last_down = cur_down;
        }
        last_up = -1, last_down = -1, start_node = -1, cur_node = -1;
    }
    for (let i = 1; i < shape_config.grid_w; i++) {
        for (let j = 0; j < shape_config.grid_h; j++) {
            cur_up = grid_data[j][i - 1], cur_down = grid_data[j][i];
            if (cur_up === last_up && cur_down === last_down) {
                cur_node = j + 1;
                continue;
            }
            if (last_up !== last_down)
                vertical_line.push([i, start_node, cur_node]);
            if (cur_up !== cur_down) {
                start_node = j;
                cur_node = j + 1;
            }
            last_up = cur_up, last_down = cur_down;
        }
        last_up = -1, last_down = -1, start_node = -1, cur_node = -1;
    }
    console.log(vertical_line)
}

// add the outline to the scene
function build_outline_wall() {
    // 清除之前渲染的墙壁
    for (let obj of walls)
        scene.remove(obj);
    walls.length = 0;

    let vShader = `
        varying vec2 vUv;

        void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }
    `;
    let fShaderY = `
        uniform vec3 color1;
        uniform vec3 color2;
        varying vec2 vUv;
        void main() {
        gl_FragColor = vec4(color1,1.0-vUv.y);
        }
    `;
    let fShaderX = `
        uniform vec3 color1;
        uniform vec3 color2;
        varying vec2 vUv;
        void main() {
        gl_FragColor = vec4(color1,vUv.x);
        }
    `;
    let materialY = new THREE.ShaderMaterial({
        uniforms: {
            color1: {
                value: new THREE.Color(0x2B2D42)
            },
            color2: {
                value: new THREE.Color("purple")
            }
        },
        vertexShader: vShader,
        fragmentShader: fShaderY,
        transparent: true,
        side: THREE.DoubleSide
    });
    for (let line of horizon_line) {
        let row = shape_config.grid_h / 2 - line[0], start_node = line[1] - shape_config.grid_w / 2, end_node = line[2] - shape_config.grid_w / 2;
        let geometry = new THREE.PlaneGeometry(end_node - start_node, outline_h);
        let mesh = new THREE.Mesh(geometry, materialY);
        mesh.position.x = (start_node + end_node) / 2;
        mesh.position.y = row;
        mesh.position.z = outline_h / 2;
        mesh.rotateX(Math.PI / 2);
        walls.push(mesh);
        scene.add(mesh);
    }
    let materialX = new THREE.ShaderMaterial({
        uniforms: {
            color1: {
                value: new THREE.Color(0x669999)
            },
            color2: {
                value: new THREE.Color("purple")
            }
        },
        vertexShader: vShader,
        fragmentShader: fShaderX,
        transparent: true,
        side: THREE.DoubleSide
    });
    for (let line of vertical_line) {
        let col = line[0] - shape_config.grid_w / 2, end_node = shape_config.grid_h / 2 - line[1], start_node = shape_config.grid_h / 2 - line[2];
        let geometry = new THREE.PlaneGeometry(outline_h, end_node - start_node);
        let mesh = new THREE.Mesh(geometry, materialX);
        mesh.position.y = (start_node + end_node) / 2;
        mesh.position.x = col;
        mesh.position.z = outline_h / 2;
        mesh.rotateY(Math.PI / 2);
        walls.push(mesh);
        scene.add(mesh);
    }
}

//==================agent generation=========================
function cube_generate() {
    // a cube
    let material = new THREE.MeshPhongMaterial({
        color: 0x7C3C3C, polygonOffset: true,
        polygonOffsetFactor: 0.1,
        polygonOffsetUnits: 2,
        shininess: 5,
        specular: 0xdb504b
    });
    for (let i = 0; i < shape_config.agent_num; i++) {
        let geometry = new THREE.BoxGeometry(0.9, 0.9, 1);
        let cube = new THREE.Mesh(geometry, material);
        let x = poses_data[0][2 * i], y = poses_data[0][2 * i + 1];
        cube.position.y = y - shape_config.grid_h / 2 + 0.5;
        cube.position.x = x - shape_config.grid_w / 2 + 0.5;
        cube.position.z = 0.5;
        scene.add(cube);
        objects.push(cube);
    }

    // 参数重置
    mov_para.step = 0;
    mov_para.dirX = 0;
    mov_para.dirY = 0;
    mov_para.frame = 0;
}

function sphere_generate() {
    let material = new THREE.MeshPhongMaterial({
        color: 0x7C3C3C, polygonOffset: true,
        polygonOffsetFactor: 0.1,
        polygonOffsetUnits: 2,
    });

    for (let i = 0; i < shape_config.agent_num; i++) {
        // create group for the integrity of sphere and shadow
        let base = new THREE.Object3D(); // sphere & shadow
        scene.add(base);

        // create shpere
        let geometry = new THREE.SphereBufferGeometry(sphere_r, 32, 32);
        let sphere = new THREE.Mesh(geometry, material);
        let x = poses_data[0][2 * i], y = poses_data[0][2 * i + 1];
        sphere.position.z = sphere_r;
        base.add(sphere);

        // material for shadow
        let shadowMat = new THREE.MeshBasicMaterial({
            map: shadowTexture,
            transparent: true,
            depthWrite: false,
        });

        // create shadow
        let shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
        shadowMesh.position.z = 0.001;  // so we're above the ground slightly
        const shadowSize = sphere_r * 4;
        shadowMesh.scale.set(shadowSize, shadowSize, shadowSize);
        base.add(shadowMesh);

        // set the location of the integrity
        base.position.y = y - shape_config.grid_h / 2 + 0.5;
        base.position.x = x - shape_config.grid_w / 2 + 0.5;

        // remember the integrity of sphere and shadow
        groups.push(base);
        shadows.push(shadowMesh);
        objects.push(sphere);
    }

    // 参数重置
    mov_para.step = 0;
    mov_para.dirX = 0;
    mov_para.dirY = 0;
    mov_para.frame = 0;
}

function model_generate() {
    let mod_name = agent_types[agent_id];
    for (let i = 0; i < shape_config.agent_num; i++) {
        let position = {
            x: poses_data[0][2 * i] - shape_config.grid_w / 2 + 0.5,
            y: poses_data[0][2 * i + 1] - shape_config.grid_h / 2 + 0.5,
            z: 0.01
        }
        GLB_LOAD.load_glb(i, mod_file[mod_name], scene, position, scale_config[mod_name], init_rotation[mod_name], animation_idx[mod_name]);
    }

    // 参数重置
    mov_para.step = 0;
    mov_para.dirX = 0;
    mov_para.dirY = 0;
    mov_para.frame = 0;
}
//===============================================================
function init() {
    // load data
    // total_step = (pose_line - 1) / 2;
    // console.assert(typeof total_step === 'number' && total_step % 1 === 0);

    // highlight the outline
    outline_grid();
    build_outline_wall();

    scene.background = new THREE.Color(0xe0e0e0);
    camera = new THREE.PerspectiveCamera(75, (window.innerWidth - 2 * window_margin) / (window.innerHeight - 2 * window_margin), 0.1, 1000);

    console.log(window.innerHeight - 2 * window_margin, window.innerWidth - 2 * window_margin);
    renderer.setSize(window.innerWidth - 2 * window_margin, window.innerHeight - 2 * window_margin);
    renderer.sortObjects = false;
    document.getElementById("threeJS").appendChild(renderer.domElement);

    // viewpoint controller
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.5, 0);
    controls.update();
    controls.enablePan = false;
    controls.enableDamping = true;

    // light
    {
        const skyColor = 0xB1E1FF;  // light blue
        const groundColor = 0xB97A20;  // brownish orange
        const intensity = 2;
        const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
        scene.add(light);
    }

    {
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(0, 0, 10);
        light.target.position.set(-3, 0, 0);
        scene.add(light);
        scene.add(light.target);
    }

    // grid
    create_grid();

    // create agents
    sphere_generate();

    // a plane to show the grid pattern
    create_plane();

    // axis
    // var axesHelper = new THREE.AxesHelper(shape_config.grid_w);
    // scene.add(axesHelper);

    camera.position.z = 20;

    window.onresize = function () {

        camera.aspect = (window.innerWidth - 2 * window_margin) / (window.innerHeight - 2 * window_margin);
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth - 2 * window_margin, window.innerHeight - 2 * window_margin);

    };
}

// 创建grid
function create_grid() {
    if (grid) {
        scene.remove(grid);
    }
    grid = new THREE.GridHelper(shape_config.grid_w, shape_config.grid_w, 0xD5D5E0, 0xD5D5E0);
    grid.material.opacity = 1;
    grid.material.transparent = true;
    grid.material.polygonOffset = true;
    grid.material.polygonOffsetFactor = -0.1;
    grid.material.polygonOffsetUnits = -2;
    grid.rotateX(Math.PI / 2);
    scene.add(grid);
}

// 创建plane
function create_plane() {
    if (plane) {
        scene.remove(plane);
    }
    let geometry = new THREE.PlaneGeometry(shape_config.grid_w, shape_config.grid_h, shape_config.grid_w, shape_config.grid_h);
    let mats = [];
    let material = new THREE.MeshBasicMaterial({
        color: 0xC0CDCF, side: THREE.DoubleSide
    }); // plane material
    mats.push(material);
    material = new THREE.MeshBasicMaterial({
        color: 0xEEE0CB, side: THREE.DoubleSide
    }); // target material
    mats.push(material);
    plane = new THREE.Mesh(geometry, mats);
    for (let i = 0; i < geometry.faces.length; i++) {
        let _i = Math.floor(i / 2);
        let row = Math.floor(_i / shape_config.grid_w), col = _i % shape_config.grid_w;
        if (grid_data[row][col] == 0)
            geometry.faces[i].materialIndex = 0;
        else {
            geometry.faces[i].materialIndex = 1;
        }
    }
    scene.add(plane);
    geometry = new THREE.PlaneBufferGeometry(shape_config.grid_w, shape_config.grid_h, shape_config.grid_w, shape_config.grid_h);
}

// 重置grid场景，重置shape
function reset_shape() {
    create_grid();
    create_plane();
    outline_grid();
    build_outline_wall();
    repaint_agent();
}

// 重置agent（cube）
function reset() {
    mov_para.step = 0;
    for (let i = 0; i < shape_config.agent_num; i++) {
        let x = poses_data[0][2 * i], y = poses_data[0][2 * i + 1];
        objects[i].position.y = y - shape_config.grid_h / 2 + 0.5;
        objects[i].position.x = x - shape_config.grid_w / 2 + 0.5;
        objects[i].position.z = ori_height;
    }
    mov_para.dirX = 0;
    mov_para.dirY = 0;
    mov_para.frame = 0;
}

// 重置agent位置（sphere）
function reset_group() {
    mov_para.step = 0;
    for (let i = 0; i < shape_config.agent_num; i++) {
        let x = poses_data[0][2 * i], y = poses_data[0][2 * i + 1];
        groups[i].position.y = y - shape_config.grid_h / 2 + 0.5;
        groups[i].position.x = x - shape_config.grid_w / 2 + 0.5;
        objects[i].position.z = ori_height;
    }
    mov_para.dirX = 0;
    mov_para.dirY = 0;
    mov_para.frame = 0;
}

function reset_model() {
    mov_para.step = 0;
    for (let i = 0; i < shape_config.agent_num; i++) {
        let position = {
            x: poses_data[0][2 * i] - shape_config.grid_w / 2 + 0.5,
            y: poses_data[0][2 * i + 1] - shape_config.grid_h / 2 + 0.5,
            z: 0.01
        }
        GLB_LOAD.set_position(i, position);
        // GLB_LOAD.set_rotation(i, init_rotation.y);
    }
    mov_para.dirX = 0;
    mov_para.dirY = 0;
    mov_para.frame = 0;
}

// 清除所有agent（切换agent模型使用）
function clear_agents() {
    if (groups.length) {
        for (let group of groups)
            scene.remove(group);
        groups.length = 0;
        objects.length = 0;
        shadows.length = 0;
        return;
    }

    for (let obj of objects) {
        scene.remove(obj);
    }
    objects.length = 0;

    for (let obj of shadows) {
        scene.remove(obj);
    }
    shadows.length = 0;
}
function clear_agents_model() {
    for (let model of GLB_LOAD.models) {
        scene.remove(model);
    }
    GLB_LOAD.clear_storage();
}

function agent_move_cube() {
    if (mov_para.step >= total_step - 1) {
        mov_para.frame++;
        if (mov_para.frame === pause_frame) {
            reset();
        }
        return;
    }

    for (let i = 0; i < shape_config.agent_num; i++) {
        mov_para.dirX = poses_data[mov_para.step + 1][2 * i] - poses_data[mov_para.step][2 * i];
        mov_para.dirY = poses_data[mov_para.step + 1][2 * i + 1] - poses_data[mov_para.step][2 * i + 1];
        objects[i].position.x += mov_para.dirX * per_mov;
        objects[i].position.y += mov_para.dirY * per_mov;
    }
    mov_para.frame = (mov_para.frame + 1) % fp_mov;
    if (mov_para.frame === 0) {
        mov_para.step++;
    }
}

function agent_move_sphere() {
    if (mov_para.step >= total_step - 1) {
        mov_para.frame++;
        if (mov_para.frame === pause_frame) {
            reset_group();
        }
        return;
    }

    for (let i = 0; i < shape_config.agent_num; i++) {
        mov_para.dirX = poses_data[mov_para.step + 1][2 * i] - poses_data[mov_para.step][2 * i];
        mov_para.dirY = poses_data[mov_para.step + 1][2 * i + 1] - poses_data[mov_para.step][2 * i + 1];
        groups[i].position.x += mov_para.dirX * per_mov;
        groups[i].position.y += mov_para.dirY * per_mov;
        if (mov_para.dirX || mov_para.dirY) {
            let offset = Math.sin(Math.PI / fp_mov * mov_para.frame);
            objects[i].position.z = 1.5 * offset + ori_height;
            shadows[i].material.opacity = THREE.MathUtils.lerp(0.8, .15, offset);
        }
    }
    mov_para.frame = (mov_para.frame + 1) % fp_mov;
    if (mov_para.frame === 0) {
        mov_para.step++;
    }
}

function agent_move_model() {
    if (mov_para.step >= total_step - 1) {
        if (mov_para.frame) {
            for (let i = 0; i < shape_config.agent_num; i++) {
                if (GLB_LOAD.walks[i].isRunning()) {
                    GLB_LOAD.walks[i].stop();
                    let rot = dirX2rotation(0, -1);
                    GLB_LOAD.set_rotation(i, rot);
                }
            }
        }
        mov_para.frame++;
        if (mov_para.frame === pause_frame) {
            reset_model();
        }
        return;
    }

    for (let i = 0; i < shape_config.agent_num; i++) {
        {
            mov_para.dirX = poses_data[mov_para.step + 1][2 * i] - poses_data[mov_para.step][2 * i];
            mov_para.dirY = poses_data[mov_para.step + 1][2 * i + 1] - poses_data[mov_para.step][2 * i + 1];
            if (mov_para.dirX || mov_para.dirY) {
                let final_rotation = dirX2rotation(mov_para.dirX, mov_para.dirY);
                GLB_LOAD.set_rotation(i, final_rotation);
                GLB_LOAD.models[i].position.x += mov_para.dirX * per_mov;
                GLB_LOAD.models[i].position.y += mov_para.dirY * per_mov;
                if (!GLB_LOAD.walks[i].isRunning()) {
                    GLB_LOAD.walks[i].play();
                }
            }
            else if (GLB_LOAD.walks[i].isRunning()) {
                GLB_LOAD.walks[i].stop();
                let rot = dirX2rotation(0, -1);
                GLB_LOAD.set_rotation(i, rot);
            }

        }
    }

    mov_para.frame = (mov_para.frame + 1) % fp_mov;
    if (mov_para.frame === 0) {
        mov_para.step++;
    }
}

function repaint_agent() {
    console.log("repaint")
    clear_agents();
    clear_agents_model();
    agent_id = agent_types.indexOf(params.agent_type);
    if (params.agent_type === 'cube') {
        cube_generate();
    } else if (params.agent_type === 'sphere') {
        sphere_generate();
    } else {
        model_generate();
    }
}

let animate = function () {
    requestAnimationFrame(animate);
    if (!done && poses_data.length < mov_para.step + 2) {
        return;
    }
    if (agent_id >= 2 && !GLB_LOAD.all_ready(shape_config.agent_num)) {
        console.log(agent_types[agent_id])
        return;
    }

    // if (!done) {
    //     if (poses_data.length >= 2) done = true;
    //     return;
    // }
    // update the speed of agents
    if (mov_para.frame === 0) {
        fp_mov = (13 - params.speed) * 10;
        per_mov = 1 / fp_mov;
    }
    if (params.agent_type !== agent_types[agent_id]) {
        repaint_agent();
        return;
    }
    if (agent_types[agent_id] === 'cube')
        agent_move_cube();
    else if (agent_types[agent_id] === 'sphere')
        agent_move_sphere();
    else {
        agent_move_model();
    }

    if (agent_id >= 2) {
        GLB_LOAD.update_all(1 / fp_mov);
    }
    controls.update();

    renderer.render(scene, camera);
};

animate();

function arrTrans(num, arr) {
    let len = arr.length;
    console.log(len);
    const newArr = [];
    for (let i = 0; i < len; i += num) {
        newArr.push(arr.slice(i, i + num));
    }
    return newArr;
}

// 自定义面板按钮事件
document.getElementById("apply").addEventListener("click", function () {
    // 检查用户定义的形状是否合法
    let valid = false;
    for (let node of CUSTOM_PAD.new_shape_data) {
        if (node === 1) {
            valid = true;
        }
    }
    if (!valid) {
        alert("Please draw a shape!");
        return;
    }
    grid_data = arrTrans(CUSTOM_PAD.width, CUSTOM_PAD.new_shape_data);
    shape_config.grid_w = CUSTOM_PAD.width, shape_config.grid_h = CUSTOM_PAD.height;
    shape_config.shape_num = custom_shape_id;
    shape_config.agent_num = CUSTOM_PAD.agent_num;
    poses_data.length = 0;
    done = false;
    web_worker.postMessage({
        MessagePurpose: "getPoseData", width: shape_config.grid_w, height: shape_config.grid_h, shape_num: shape_config.shape_num,
        agent_num: shape_config.agent_num, grid_data: grid_data
    });
    console.log(grid_data);
    CUSTOM_PAD.hide_custom_shape_popup();
})

// 上传图片面板apply按钮事件
document.getElementById("img_apply").addEventListener("click", function () {
    let size = document.getElementById("image_grid_size").value;
    size = parseInt(size);

    let file_uploader = document.getElementById("file_uploader");
    let file = file_uploader.files[0];
    if (!file) {
        alert("Please select a .png file!");
        return;
    }
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function (e) {
        let url = e.target.result;
        let image = new Image();
        image.src = url;
        let grid;
        image.onload = function () {
            let obj = generateGrid(image, size, size);
            grid_data = obj.grid;
            shape_config.agent_num = obj.agent_num;
            shape_config.grid_w = size, shape_config.grid_h = size;
            shape_config.shape_num = custom_shape_id;
            poses_data.length = 0;
            done = false;
            web_worker.postMessage({
                MessagePurpose: "getPoseData", width: shape_config.grid_w, height: shape_config.grid_h, shape_num: shape_config.shape_num,
                agent_num: shape_config.agent_num, grid_data: grid_data
            });
            CUSTOM_PAD.hide_image_upload_popup();
        };
    }
});

// 选择已有形状按钮事件
document.getElementById("stored_shape_apply").addEventListener("click", function () {
    let radios = document.getElementsByName("grid_size");
    let has_checked = null; // 选中的规模
    for (let i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
            has_checked = radios[i].id;
        }
    }
    // 检查是否选中一种grid规模
    if (!has_checked) {
        alert("Please set the grid size!");
    } else {
        STORED_SHAPE_PAD.hide_stored_shape();
    }


    let stored_shape_obj = stored_para[STORED_SHAPE_PAD.selected_shape];
    // 查找规模索引
    let idx = -1;
    let size_mat = has_checked.split(',');
    for (let size_obj of stored_shape_obj.sizes) {
        idx++;
        if (size_obj.width === parseInt(size_mat[0]) && size_obj.height === parseInt(size_mat[1]))
            break;
    }
    shape_config.file_path = data_file_path_generate(stored_para[STORED_SHAPE_PAD.selected_shape].sizes[idx].grid_file);
    let obj = parse_grid(shape_config.file_path);
    shape_config.grid_w = obj.grid_w, shape_config.grid_h = obj.grid_h;
    grid_data = obj.content;
    shape_config.shape_num = obj.shape_num;
    shape_config.agent_num = obj.a_num;

    poses_data.length = 0;
    done = false;
    let pose_file = data_file_path_generate(stored_para[STORED_SHAPE_PAD.selected_shape].sizes[idx].pose_file)
    let { len, res } = parse_poses(pose_file);
    total_step = len;
    poses_data = res;
    reset_shape();
    done = true;
});

function data_file_path_generate(file) {
    return "../data/" + file;
}