
const caseVideo = {
    HEIGHT: 640,
    WIDTH: 360,
}

const caseBox = {
    HEIGHT_PC: 1300,
    HEIGHT_MB: 920,
    WIDTH: 460,
}

var fixBg = false;
var lastIdx = 0;
var trigger = false;
var skipping = false;
var isWeChat = false;

window.onload = async () => {
    fitFrame();
    if(location.pathname.indexOf('/player.html') == 0){
        await initPlayer();
    }
    addDragListener();
    addDropListener();
}

window.onresize = () => {
    addInteractEffect();
    handlePageNav();
    fitFrame();
}

let isAndroid = () => {
    return /(Android).*?([\d.]+)/i.test(navigator.userAgent) || /(Adr)\s+([\d.]+)/i.test(navigator.userAgent);
};
let isIOS = () => {
    return /(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)
    // return /(iPhone\sOS)\s([\d_]+)/i.test(navigator.userAgent);
};
let isMobile = () => isAndroid() || isIOS();
let isFirefox = () => /Firefox/i.test(navigator.userAgent)


let isIndexPage = () => location.pathname === '/' || location.pathname === '/index' || location.pathname === ''
function docReady(fn) {
    if (document.readyState === "complete" || document.readyState === "interactive") {
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}
function appendMeta(){
    var oMeta = document.createElement('meta');
    oMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0,minimum-scale=1.0, user-scalable=0';
    oMeta.name = 'viewport';
    document.getElementsByTagName('head')[0].appendChild(oMeta);
}
function appendSEOMeta() {
    var SEOMeta = document.createElement('meta');
    SEOMeta.name = 'keywords';
    SEOMeta.content = '腾讯,PAG,动画工作流,AE,PAGViewer,PAGExporter,Tencent';
    document.getElementsByTagName('head')[0].appendChild(SEOMeta);
}
function appendAegis() {
    let init = document.createElement('script');
    init.innerHTML = "const aegis = new Aegis({ id: 'DvVmPUEQywon6Zw4dp', uin: 'xxx', reportApiSpeed: true, reportAssetSpeed: true, spa: true});";
    document.getElementsByTagName('head')[0].appendChild(init);
}

docReady(()=>{
    // Aegis
    appendAegis();
    // is Wechat?
    isWeChat = isWeChatContext()? true: false;
    // 案例展示版块动态交互效果
    addInteractEffect();
    // SEO
    appendSEOMeta();

    if(isMobile()){
        var html = document.getElementsByTagName("html")[0]; html.style.fontSize =
        Math.min(  document.documentElement.clientWidth / 375 * 75 ,80) + "px";
        document.body.classList.add('mobile-mode')
        appendMeta();
        if(isIndexPage()){
            document.body.style.backgroundImage = "url('https://pag.qq.com/website/static/img/new_official_website/bg_m.png')";
        }
        function appendNav(){
            var header = document.getElementsByClassName('fixedHeaderContainer')[0]
            var node=document.createElement("div");
            node.id='js_nav'
            node.className='nav-icon';
            header.children[0].appendChild(node)
            document.getElementById('js_nav').onclick = function(){
                let close = node.classList.contains('expand')
                if(close){
                    node.classList.remove('expand')
                }
                else {
                    node.classList.add('expand')
                }
                var menu = document.getElementsByClassName('nav-site-internal')[0]
                var box = document.getElementsByClassName('slidingNav')[0]
                var header = document.getElementsByClassName('fixedHeaderContainer')[0];
                var nav =  document.getElementsByClassName('nav-site')[0];
                header.style.backdropFilter = close ? 'saturate(180%) blur(20px)' : 'none';
                nav.style.backdropFilter = close ? 'none' :'saturate(180%) blur(20px)';
                box.style.height = close ? '0' : window.innerHeight+'px';
                menu.style.display = close ? 'none' : 'block';
            }
        }
        appendNav()
        function appendMenu(){
            var bottomBar = document.getElementsByClassName('docs-prevnext')[0]
            if(bottomBar){
                var node=document.createElement("div");
                node.id='js_category'
                node.className='category-icon';
                bottomBar.appendChild(node)
                document.getElementById('js_category').onclick = function(){
                    let docNav = document.getElementById('docsNav');
                    let close = docNav.classList.contains('docsSliderActive');
                    if(close){
                        docNav.classList.remove('docsSliderActive')
                    }
                    else{
                        docNav.classList.add('docsSliderActive')
                    }
                }
            }
        }
        appendMenu()
    }
    else{
        if(isIndexPage()){
            document.body.style.backgroundImage = "url('https://pag.qq.com/website/static/img/new_official_website/fill1.png')"
        }
        document.body.classList.add('pc-mode')
        function appendNavPC() {
            var nav = document.getElementsByClassName('slidingNav')[0];
            nav.children[0].children[6].children[0].target = '_blank';
            nav.children[0].children[5].children[0].target = '_blank';
        }
        appendNavPC();
        navEntryEffect();
        handlePageNav();
    }
    function navEntryEffect() {
        var nav = document.getElementsByClassName('slidingNav')[0];
        nav.children[0].children[5].onmouseover = () => {
            nav.children[0].children[5].children[0].innerText = 'Star!';
            
        }
        nav.children[0].children[5].onmouseleave = () => {
            nav.children[0].children[5].children[0].innerText = 'GitHub';
        }
    }

    function generateCopyright() {
        let year = new Date().getFullYear() < 2022? 2022: new Date().getFullYear().toString();
        let copyright = `Copyright © 2018 - ${year} Tencent. All Rights Reserved.`;
        return copyright
    }
    //append git/QQ group icon
    function appendBottomNav(){
        var footer = document.getElementById('footer');
        footer.children[0].innerHTML = '';
        // copyright
        var copyright = document.createElement("div"); 
        copyright.innerText = generateCopyright();
        footer.children[0].appendChild(copyright)

        // privacy policy
        var privacy = document.createElement('div');
        privacy.id = 'privacy-policy';
        privacy.className = 'privacy-policy';
        privacy.innerText = '隐私政策';
        footer.children[0].appendChild(privacy);
        document.getElementById('privacy-policy').onclick = function(){
            window.open('https://privacy.qq.com/document/preview/01e79d0cc7a2427ba774b88c6beff0fd');
        }

        //qq group
        var qqgroup = document.createElement("div");
        qqgroup.id = 'js_qqgroup';
        qqgroup.className='qq-group-icon js_qqgroup';
        qqgroup.innerText = 'QQ 群：893379574';
        footer.children[0].appendChild(qqgroup)
        document.getElementById('js_qqgroup').onclick = function(){
           window.open('https://qm.qq.com/cgi-bin/qm/qr?k=Wa65DTnEKo2hnPsvY-1EgJOF8tvKQ-ZT&jump_from=webapi')
        }
        var qgroupbtn = document.getElementsByClassName('js_qqgroup');
        for (var i=0; i < qgroupbtn.length; i++) {
            qgroupbtn[i].onclick = function(){
                window.open('https://qm.qq.com/cgi-bin/qm/qr?k=Wa65DTnEKo2hnPsvY-1EgJOF8tvKQ-ZT&jump_from=webapi')
            }
        };
        
        var git = document.createElement("div"); 
        git.id = 'js_git'
        git.className='git-icon';
        footer.children[0].appendChild(git)
        document.getElementById('js_git').onclick = function(){
            location.href = 'https://github.com/Tencent/libpag'
        }
    }
    appendBottomNav()
    var btns = document.getElementsByClassName('download-btn');
    
    for (var i=0; i < btns.length; i++) {
        btns[i].onclick = function(){
            var pkg = document.getElementsByClassName('pkg-download')[0];
            pkg.scrollIntoView()
        }
    };
    // 请将属"开发者文档"的文件名添加进该数组
    const devDocRoutes = [
        "sdk",
        "pag-depth-1",
        "pag-depth-2",
        "pag-depth-3",
        "pag-depth-4",
        "apis-ios",
        "apis-android",
        "apis-web",
        "lottie-migration",
        "animation-convertor",
        "SDK-migration",
        "sdk-web",
        "sdk-windows",
        "qa",
        "pdf",
    ];

    function isDevDoc(path) {
        for (let i = 0; i < devDocRoutes.length; i++) {
            if (path.indexOf(devDocRoutes[i]) != (-1)) {
                console.log("is DevDoc");
                return true;
            }
        }
        console.log("is not DevDoc");
        return false;
    }

    var pathname = location.pathname
    if( pathname == '/' ){
        document.getElementsByClassName('nav-site')[0].children[0].classList.add('active')
    }
    else if(pathname.indexOf('/docs') == 0 && (!isDevDoc(pathname) && pathname.indexOf('/docs/faq') != 0)){
        document.getElementsByClassName('nav-site')[0].children[1].classList.add('active')
    }
    else if(isDevDoc(pathname)){
        document.getElementsByClassName('nav-site')[0].children[2].classList.add('active')
    }
    else if(pathname.indexOf('/case') == 0){
        document.getElementsByClassName('nav-site')[0].children[3].classList.add('active')
    }
    else if(pathname.indexOf('/docs/faq') == 0){
        document.getElementsByClassName('nav-site')[0].children[4].classList.add('active');
        if (isMobile()) {
            document.getElementById('faq').style= `width: inherit; margin: 0`;
            document.getElementsByClassName('docMainWrapper')[0].style.width = `${window.innerWidth}px`;
        } else {
            // FAQ更换为侧边栏模式后，需要去除该行
            document.getElementsByClassName('docMainWrapper')[0].style = 'position: relative; top: 20px; left: 50%; margin-left: -350px; padding-bottom: 360px;'
        }
    }
    if(pathname.indexOf('/docs/pdf') == 0){
        let script = document.createElement('script');
        script.src = 'https://cdn.bootcdn.net/ajax/libs/axios/0.26.1/axios.min.js';
        script.defer= 'defer';
        document.getElementsByTagName('head')[0].appendChild(script);

        document.getElementById('pdfDownload').onclick = function(){
            axios({
              method: 'get',
              url:
                '../file/pag_codec.pdf',
              responseType: 'blob',
            }).then(function (response) {
              const link = document.createElement('a')
              let blob = new Blob([response.data], { type: response.data.type })
              let url = URL.createObjectURL(blob)
              link.href = url
              link.download = 'pag文件格式规范.pdf'
              link.click()
            })
        }
    }
    if(pathname.indexOf('/docs/apis-android') == 0 || pathname.indexOf('/docs/apis-ios') == 0 ||pathname.indexOf('/docs/apis-web') == 0) {
        var iframe = document.getElementsByTagName('iframe')[0];
        iframe.style = `width: ${window.innerWidth}px; height: ${window.innerHeight}px; background-color: white; padding: 80px 160px 0 160px; position: fixed; top: 0; left: 0; z-index: 9`;
    }
})

function addInteractEffect() {
    if (location.pathname.indexOf('/case') !== 0) {
        return;
    }
    if (isWeChat) {
        changeStyle('add');
    }
    document.addEventListener(
        'touchstart',
        function() {
            playVideo();
        },
        false
    );
    let titles = document.getElementsByClassName('titleBox');
    let marks = document.getElementsByClassName('mark');
    let progressBar = document.getElementById('progressBox');

    if (isMobile() || window.innerWidth - 980 < 80) {
        progressBar.style.display = 'none';
    } else {
        progressBar.style.display = 'block';
        progressBar.style.left = `${(window.innerWidth - 980) / 2}px`;
    }
    marks[0].className = 'mark active';
    
    
    window.addEventListener('scroll', function(e) {
        // 进度条更新
        updateProgressBar(marks);
        // 背景更新
        updateBg(fixBg);
        // 标题渐隐
        updateText(titles);  
        // 视频可见
        if (isWeChat) {
            changeStyle('remove');
        }
    },{passive: false});

    document.getElementById('progressUl').addEventListener('click', (e) => {
        let index = Number(e.target.getAttribute('idx'));
        console.log('index:' + index);
        // 点击进度条进行跳转时，避免吸附效果
        skipping = true;
        skipTo(index);
        setTimeout(() => {
            skipping = false;
        }, 1000);
    });
}

function absoluteTop(element) {
    var top = 0;
    do {
        top += element.offsetTop  || 0;
        element = element.offsetParent;
    } while(element);

    return top
};

function updateBg(fixBg) {
    if (fixBg) {
        return;
    }
    if (isMobile()) {
        idx = parseInt(document.documentElement.scrollTop / caseBox.HEIGHT_MB, 10);
    } else {
        idx = parseInt(document.documentElement.scrollTop / caseBox.HEIGHT_PC, 10);
    }

    if (idx >= 2 && !fixBg) {
        fixBg = true;
    }
    if (!fixBg && !isMobile()) {
        let offsetX = window.innerWidth * 0.35;
        let offsetY = window.innerHeight * 0.25;
        document.getElementById('wallpaper').style = `transform: scale(1.62) translate(${offsetX}px, ${offsetY}px); transition: all 1.6s cubic-bezier(.645,.045,.355,1);`;
    } else if (!fixBg && isMobile()) {
        let scale = 616 / window.innerWidth;
        document.getElementById('wallpaper').style = `transform: scale(${scale}) translateY(1.2rem)`;
    }
    fixBg = true;
}

function updateText(titles) {
    let idx,titleOffset;

    if (isMobile()) {
        idx = parseInt(document.documentElement.scrollTop / caseBox.HEIGHT_MB, 10);
        titleOffset = titles[idx].getBoundingClientRect().top - 70;
    } else {
        idx = parseInt(document.documentElement.scrollTop / caseBox.HEIGHT_PC, 10);
        titleOffset = titles[idx].getBoundingClientRect().top - 110;
    }

    if (titleOffset < 0) {
        titles[idx].style = `opacity: ${1 + 0.012 * titleOffset}`;
    } else {
        titles[idx].style = 'opacity: 1';
    }
}

function updateProgressBar(marks) {
    if (isMobile()) {
        return;
    }
    let idx = parseInt((document.documentElement.scrollTop + window.innerHeight / 2 - 100) / caseBox.HEIGHT_PC, 10);

    for (let i = 0; i< marks.length; i++) {
        if (i === idx) {
            marks[idx].className = 'mark active';
            if (idx > 0)
                marks[idx-1].className = 'mark near';
        } else {
            marks[i].className = 'mark';
        }
    }
}

function skipTo(idx) {
    let anchorPoint = Number(idx * caseBox.HEIGHT_PC);
    window.scrollTo({
        top: anchorPoint + 258, 
        left: 0, 
        behavior: 'smooth'
    });
}

function attachCase(idx) {
    if (!trigger) {
        return;
    }
    skipTo(idx)
    trigger = false;
}

function handlePageNav() {
    var pathname = location.pathname;
    if(!(pathname.indexOf('/docs') == 0 && pathname.indexOf('/docs/faq') != 0)){
        return;
    }
    let pgnav = document.getElementsByClassName('onPageNav')[0];
    let mainContainer = document.getElementsByClassName('mainContainer')[0];
    let leftBounding = mainContainer.getBoundingClientRect().left + mainContainer.clientWidth + 140;
    let right = window.innerWidth - leftBounding - pgnav.clientWidth;
    pgnav.style.right = `${right}px`;
}

function processVideo() {
    //监听 WeixinJSBridge 是否存在
    if (
        typeof WeixinJSBridge == "object" &&
        typeof WeixinJSBridge.invoke == "function"
    ) {
        playVideo();
    } else {
        //监听客户端抛出事件"WeixinJSBridgeReady"
        if (document.addEventListener) {
            document.addEventListener(
                "WeixinJSBridgeReady",
                function() {
                    playVideo();
                },
                false
            );
        } else if (document.attachEvent) {
            document.attachEvent("WeixinJSBridgeReady", function() {
                playVideo();
            });
            document.attachEvent("onWeixinJSBridgeReady", function() {
                playVideo();
            });
        }
    }
}

function playVideo() {
    videos = document.getElementsByTagName("video");
    for (let i = 0; i < videos.length; i++) {
        videos[i].play();
    }
    console.log("WeixinJSBridgeReady.");
}

function changeStyle(action) {
    let videos = document.getElementsByClassName('video');
    for (let i = 0; i < videos.length; i++) {
        switch (action) {
            case 'add':
                let caseWrappers = document.getElementsByClassName('caseWrapper');
                for (let j = 0; j < caseWrappers.length; j++) {
                    caseWrappers[j].style.margin = 'calc(50vh - 250px) auto 0 auto';
                }
                document.getElementById('arrowTip').style.display = 'block';
                videos[i].classList.add('wechat');
                break;
            case 'remove':
                videos[i].classList.remove('wechat');
                videos[i].style = 'transition: all 2.8s cubic-bezier(.645,.045,.355,1)';
                setTimeout(()=>{document.getElementById('arrowTip').style.display = 'none'}, 500);
                break;
        }
        
    }
}

function isWeChatContext() {
    let ua = window.navigator.userAgent.toLowerCase();
    if (ua.indexOf('micromessenger') != (-1)) {
        return true;
    }
    return false;
}

function fitFrame() {
    let pathname = location.pathname;
    if(pathname.indexOf('/docs/apis-android') == 0 || pathname.indexOf('/docs/apis-ios') == 0 ||pathname.indexOf('/docs/apis-web') == 0) {
        var iframe = document.getElementsByTagName('iframe')[0];
        let width = window.innerWidth
        let height = window.innerHeight;
        if(isMobile()) {
            iframe.style = `width: ${width}px; height: ${height}px; background-color: white; padding: 80px 0; position: fixed; top: 0; left: 0; margin-top: 50px; z-index: 9999`;
            return;
        }
        iframe.style = `width: ${width}px; height: ${height}px; background-color: white; padding: 80px 160px 0 160px; position: fixed; top: 0; left: 0; z-index: 9999`;
    }
}

let PAG;
let pagView;
let pagFile;
let hadPAGView = false;
let playerCanvas;

const initPlayer =async () => {
    // 实例化 PAG
    PAG = await window.libpag.PAGInit();
    if (isFirefox) {
        if (await loadJS("https://cdn.jsdelivr.net/npm/ffavc@latest/lib/ffavc.min.js")) {
            const FFAVC = await window.ffavc.FFAVCInit();
            const ffavcDecoderFactory = new FFAVC.FFAVCDecoderFactory();
            PAG.registerSoftwareDecoderFactory(ffavcDecoderFactory);
        } else {
            console.error('Load ffavc fail!');
        }
    }

    playerCanvas = document.getElementById('player-canvas');
    if(isMobile()) {
        playerCanvas.width = 300;
        playerCanvas.height = 300;
    }
    document.getElementById('player-btn-load').addEventListener('click', () =>{
        document.getElementById('player-input-load').click();
    })
    document.getElementById('player-input-load').addEventListener('change', (event) =>{
        if(event.target) {
            createPAGView(event.target.files[0]);
        }
    })
}

const createPAGView = async (file) => {
    // 清除提示
    if (!hadPAGView) {
        hadPAGView = true;
        document.getElementById('player-tip').style.display = 'none'
    }
    // 清除上一个 PAG 相关的资源
    if (pagFile) pagFile.destroy();
    if (pagView) pagView.destroy();
    pagFile = await PAG.PAGFile.load(file);
    pagView = await PAG.PAGView.init(pagFile, playerCanvas);
    pagView.setRepeatCount(0);
    await pagView.play();
}

const addDragListener = () => {
    document.addEventListener('dragenter', (ev) => {
        if (location.pathname.indexOf('/player.html') == 0) return;
        if (ev.dataTransfer.items.length> 0) {
            if (ev.dataTransfer.items[0].kind === 'file') {
                location.replace(`${location.origin}/player.html`); 
            }
        }
    })
}

const addDropListener = () => {
    document.addEventListener('dragover', (ev) => {
        ev.preventDefault();
    })
    document.addEventListener('drop', (ev) => {
        ev.preventDefault();
        if (ev.dataTransfer.files.length>0) {
            if(/\.(pag)$/.test(ev.dataTransfer.files[0].name)) {
                createPAGView(ev.dataTransfer.files[0]);
                return;
            }
        } 
        alert('请放入PAG文件进行预览！');
    })
}

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
