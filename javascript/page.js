
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

window.onload = async () => {
    // PAG -> Canvas
    const options = {
        repeatCount: 0,
        renderingMode: 'WebGL',
        scaleMode: 'LetterBox',
    }
    const canvases = document.getElementsByClassName('pagView');
    for (let i = 0; i< canvases.length; i++) {
        canvases[i].width = canvases[i].clientWidth;
        canvases[i].height = canvases[i].height * canvases[i].clientWidth / canvases[i].width;
        const mp4Data = await PAG.PAGFile.loadFile(`../pag/${i+1}.pag`);
        const pagView = await PAG.PAGView.create(mp4Data, canvases[i], options);
        await pagView.play();
        setTimeout(() => {canvases[i].style.visibility = 'visible'}, 50);
        
    }
}

window.onresize = () => {
    addInteractEffect();
    handlePageNav();
    var pathname = location.pathname;
    if(pathname.indexOf('/docs/apis-android') == 0 || pathname.indexOf('/docs/apis-ios') == 0 ||pathname.indexOf('/docs/apis-web') == 0) {
        var iframe = document.getElementsByTagName('iframe')[0];
        let width = window.innerWidth
        let height = window.innerHeight;
        iframe.style = `width: ${width}px; height: ${height}px; background-color: white; padding: 80px 160px 0 160px; position: fixed; top: 0; left: 0; z-index: 9`;
    }
}


let isAndroid = () => {
    return /(Android).*?([\d.]+)/i.test(navigator.userAgent) || /(Adr)\s+([\d.]+)/i.test(navigator.userAgent);
};
let isIOS = () => {
    return /(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)
    // return /(iPhone\sOS)\s([\d_]+)/i.test(navigator.userAgent);
};
let isMobile = () => isAndroid() || isIOS();
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

docReady(()=>{
    // 案例展示版块动态交互效果
    addInteractEffect();
    // SEO
    appendSEOMeta()

    if(isMobile()){
        var html = document.getElementsByTagName("html")[0]; html.style.fontSize =
        Math.min(  document.documentElement.clientWidth / 375 * 75 ,80) + "px";
        document.body.classList.add('mobile-mode')
        appendMeta();
        if(isIndexPage()){
            document.body.style.backgroundImage = "url('/img/new_official_website/bg_m.png')"
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
            document.body.style.backgroundImage = "url('/img/new_official_website/fill1.png')"
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
        nav.children[0].children[5].children[0].onmouseover = () => {
            nav.children[0].children[5].children[0].classList.add('hover');
        }
        nav.children[0].children[6].children[0].onmouseover = () => {
            nav.children[0].children[6].children[0].classList.add('hover');
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
    ];

    function isDevDoc(path) {
        for (let i = 0; i < devDocRoutes.length; i++) {
            if (path.indexOf(devDocRoutes[i]) != (-1)) {
                return true;
            }
        }
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
        let logo = document.createElement('div');
        logo.id = 'faqLogo'
        if (isMobile()) {
            document.getElementById('faq').style= `width: inherit; margin: 0`;
            document.getElementsByClassName('docMainWrapper')[0].style.width = `${window.innerWidth}px`;
            document.getElementsByClassName('mobile-mode')[0].appendChild(logo);

        } else {
            document.getElementsByClassName('docMainWrapper')[0].style = 'position: relative; top: 20px; left: 50%; margin-left: -350px; padding-bottom: 360px;'
            document.getElementsByClassName('pc-mode')[0].appendChild(logo);
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
        // console.log("document.documentElement.scrollTop: " + document.documentElement.scrollTop)
        // 进度条更新
        updateProgressBar(marks);
        // 背景更新
        updateBg(fixBg);
        // 标题渐隐
        updateText(titles);  
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
        document.getElementById('wallpaper').style = `transform: scale(1.62) translate(${offsetX}px, ${offsetY}px)`;
    } else if (!fixBg && isMobile()) {
        let scale = 616 / window.innerWidth;
        document.getElementById('wallpaper').style = `transform: scale(${scale}) translateY(0.8rem)`;
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