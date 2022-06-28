let PAG;
let pagView;
let pagFile;
let hadPAGView = false;
let playerCanvas;

window.onload = async () => {
  PAG = await window.libpag.PAGInit();
  console.log("PAG 初始化成功：", PAG);

  if (/Firefox/i.test(navigator.userAgent)) {
    console.log("Firefox 浏览器加载 ffavc 软件解码器");
    if (
      await loadJS("https://cdn.jsdelivr.net/npm/ffavc@latest/lib/ffavc.min.js")
    ) {
      const FFAVC = await window.ffavc.FFAVCInit();
      const ffavcDecoderFactory = new FFAVC.FFAVCDecoderFactory();
      PAG.registerSoftwareDecoderFactory(ffavcDecoderFactory);
      console.log("加载 ffavc 软件解码器成功");
    } else {
      console.error("Load ffavc fail!");
    }
  }

  resizeCanvas();

  document.getElementById("player").addEventListener("click", () => {
    document.getElementById("upload").click();
  });
  document.getElementById("upload").addEventListener("change", (event) => {
    if (event.target) {
      createPAGView(event.target.files[0]);
    }
  });

  document.addEventListener("dragover", (ev) => {
    ev.preventDefault();
  });
  document.addEventListener("drop", (ev) => {
    ev.preventDefault();
    if (ev.dataTransfer.files.length > 0) {
      if (/\.(pag)$/.test(ev.dataTransfer.files[0].name)) {
        createPAGView(ev.dataTransfer.files[0]);
        return;
      }
    }
    alert("请放入PAG文件进行预览！");
  });

  const createPAGView = async (file) => {
    // 清除提示
    if (!hadPAGView) {
      hadPAGView = true;
      document.getElementById("player-tip").style.display = "none";
    }
    // 清除上一个 PAG 相关的资源
    if (pagFile) pagFile.destroy();
    if (pagView) pagView.destroy();
    pagFile = await PAG.PAGFile.load(file);
    pagView = await PAG.PAGView.init(pagFile, playerCanvas, {
      useScale: false,
    });
    pagView.setRepeatCount(0);
    await pagView.play();
  };
};

let resizeCoolDown = null;

window.onresize = () => {
  if (resizeCoolDown) {
    clearTimeout(resizeCoolDown);
    resizeCoolDown = null;
  }
  resizeCoolDown = setTimeout(() => {
    resizeCanvas();
  }, 300);
};

const resizeCanvas = () => {
  if (!playerCanvas) {
    playerCanvas = document.getElementById("player-canvas");
  }
  const styleDeclaration = window.getComputedStyle(playerCanvas, null);
  playerCanvas.width =
    Number(styleDeclaration.width.replace("px", "")) * window.devicePixelRatio;
  playerCanvas.height =
    Number(styleDeclaration.height.replace("px", "")) * window.devicePixelRatio;
  if (pagView) {
    pagView.updateSize();
    pagView.flush();
  }
};

const loadJS = (url) => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.onload = function () {
      resolve(true);
    };
    script.onerror = function () {
      resolve(true);
    };
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
  });
};
