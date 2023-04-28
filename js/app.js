import '../sass/style.scss';

import images from '../images/jellyfish/*.png';
import noise1 from '../images/noise-1.jpeg';
import noise2 from '../images/noise-2.jpeg';

import * as THREE from 'three';
import anime from 'animejs/lib/anime.es.js';

import fShader from '../shaders/fragment.glsl';
import vShader from '../shaders/vertex.glsl';

let scrollSpeed = 0;
let scrollPosition = 0;
const nWrapper = document.querySelector(".nWrapper");
const nElem = [...document.querySelectorAll(".n")];
let distObjs = Array(nElem.length).fill({
    dist: 0
});
let attractTo = 0;
let attract = false;

let intersects = [];

const canvasContainer = document.querySelector(".container");

const renderer = new THREE.WebGLRenderer({
    antialias: true
});
canvasContainer.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 5);
camera.position.set(0, 0, 3);
camera.lookAt(0, 0, 0);

const rayCaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(-1, -1);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0.8431372549, 0.85098039215, 0.80392156862);

const geometry =new THREE.PlaneBufferGeometry( 1.5, 1, 500, 500);

let materials = [];
let group = new THREE.Group();
let planes = [];

for(let image in images) {
    if(images.hasOwnProperty(image)) {
        let i = image - 1;
        let imageTexture = new THREE.TextureLoader().load(images[image]);
        materials[i] = new THREE.ShaderMaterial({
            uniforms: {
                image: {
                    type: 't',
                    value: imageTexture
                },
                time: {
                    type: 'f',
                    value: 0.
                },
                scrollSpeed: {
                    type: 'f',
                    value: 0.
                },
                dist: {
                    type: 'f',
                    value: 0.
                },
                mouseUV: {
                    type: 'v2',
                    value: new THREE.Vector2()
                },
                mouseRadius: {
                    type: 'f',
                    value: 0.
                }
            },
            fragmentShader: fShader,
            vertexShader: vShader,
            side: THREE.DoubleSide,
            transparent: true
        });

        planes[i] =  new THREE.Mesh(geometry, materials[i]);
        planes[i].position.set(0, i*-1.2, 0);
        group.add(planes[i]);
    }
}

scene.add(group);

requestAnimationFrame(animate);

function animate(time) {
    time *= .001;

    rayCaster.setFromCamera( mouse, camera );

    scrollPosition += scrollSpeed;
    scrollSpeed *= 0.8;

    let diff = (scrollPosition < 0)?  -scrollPosition : (scrollPosition > 8)? 8 - scrollPosition : Math.round(scrollPosition) - scrollPosition;

    if(attract) {
        diff = attractTo - scrollPosition;
        if(Math.round(scrollPosition) === attractTo) {
            attract = false;
        }
    }

    scrollPosition += Math.sign(diff) * Math.pow(Math.abs(diff), 0.9) * 0.05;

    nWrapper.style.transform = `translate(0, ${-scrollPosition*100 + 100}px)`;

    group.rotation.x = -0.4;
    group.rotation.y = -0.5;
    group.rotation.z = -0.2;

    intersects = rayCaster.intersectObjects( scene.children, true );

    distObjs.forEach((item, index) => {
        item.dist = Math.min(Math.abs(scrollPosition - index), 1);
        item.dist = 1 - item.dist**2;
        nElem[index].style.transform = `scale(${1 + 0.4 * item.dist})`;
        nElem[index].addEventListener('click', scrollToImage);

        materials[index].uniforms.time.value = time;
        materials[index].uniforms.scrollSpeed.value = scrollSpeed;
        materials[index].uniforms.dist.value = item.dist;
        planes[index].position.y = index*-1.2 + scrollPosition*1.2;

        if(intersects.length > 0) {
            if(intersects[0].object.uuid === planes[index].uuid) {
                materials[index].uniforms.mouseUV.value = intersects[0].uv;
                onMouseOver(index);
            }
            else {
                onMouseLeave(index);
            }
        }
        else {
            onMouseLeave(index);
        }

    });

    if(resizeCanvas(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }

    renderer.render(scene, camera);

    requestAnimationFrame(animate);
}

function resizeCanvas(renderer) {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width = canvas.clientWidth * pixelRatio | 0;
    const height = canvas.clientHeight * pixelRatio | 0;
    const needResize = canvas.width !== width || canvas.height !== height;
    if(needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}

window.addEventListener('wheel', onWheel);
window.addEventListener( 'mousemove', onMouseMove, false );

function onMouseMove( event ) {
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function onMouseOver(index) {
    if(materials[index].uniforms.mouseRadius.value === 0.) {
        anime({
            targets: materials[index].uniforms.mouseRadius,
            value: [0., 1.],
            easing: 'easeInOutQuint',
            duration: 1000
        });
    }
}

function onMouseLeave(index) {
    if(materials[index].uniforms.mouseRadius.value === 1.) {
        anime({
            targets: materials[index].uniforms.mouseRadius,
            value: [1., 0.],
            easing: 'easeInOutQuint',
            duration: 500
        });
    }
}

function onWheel(e) {
    scrollSpeed += e.deltaY * 0.0002;
}

function scrollToImage(e) {
    attractTo = e.target.dataset.value - 0.;
    attract = true;
}
