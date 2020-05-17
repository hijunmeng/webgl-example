
main();


function main() {
    let canvas = document.getElementById("canvas-webgl");

    let gl = canvas.getContext("webgl");
    // let gl = canvas.getContext("webgl2");//WebGL2几乎100%兼容WebGL1
    if (!gl) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }
    // 设置清屏色，这里为黑色
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // 使用清屏色进行清屏
    gl.clear(gl.COLOR_BUFFER_BIT);

}


