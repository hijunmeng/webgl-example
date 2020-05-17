
//[使用 WebGL 创建 2D 内容 - Web API 接口参考 | MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/WebGL_API/Tutorial/Adding_2D_content_to_a_WebGL_context) 

let pointSize = 100.0; //点大小
let pointPos = { x: 0.0, y: 0.0 };//范围在[-1.0,1.0]

main();


function main() {
  let canvas = document.getElementById("canvas-webgl");

  let gl = canvas.getContext("webgl");
  if (!gl) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
  }

  //大体分为4部分：着色器部分--程序部分--传值部分--绘制部分

  //着色器步骤：createShader--shaderSource--compileShader
  //编写着色器代码
  //方式一：用``包裹
  // //顶点着色器
  // const vsSource =
  //   `
  //   attribute vec4 aPosition;
  //   attribute float  aPointSize;
  //   void main() {
  //     gl_Position = aPosition;
  //     gl_PointSize = aPointSize;
  //   }
  // `;
  // //片段着色器
  // const fsSource =
  //   `
  //       void main() {
  //         gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  //       }
  //     `;

  //方式二：在script元素中获取
  const vsSource = document.getElementById('vertexShader').innerText;
  const fsSource = document.getElementById('fragmentShader').innerText;

  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

  //上传着色器代码
  gl.shaderSource(vertexShader, vsSource);
  gl.shaderSource(fragmentShader, fsSource);

  //编译着色器
  gl.compileShader(vertexShader);
  gl.compileShader(fragmentShader);

  //检查编译状态
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(vertexShader));
    gl.deleteShader(vertexShader);
    return;
  }
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(fragmentShader));
    gl.deleteShader(fragmentShader);
    return;
  }


  //程序步骤： createProgram--attachShader--linkProgram--useProgram
  const shaderProgram = gl.createProgram();

  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);

  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return;
  }
  gl.useProgram(shaderProgram);


  //传值
  const a_position = gl.getAttribLocation(shaderProgram, 'aPosition');
  const a_pointSize = gl.getAttribLocation(shaderProgram, 'aPointSize');
  gl.vertexAttrib4f(a_position, pointPos.x, pointPos.y, 0.0, 1.0);//f表示float
  //gl.vertexAttrib3f(a_position, 0.0, 0.0, 1.0);//最后一个会自动补位1.0
  gl.vertexAttrib1f(a_pointSize, pointSize);


  // 设置清屏色，这里为黑色
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // 使用清屏色进行清屏
  gl.clear(gl.COLOR_BUFFER_BIT);//要清除的缓存区，总共有三个类型可以设置，可以同时设置多个
  //gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT|gl.STENCIL_BUFFER_BIT);

  //绘制点，详细说明看这里：[WebGLRenderingContext.drawArrays() - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawArrays) 
  gl.drawArrays(
    gl.POINTS,//指定模式，还有画线和画三角形，基本图形就是点线三角形，任何复杂的物体都是由这几个基本的构成的
     0, //指定开始位置
     1  //个数
     );


}



