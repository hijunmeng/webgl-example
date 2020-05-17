
//[使用 WebGL 创建 2D 内容 - Web API 接口参考 | MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/WebGL_API/Tutorial/Adding_2D_content_to_a_WebGL_context) 

//顶点着色器
const vsSource =
  `
    attribute vec4 aVertexPosition;//attribute只能在顶点着色器中使用
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;//uniform修饰的可以在顶点和片元着色器使用
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor; //传递给片元着色器的变量，片元着色器接收到会是已经插值过的值


    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
  `;

//片段着色器
const fsSource =
  `
    varying lowp vec4 vColor; //接收顶点着色器传递的插值，只要保持与顶点着色器的声明一致即可接收到值

        void main() {
         // gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
          gl_FragColor = vColor;
        }
      `;

let gl;
let programInfo;
let rotate = 0.0;
main();
requestAnimationFrame(render);






let then = 0;
function render(now) {
  // now *= 0.001;  // convert to seconds
  const deltaTime = now - then;
  then = now;
  //console.log("deltaTime(ms)="+deltaTime);//默认帧率是60，也就是大概16.6ms

  updateDatas();//更新数据
  draw();//绘制
  requestAnimationFrame(render);

}

function updateDatas() {
  const modelViewMatrix = mat4.create();//模型视图矩阵，一开始创建后是单位矩阵
  mat4.translate(
    modelViewMatrix,     // 返回值
    modelViewMatrix,     // 要被平移的矩阵
    [0.0, 0.0, -6.0]);  // xyz分别表示xyz方向上的平移，-6.0表示在z轴向内平移6个单位

  mat4.rotate(
    modelViewMatrix,  // destination matrix
    modelViewMatrix,  // matrix to rotate
    rotate,   // amount to rotate in radians
    [1, 1, 1]);//指定按哪个轴旋转，全为1表示绕xyz三轴旋转

  rotate += Math.PI / 180.0;//每次增加一弧度

  //更新矩阵
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix);
}


function main() {
  let canvas = document.getElementById("canvas-webgl");

  gl = canvas.getContext("webgl");
  if (!gl) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
  }
  let program = initShaders(gl, vsSource, fsSource);

  programInfo = {
    attribLocations: {
      vertexPosition: gl.getAttribLocation(program, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(program, 'aVertexColor'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(program, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(program, 'uModelViewMatrix'),
    },
  };

  //定义视椎体信息
  const fieldOfView = 45 * Math.PI / 180;   // fov in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;


  const projectionMatrix = mat4.create();//投影矩阵
  //注意gl-matrix.js总是以第一个参数作为返回
  mat4.perspective(//透视
    projectionMatrix, // 返回值
    fieldOfView,
    aspect,
    zNear,
    zFar);

  const modelViewMatrix = mat4.create();//模型视图矩阵，一开始创建后是单位矩阵
  mat4.translate(
    modelViewMatrix,     // 返回值
    modelViewMatrix,     // 要被平移的矩阵
    [0.0, 0.0, -6.0]);  // xyz分别表示xyz方向上的平移，-6.0表示在z轴向内平移6个单位

//此种方式将每个面的四个顶点划为一组，因此可以指定四个顶点为同一颜色，也就能为每个面指定颜色了
  //也可以在每一行后面增加4个元素用来表示颜色，之后vertexAttribPointer用size=3,stride=28,offset=0和size=4,stride=28,offset=12即可分离出顶点位置和颜色
const positions = [
    // Front face
    -1.0, -1.0,  1.0,
     1.0, -1.0,  1.0,
     1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,

    // Back face
    -1.0, -1.0, -1.0,
    -1.0,  1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0, -1.0, -1.0,

    // Top face
    -1.0,  1.0, -1.0,
    -1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0, -1.0,

    // Bottom face
    -1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
     1.0, -1.0,  1.0,
    -1.0, -1.0,  1.0,

    // Right face
     1.0, -1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0,  1.0,  1.0,
     1.0, -1.0,  1.0,

    // Left face
    -1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
    -1.0,  1.0,  1.0,
    -1.0,  1.0, -1.0,
  ];
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  
  
  const faceColors = [
    [1.0,  1.0,  1.0,  1.0],    // Front face: white
    [1.0,  0.0,  0.0,  1.0],    // Back face: red
    [0.0,  1.0,  0.0,  1.0],    // Top face: green
    [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
    [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
    [1.0,  0.0,  1.0,  1.0],    // Left face: purple
  ];

  // Convert the array of colors into a table for all the vertices.

  var colors = [];

  for (var j = 0; j < faceColors.length; ++j) {
    const c = faceColors[j];

    // Repeat each color four times for the four vertices of the face
    colors = colors.concat(c, c, c, c);
  }
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

 
  const size = 3;  // 指定每个顶点属性的组成数量，必须是1，2，3或4
  const type = gl.FLOAT;    // the data in the buffer is 32bit floats
  const normalize = false;  // 是否归一化
  const stride = 0;         // 以字节为单位指定连续顶点属性开始之间的偏移量(即数组中一行长度)。不能大于255。如果stride为0，则假定该属性是紧密打包的，即不交错属性，每个属性在一个单独的块中，下一个顶点的属性紧跟当前顶点之后
  const offset = 0;         // 开始位置
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexPosition,
    size,
    type,
    normalize,
    stride,
    offset
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);//激活attribute


  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);

  //这里的内容是positions每一行的下标
  var cubeVertexIndices = [
    0,  1,  2,      0,  2,  3,    // front
    4,  5,  6,      4,  6,  7,    // back
    8,  9,  10,     8,  10, 11,   // top
    12, 13, 14,     12, 14, 15,   // bottom
    16, 17, 18,     16, 18, 19,   // right
    20, 21, 22,     20, 22, 23,   // left
  ];
  var cubeVerticesIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVerticesIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);

  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,//是否转置矩阵
    projectionMatrix);
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix);

}

function draw() {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // 设置清屏颜色
  gl.clearDepth(1.0);                 // 设置清除深度缓存区的值
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            //近物覆盖远物
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  
  //在drawElements之前要确保已经用bindBuffer绑定到正确的缓冲区了，这里由于main函数里最后已经绑定了，故才不用写
  gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
}

/**
 * 
 * @param {WebGLRenderingContext} gl 
 * @param {string} vertexShaderSource 
 * @param {string} fragmentShaderSource 
 */
function initShaders(gl, vertexShaderSource, fragmentShaderSource) {
  var program = gl.createProgram();
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(vertexShader);
  gl.compileShader(fragmentShader);
  //检查编译状态
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }
  gl.useProgram(program);
  return program;
}


