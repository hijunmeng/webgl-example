
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

main();


function main() {
  let canvas = document.getElementById("canvas-webgl");

  let gl = canvas.getContext("webgl");
  if (!gl) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
  }
  var program = initShaders(gl, vsSource, fsSource);

  const programInfo = {
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


  {
    let vertices = [//size=3,stride=0或12,offset=0
      1.0, 1.0, 0.0,
      -1.0, 1.0, 0.0,
      1.0, -1.0, 0.0,
      -1.0, -1.0, 0.0
    ];

    // let vertices = [//假如每一行前2个其他用途,后三个表示点的坐标，则size=3,stride=5*4=20,offset=8
    //   1.0, 1.0, 1.0, 1.0, 0.0, 
    //   1.0, 1.0, -1.0, 1.0, 0.0, 
    //   1.0, 1.0,1.0, -1.0, 0.0, 
    //   1.0, 1.0,-1.0, -1.0, 0.0
    // ];
    // let vertices = [//假如每一行前三个表示点的坐标，后两个用于其他用途，那么size=3,stride=5*4=20,offset=0
    //   1.0, 1.0, 0.0,  1.0, 0.0,
    //   -1.0, 1.0, 0.0, 1.0, 0.0,
    //   1.0, -1.0, 0.0, 1.0, 0.0,
    //   -1.0, -1.0, 0.0, 1.0, 0.0
    // ];
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(vertices),
      gl.STATIC_DRAW  //数据存储模式，
      //gl.STATIC_DRAW表示数据经常被使用但不会经常发生变化
      //gl.STREAM_DRAW表示数据不是很常用
      //gl.DYNAMIC_DRAW表示数据经常用而且经常变化
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);//激活attribute
    const size = 3;  // 指定每个顶点属性的组成数量，必须是1，2，3或4
    const type = gl.FLOAT;    // the data in the buffer is 32bit floats
    const normalize = false;  // 是否归一化
    const stride = 0;         // 以字节为单位指定连续顶点属性开始之间的偏移量(即数组中一行长度)。不能大于255。如果stride为0，则假定该属性是紧密打包的，即不交错属性，每个属性在一个单独的块中，下一个顶点的属性紧跟当前顶点之后
    const offset = 0;         // 开始位置
    gl.vertexAttribPointer(//[WebGLRenderingContext.vertexAttribPointer() - Web API 接口参考 | MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/vertexAttribPointer) 
      programInfo.attribLocations.vertexPosition,
      size,
      type,
      normalize,
      stride,
      offset
    );
  
    
  }
  
  {
    const colors = [
      1.0, 1.0, 1.0, 1.0,    // 白
      1.0, 0.0, 0.0, 1.0,    // 红
      0.0, 1.0, 0.0, 1.0,    // 绿
      0.0, 0.0, 1.0, 1.0,    // 蓝
    ];
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexColor,4,gl.FLOAT,false,0,0);
    
  }

  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,//是否转置矩阵
    projectionMatrix);
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix);



  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // 设置清屏颜色
  gl.clearDepth(1.0);                 // 设置清除深度缓存区的值
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            //近物覆盖远物
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);//4表示4个顶点
  // gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);//这样你可以看到一个三角形
  // gl.drawArrays(gl.TRIANGLE_STRIP, 1, 3);//这样你可以看到一个三角形


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


