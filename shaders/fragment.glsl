#define PI 3.141592653589793238

varying vec2 vUv;
varying vec3 vPosition;

uniform sampler2D image;
uniform float time;
uniform float scrollSpeed;
uniform float dist;
uniform vec2 mouseUV;
uniform float mouseRadius;

float C( vec2 uv, vec2 pos, float rad, float blur ) {
    return smoothstep(rad, rad-blur, length(uv-pos));
}

float rand(vec2 co, float s){
    float PHI = 1.61803398874989484820459;
    return fract(tan(distance(co*PHI, co)*s)*co.x);
}

void main() {
    vec4 imageTexture = texture2D(image, vUv);

    vec2 m = mouseUV - 0.5;
    m.x *= 1.5;

    float bw = (imageTexture.r + imageTexture.g + imageTexture.b)/3.;
    vec4 bwImage = vec4(bw, bw, bw, 1.) + (imageTexture*0.1);
    vec4 normalImage = mix(bwImage, imageTexture, dist);

    float randomNumber = rand(gl_FragCoord.xy, fract(time)+1.0)*0.08;
    normalImage.rgb += (bw > .5)? -randomNumber : randomNumber;

    vec4 negativeImage = vec4(1. - normalImage.rgb, 1.);

    float bw2 = (negativeImage.r + negativeImage.g + negativeImage.b)/3.;

    float randomNumber2 = rand(gl_FragCoord.xy, fract(time)+13.670)*0.08;
    negativeImage.rgb += (bw2 > .5)? -randomNumber2 : randomNumber2;

    float circle = (mouseRadius > 0.) ? C(vPosition.xy, m, mouseRadius, 0.005) : 0.;

    vec4 finalImage = mix(normalImage, negativeImage, circle);

    finalImage.a = clamp(dist, 0.9, 1.);

    gl_FragColor = finalImage;
}
