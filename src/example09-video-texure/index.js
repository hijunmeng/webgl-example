
//[使用 WebGL 创建 2D 内容 - Web API 接口参考 | MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/WebGL_API/Tutorial/Adding_2D_content_to_a_WebGL_context) 

//顶点着色器
const vsSource =
  `
  //attribute只能在顶点着色器中使用
    attribute highp vec4 aVertexPosition; //顶点位置
    attribute highp vec2 aTextureCoord;//纹理坐标
    attribute highp vec3 aVertexNormal;//法向量

    //uniform修饰的可以在顶点和片元着色器使用
    uniform highp mat4 uModelViewMatrix;//模型视图矩阵
    uniform highp mat4 uProjectionMatrix;//投影矩阵
    uniform highp mat4 uNormalMatrix;//法线向量矩阵

    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;

    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vTextureCoord = aTextureCoord;

      //灯光效果
      highp vec3 ambientLight=vec3(0.6,0.6,0.6);//环境光
      highp vec3 directionalLightColor=vec3(1.0,0.0,0.0);//平行光颜色
      highp vec3 directionalVector =vec3(0.0,-1.0,0.0);//平行光方向

      highp vec4 transformedNormal =uNormalMatrix * vec4(aVertexNormal,1.0);

      highp float directional =max(dot(transformedNormal.xyz,directionalVector),0.0);
      vLighting= ambientLight+(directionalLightColor*directional);
    }
  `;

//片段着色器
const fsSource =
  `
    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;

    uniform sampler2D uSampler;

    void main() {
      
      mediump vec4 texelColor =texture2D(uSampler,vTextureCoord.st);//获得纹素
      gl_FragColor = vec4(texelColor.rgb * vLighting,texelColor.a);
    }
      `;

let gl;
let programInfo;
let rotate = 0.0;
let cubeTexture;
main();
requestAnimationFrame(render);




let then = 0;
function render(now) {
  // now *= 0.001;  // convert to seconds
  const deltaTime = now - then;
  then = now;
  //console.log("deltaTime(ms)="+deltaTime);//默认帧率是60，也就是大概16.6ms

  updateDatas();//更新数据
  loadTexture();
  draw();//绘制
  requestAnimationFrame(render);

}


function loadTexture() {

  let video = document.getElementById("video");
  gl.bindTexture(gl.TEXTURE_2D, cubeTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);

  //以下设置保证任何尺寸都能正常加载
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

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

  //更新法线向量矩阵
  const normalMatrix = mat4.create();
  mat4.invert(normalMatrix, modelViewMatrix);////逆矩阵
  mat4.transpose(normalMatrix, normalMatrix);//转置矩阵
  let nUniform = programInfo.uniformLocations.normalMatrix;
  gl.uniformMatrix4fv(nUniform, false, normalMatrix);
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
      textureCoord: gl.getAttribLocation(program, "aTextureCoord"),
      vertexNormal: gl.getAttribLocation(program, "aVertexNormal"),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(program, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(program, 'uModelViewMatrix'),
      cubeTexture: gl.getUniformLocation(program, "uSampler"),
      normalMatrix: gl.getUniformLocation(program, "uNormalMatrix"),
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


  //顶点
  //也可以在每一行后面增加2个元素用来表示纹理坐标，之后vertexAttribPointer用size=3,stride=20,offset=0和size=2,stride=20,offset=12即可分离出顶点位置和纹理坐标
  const positions = [
    // Front face
    -1.0, -1.0, 1.0,
    1.0, -1.0, 1.0,
    1.0, 1.0, 1.0,
    -1.0, 1.0, 1.0,

    // Back face
    -1.0, -1.0, -1.0,
    -1.0, 1.0, -1.0,
    1.0, 1.0, -1.0,
    1.0, -1.0, -1.0,

    // Top face
    -1.0, 1.0, -1.0,
    -1.0, 1.0, 1.0,
    1.0, 1.0, 1.0,
    1.0, 1.0, -1.0,

    // Bottom face
    -1.0, -1.0, -1.0,
    1.0, -1.0, -1.0,
    1.0, -1.0, 1.0,
    -1.0, -1.0, 1.0,

    // Right face
    1.0, -1.0, -1.0,
    1.0, 1.0, -1.0,
    1.0, 1.0, 1.0,
    1.0, -1.0, 1.0,

    // Left face
    -1.0, -1.0, -1.0,
    -1.0, -1.0, 1.0,
    -1.0, 1.0, 1.0,
    -1.0, 1.0, -1.0,
  ];
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  let cubeVerticesTextureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesTextureCoordBuffer);

  //纹理坐标
  var textureCoordinates = [
    // Front
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    // Back
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    // Top
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    // Bottom
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    // Right
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    // Left
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
  gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);



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


  //法向量
  var vertexNormals = [
    // Front
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,

    // Back
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,

    // Top
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,

    // Bottom
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,

    // Right
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,

    // Left
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0
  ];

  let cubeVerticesNormalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);

  gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);
  gl.vertexAttribPointer(programInfo.attribLocations.vertexNormal, 3, gl.FLOAT, false, 0, 0);



  //这里的内容是positions每一行的下标
  var cubeVertexIndices = [
    0, 1, 2, 0, 2, 3,    // front
    4, 5, 6, 4, 6, 7,    // back
    8, 9, 10, 8, 10, 11,   // top
    12, 13, 14, 12, 14, 15,   // bottom
    16, 17, 18, 16, 18, 19,   // right
    20, 21, 22, 20, 22, 23,   // left
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


  cubeTexture = gl.createTexture();
  //激活纹理单元0，总共有32个单元
  gl.activeTexture(gl.TEXTURE0);
  //绑定到纹理激活的纹理单元
  gl.bindTexture(gl.TEXTURE_2D, cubeTexture);
  //告诉着色器我们将材质绑定到材质单元0
  gl.uniform1i(programInfo.uniformLocations.cubeTexture, 0);

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
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(vertexShader));
    gl.deleteShader(vertexShader);
    return null;
  }
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(fragmentShader));
    gl.deleteShader(fragmentShader);
    return null;
  }
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
    return null;
  }
  gl.useProgram(program);
  return program;
}


