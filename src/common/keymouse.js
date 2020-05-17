document.onkeydown = function (e) {

    e.preventDefault();  //阻止默认事件
  
    switch (e.keyCode) {
      case 81://q
        console.log("q");
        break;
      case 69://e
        console.log("e");
        break;
      case 65://a
        console.log("a");
        break;
      case 68://d
        console.log("d");
        break;
      case 83://s
        console.log("s");
        break;
      case 87://w
        console.log("w");
        break;
  
    }
  }
  
  if (document.addEventListener) {
    document.addEventListener('DOMMouseScroll', scrollFunc, false);
  }
  window.onmousewheel = document.onmousewheel = scrollFunc;
  
  function scrollFunc(e) {
    var direct = 0;
    e = e || window.event;
  
    let value ;
    if (e.wheelDelta) {//IE/Opera/Chrome
      value = e.wheelDelta;
    } else if (e.detail) {//Firefox
      value = e.detail;
    }
  
    //负数表示向上滚
    console.log("mousewheel:"+value);
  }