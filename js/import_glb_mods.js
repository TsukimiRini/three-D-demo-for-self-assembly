"use strict"
import * as THREE from '../three.js-master/build/three.module.js';
import { GLTFLoader } from '../three.js-master/examples/jsm/loaders/GLTFLoader.js';

// slime: rotation-X90,Y270, scale:0.3,0.3,0.3
// parameter description:
// [postion] {x,y,z}
// [scale] integer [0,1]
// [rotation] {x,y}
let models = [], walks = [], mixers = [], ready = [];
let allReady = false;
let models_loaded = false;

function load_glb(idx, file, scene, position, scale, rotation, animation_idx) {
    var loader = new GLTFLoader();
    ready.push(false);
    loader.load(file, function (gltf) {
        let model, walk, mixer;
        model = gltf.scene;

        model.scale.set(scale, scale, scale);
        model.rotateX(rotation.x); model.rotateY(rotation.y);
        model.position.set(position.x, position.y, position.z);

        mixer = new THREE.AnimationMixer(model);
        walk = mixer.clipAction(gltf.animations[animation_idx]);
        // walk.setLoop(THREE.LoopOnce);
        walk.clampWhenFinished = true;
        walk.setDuration(10)

        models.push(model);
        walks.push(walk);
        mixers.push(mixer);
        ready[idx] = true;
        set_animation_duration(idx, 1);
        scene.add(model);
    }, undefined, function (e) {
        console.error(e);
    });
}

function set_animation_duration(idx, duration) {
    walks[idx].setDuration(duration);
}

function set_position(idx, position) {
    models[idx].position.set(position.x, position.y, position.z);
}

function set_rotation(idx, rotation) {
    models[idx].rotation.y = rotation;
}

function clear_storage() {
    models.length = 0;
    walks.length = 0;
    mixers.length = 0;
    ready.length = 0;
    allReady = false;
    models_loaded = false;
}

function all_ready(len) {
    try {
        if (ready.length > len)
            throw ("ready length err");
    } catch (err) {
        console.log(err);
    }
    if (allReady === true) return true;
    if (ready.length !== len) return false;
    let i = 0;
    for (let flag of ready) {
        if (flag === false) {
            i++;
            return false;
        }
    }
    allReady = true;
    return true;
}

function update_all(dt) {
    for (let mixer of mixers) {
        if (mixer) {
            mixer.update(dt);
        }
    }
}

function loaded_finished() {
    models_loaded = true;
}

export { load_glb, set_animation_duration, set_position, set_rotation, clear_storage, all_ready, update_all, loaded_finished, models, walks, mixers, models_loaded };