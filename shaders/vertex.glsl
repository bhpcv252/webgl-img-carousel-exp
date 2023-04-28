#define PI 3.141592653589793238

varying vec2 vUv;
varying vec3 vPosition;

uniform sampler2D image;
uniform float time;
uniform float scrollSpeed;
uniform float dist;
uniform vec2 mouseUV;
uniform float mouseRadius;

void main() {
    vUv = (uv - vec2(0.5))*(0.9 - dist*0.1) + vec2(0.5); // zooming image

    vPosition = position;
    vec3 pos = position;

    if(mod(uv.x*250.0, 2.0) == 0.0) {
        pos.y += sin( PI * uv.x * 3.0) * scrollSpeed;
    }
    else {
        pos.y -= sin( PI * uv.x * 3.0) * scrollSpeed;
    }

    //pos.y += sin( PI * uv.x * 3.0) * scrollSpeed * 1.9;
    //pos.x += sin(PI * uv.y) * scrollSpeed * 5.9;
    //pos.y += PI * uv.x;
    //pos.z += sin(PI*uv.x) * scrollSpeed * 3.9;

    pos.y += sin(time*0.8) * 0.02;
    vUv.y -= sin(time*0.8) * 0.03;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
}
