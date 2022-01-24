/////////////////////////////////////////////////////////////////////////////////////////////////
//
//  Tencent is pleased to support the open source community by making libpag available.
//
//  Copyright (C) 2021 THL A29 Limited, a Tencent company. All rights reserved.
//
//  Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file
//  except in compliance with the License. You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
//  unless required by applicable law or agreed to in writing, software distributed under the
//  license is distributed on an "as is" basis, without warranties or conditions of any kind,
//  either express or implied. see the license for the specific language governing permissions
//  and limitations under the license.
//
/////////////////////////////////////////////////////////////////////////////////////////////////

var ErrorCode;
(function(ErrorCode2) {
  ErrorCode2[ErrorCode2["PagFileDataEmpty"] = 0] = "PagFileDataEmpty";
  ErrorCode2[ErrorCode2["PagFontDataEmpty"] = 1] = "PagFontDataEmpty";
  ErrorCode2[ErrorCode2["PagImageDataEmpty"] = 2] = "PagImageDataEmpty";
  ErrorCode2[ErrorCode2["VideoReaderUndefined"] = 3] = "VideoReaderUndefined";
  ErrorCode2[ErrorCode2["VideoReaderHeadersExisted"] = 4] = "VideoReaderHeadersExisted";
  ErrorCode2[ErrorCode2["VideoReaderH264HeaderError"] = 5] = "VideoReaderH264HeaderError";
  ErrorCode2[ErrorCode2["NaluEmpty"] = 6] = "NaluEmpty";
  ErrorCode2[ErrorCode2["FrameEmpty"] = 7] = "FrameEmpty";
  ErrorCode2[ErrorCode2["ImageCodecUndefined"] = 8] = "ImageCodecUndefined";
  ErrorCode2[ErrorCode2["FontNamesUnloaded"] = 9] = "FontNamesUnloaded";
  ErrorCode2[ErrorCode2["UnsupportCanvas2D"] = 10] = "UnsupportCanvas2D";
})(ErrorCode || (ErrorCode = {}));
const ErrorMap = {
  [0]: "Initialize PAGFile data not be empty!",
  [1]: "Initialize PAGFont data not be empty!",
  [2]: "Initialize PAGImage data not be empty!",
  [3]: "Video reader instance undefined!",
  [4]: "Video reader headers is existed!",
  [5]: "Video reader headers need has sps and pps!",
  [6]: "Nal units not be empty\uFF01",
  [7]: "Frames not be empty\uFF01",
  [8]: "Image codec instance undefined!",
  [9]: "Target fontNames unloaded!",
  [10]: "Unsupport Canvas2D!"
};

class Log {
  static log(message) {
    console.log(message);
  }
  static error(error) {
    throw new Error(error);
  }
  static errorByCode(errorCode) {
    throw new Error(ErrorMap[errorCode]);
  }
}

const readFile = (file) => new Promise((resolve) => {
  const reader = new FileReader();
  reader.onload = () => {
    resolve(reader.result);
  };
  reader.onerror = () => {
    Log.error(reader.error.message);
  };
  reader.readAsArrayBuffer(file);
});
const concatUint8Arrays = (arrays) => {
  let totalLength = 0;
  for (const arr of arrays) {
    totalLength += arr.byteLength;
  }
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.byteLength;
  }
  return result;
};

const nav = navigator.userAgent;
const ANDROID = /android|adr/i.test(nav);
const MOBILE = /(mobile)/i.test(nav) && ANDROID;
!(/(mobile)/i.test(nav) || MOBILE) && /Mac OS X/i.test(nav);
/(iphone|ipad|ipod)/i.test(nav);

class PAGFont {
  static async registerFont(family, data) {
    const buffer = await readFile(data);
    if (!buffer || !(buffer.byteLength > 0))
      Log.errorByCode(ErrorCode.PagFontDataEmpty);
    const dataUint8Array = new Uint8Array(buffer);
    const fontFace = new FontFace(family, dataUint8Array);
    await fontFace.load();
  }
  static registerFallbackFontNames() {
    const fontNames = ["emoji"];
    const names = new this.module.VectorString();
    for (const name of fontNames) {
      names.push_back(name);
    }
    this.module.setFallbackFontNames(names);
    names.delete();
  }
  static async loadFont(fontFamily, BinaryData) {
    const font = new FontFace(fontFamily, BinaryData);
    await font.load();
    document.fonts.add(font);
    return fontFamily;
  }
}

class PAGLayer {
  constructor(wasmIns) {
    this.wasmIns = wasmIns;
  }
  async uniqueID() {
    return await PAGLayer.module.webAssemblyQueue.exec(this.wasmIns._uniqueID, this.wasmIns);
  }
  async layerType() {
    return await PAGLayer.module.webAssemblyQueue.exec(this.wasmIns._layerType, this.wasmIns);
  }
  async layerName() {
    return await PAGLayer.module.webAssemblyQueue.exec(this.wasmIns._layerName, this.wasmIns);
  }
  async opacity() {
    return await PAGLayer.module.webAssemblyQueue.exec(this.wasmIns._opacity, this.wasmIns);
  }
  async setOpacity(opacity) {
    await PAGLayer.module.webAssemblyQueue.exec(this.wasmIns._opacity, this.wasmIns, opacity);
  }
  async visible() {
    return await PAGLayer.module.webAssemblyQueue.exec(this.wasmIns._visible, this.wasmIns);
  }
  async setVisible(visible) {
    await PAGLayer.module.webAssemblyQueue.exec(this.wasmIns._setVisible, this.wasmIns, visible);
  }
  async editableIndex() {
    return await PAGLayer.module.webAssemblyQueue.exec(this.wasmIns._editableIndex, this.wasmIns);
  }
  async duration() {
    return await PAGLayer.module.webAssemblyQueue.exec(this.wasmIns._duration, this.wasmIns);
  }
  async frameRate() {
    return await PAGLayer.module.webAssemblyQueue.exec(this.wasmIns._frameRate, this.wasmIns);
  }
  async startTime() {
    return await PAGLayer.module.webAssemblyQueue.exec(this.wasmIns._startTime, this.wasmIns);
  }
  async localTimeToGlobal(localTime) {
    return await PAGLayer.module.webAssemblyQueue.exec(this.wasmIns._localTimeToGlobal, this.wasmIns, localTime);
  }
  async globalToLocalTime(globalTime) {
    return await PAGLayer.module.webAssemblyQueue.exec(this.wasmIns._globalToLocalTime, this.wasmIns, globalTime);
  }
  async destroy() {
    await PAGLayer.module.webAssemblyQueue.exec(this.wasmIns.delete, this.wasmIns);
  }
}

class PAGComposition extends PAGLayer {
  constructor(wasmIns) {
    super(wasmIns);
  }
  async width() {
    return await PAGComposition.module.webAssemblyQueue.exec(this.wasmIns._width, this.wasmIns);
  }
  async height() {
    return await PAGComposition.module.webAssemblyQueue.exec(this.wasmIns._height, this.wasmIns);
  }
}

class NativeImage {
  static async createFromBytes(bytes) {
    const blob = new Blob([bytes], { type: "image/*" });
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = function() {
        resolve(new NativeImage(image));
      };
      image.src = URL.createObjectURL(blob);
    });
  }
  constructor(source) {
    this.source = source;
  }
  width() {
    return this.source instanceof HTMLVideoElement ? this.source.videoWidth : this.source.width;
  }
  height() {
    return this.source instanceof HTMLVideoElement ? this.source.videoHeight : this.source.height;
  }
  upload(GL) {
    const gl = GL.currentContext.GLctx;
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.source);
  }
}

class PAGImage {
  static async fromFile(data) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = async () => {
        resolve(await PAGImage.fromSource(image));
      };
      image.onerror = (error) => {
        reject(error);
      };
      image.src = URL.createObjectURL(data);
    });
  }
  static async fromSource(source) {
    const nativeImage = new NativeImage(source);
    return this.module._PAGImage.FromNativeImage(nativeImage);
  }
  constructor(pagImageWasm) {
    this.pagImageWasm = pagImageWasm;
  }
  async width() {
    return await PAGImage.module.webAssemblyQueue.exec(this.pagImageWasm._width, this.pagImageWasm);
  }
  async height() {
    return await PAGImage.module.webAssemblyQueue.exec(this.pagImageWasm._height, this.pagImageWasm);
  }
  async destroy() {
    await PAGImage.module.webAssemblyQueue.exec(this.pagImageWasm.delete, this.pagImageWasm);
  }
}

class PAGFile extends PAGComposition {
  static async load(data) {
    const buffer = await readFile(data);
    if (!buffer || !(buffer.byteLength > 0))
      Log.errorByCode(ErrorCode.PagFileDataEmpty);
    const dataUint8Array = new Uint8Array(buffer);
    const numBytes = dataUint8Array.byteLength * dataUint8Array.BYTES_PER_ELEMENT;
    const dataPtr = this.module._malloc(numBytes);
    const dataOnHeap = new Uint8Array(this.module.HEAPU8.buffer, dataPtr, numBytes);
    dataOnHeap.set(dataUint8Array);
    const pagFile = await this.module._PAGFile.Load(dataOnHeap.byteOffset, dataOnHeap.length);
    this.module._free(dataPtr);
    return pagFile;
  }
  constructor(wasmIns) {
    super(wasmIns);
  }
  async getTextData(editableTextIndex) {
    return await PAGFile.module.webAssemblyQueue.exec(this.wasmIns._getTextData, this.wasmIns, editableTextIndex);
  }
  async replaceText(editableTextIndex, textData) {
    await PAGFile.module.webAssemblyQueue.exec(this.wasmIns._replaceText, this.wasmIns, editableTextIndex, textData);
  }
  async replaceImage(editableImageIndex, pagImage) {
    await PAGFile.module.webAssemblyQueue.exec(this.wasmIns._replaceImage, this.wasmIns, editableImageIndex, pagImage.pagImageWasm);
  }
  async duration() {
    return await PAGFile.module.webAssemblyQueue.exec(this.wasmIns._duration, this.wasmIns);
  }
  async numTexts() {
    return await PAGFile.module.webAssemblyQueue.exec(this.wasmIns._numTexts, this.wasmIns);
  }
  async numImages() {
    return await PAGFile.module.webAssemblyQueue.exec(this.wasmIns._numImages, this.wasmIns);
  }
  async numVideos() {
    return await PAGFile.module.webAssemblyQueue.exec(this.wasmIns._numVideos, this.wasmIns);
  }
  async getLayersByEditableIndex(editableIndex, layerType) {
    return await PAGFile.module.webAssemblyQueue.exec(this.wasmIns._getLayersByEditableIndex, this.wasmIns, editableIndex, layerType);
  }
  async timeStretchMode() {
    return await PAGFile.module.webAssemblyQueue.exec(this.wasmIns._timeStretchMode, this.wasmIns);
  }
  async setTimeStretchMode(value) {
    await PAGFile.module.webAssemblyQueue.exec(this.wasmIns._setTimeStretchMode, this.wasmIns, value);
  }
  async setDuration(duration) {
    await PAGFile.module.webAssemblyQueue.exec(this.wasmIns._setDuration, this.wasmIns, duration);
  }
  async destroy() {
    await PAGImage.module.webAssemblyQueue.exec(this.wasmIns.delete, this.wasmIns);
  }
}

class PAGSurface {
  constructor(module, pagSurfaceWasm) {
    this.module = module;
    this.pagSurfaceWasm = pagSurfaceWasm;
  }
  async width() {
    return await this.module.webAssemblyQueue.exec(this.pagSurfaceWasm._width, this.pagSurfaceWasm);
  }
  async height() {
    return await this.module.webAssemblyQueue.exec(this.pagSurfaceWasm._height, this.pagSurfaceWasm);
  }
  async updateSize() {
    return await this.module.webAssemblyQueue.exec(this.pagSurfaceWasm._updateSize, this.pagSurfaceWasm);
  }
  async destroy() {
    await this.module.webAssemblyQueue.exec(this.pagSurfaceWasm.delete, this.pagSurfaceWasm);
  }
}

class PAGPlayer {
  static create() {
    return this.module._PAGPlayer.create();
  }
  constructor(pagPlayerWasm) {
    this.pagPlayerWasm = pagPlayerWasm;
  }
  async setProgress(progress) {
    return await PAGPlayer.module.webAssemblyQueue.exec(this.pagPlayerWasm._setProgress, this.pagPlayerWasm, progress);
  }
  async flush() {
    return await PAGPlayer.module.webAssemblyQueue.exec(this.pagPlayerWasm._flush, this.pagPlayerWasm);
  }
  async setProgressAndFlush(progress) {
    return await PAGPlayer.module.webAssemblyQueue.exec(async (progress2) => {
      this.pagPlayerWasm._setProgress(progress2);
      return await this.pagPlayerWasm._flush();
    }, this, progress);
  }
  async duration() {
    return await PAGPlayer.module.webAssemblyQueue.exec(this.pagPlayerWasm._duration, this.pagPlayerWasm);
  }
  async getProgress() {
    return await PAGPlayer.module.webAssemblyQueue.exec(this.pagPlayerWasm._getProgress, this.pagPlayerWasm);
  }
  async videoEnabled() {
    return await PAGPlayer.module.webAssemblyQueue.exec(this.pagPlayerWasm._videoEnabled, this.pagPlayerWasm);
  }
  async setVideoEnabled(enabled) {
    return await PAGPlayer.module.webAssemblyQueue.exec(this.pagPlayerWasm._setVideoEnabled, this.pagPlayerWasm, enabled);
  }
  async cacheEnabled() {
    return await PAGPlayer.module.webAssemblyQueue.exec(this.pagPlayerWasm._cacheEnabled, this.pagPlayerWasm);
  }
  async setCacheEnabled(enabled) {
    return await PAGPlayer.module.webAssemblyQueue.exec(this.pagPlayerWasm._setCacheEnabled, this.pagPlayerWasm, enabled);
  }
  async cacheScale() {
    return await PAGPlayer.module.webAssemblyQueue.exec(this.pagPlayerWasm._cacheScale, this.pagPlayerWasm);
  }
  async setCacheScale(value) {
    return await PAGPlayer.module.webAssemblyQueue.exec(this.pagPlayerWasm._setCacheScale, this.pagPlayerWasm, value);
  }
  async maxFrameRate() {
    return await PAGPlayer.module.webAssemblyQueue.exec(this.pagPlayerWasm._maxFrameRate, this.pagPlayerWasm);
  }
  async setMaxFrameRate(value) {
    return await PAGPlayer.module.webAssemblyQueue.exec(this.pagPlayerWasm._setMaxFrameRate, this.pagPlayerWasm, value);
  }
  async scaleMode() {
    return await PAGPlayer.module.webAssemblyQueue.exec(this.pagPlayerWasm._scaleMode, this.pagPlayerWasm);
  }
  async setScaleMode(value) {
    return await PAGPlayer.module.webAssemblyQueue.exec(this.pagPlayerWasm._setScaleMode, this.pagPlayerWasm, value);
  }
  async freeCache() {
    return await PAGPlayer.module.webAssemblyQueue.exec(this.pagPlayerWasm._freeCache, this.pagPlayerWasm);
  }
  async setSurface(pagSurface) {
    return await PAGPlayer.module.webAssemblyQueue.exec(this.pagPlayerWasm._setSurface, this.pagPlayerWasm, pagSurface.pagSurfaceWasm);
  }
  async getComposition() {
    const wasmIns = await PAGPlayer.module.webAssemblyQueue.exec(this.pagPlayerWasm._getComposition, this.pagPlayerWasm);
    return new PAGFile(wasmIns);
  }
  async setComposition(pagFile) {
    return await PAGPlayer.module.webAssemblyQueue.exec(this.pagPlayerWasm._setComposition, this.pagPlayerWasm, pagFile.wasmIns);
  }
  async destroy() {
    await PAGPlayer.module.webAssemblyQueue.exec(this.pagPlayerWasm.delete, this.pagPlayerWasm);
  }
}

var PAGScaleMode;
(function(PAGScaleMode2) {
  PAGScaleMode2[PAGScaleMode2["None"] = 0] = "None";
  PAGScaleMode2[PAGScaleMode2["Stretch"] = 1] = "Stretch";
  PAGScaleMode2[PAGScaleMode2["LetterBox"] = 2] = "LetterBox";
  PAGScaleMode2[PAGScaleMode2["Zoom"] = 3] = "Zoom";
})(PAGScaleMode || (PAGScaleMode = {}));
var PAGViewListenerEvent;
(function(PAGViewListenerEvent2) {
  PAGViewListenerEvent2["onAnimationStart"] = "onAnimationStart";
  PAGViewListenerEvent2["onAnimationEnd"] = "onAnimationEnd";
  PAGViewListenerEvent2["onAnimationCancel"] = "onAnimationCancel";
  PAGViewListenerEvent2["onAnimationRepeat"] = "onAnimationRepeat";
})(PAGViewListenerEvent || (PAGViewListenerEvent = {}));
var ParagraphJustification;
(function(ParagraphJustification2) {
  ParagraphJustification2[ParagraphJustification2["LeftJustify"] = 0] = "LeftJustify";
  ParagraphJustification2[ParagraphJustification2["CenterJustify"] = 1] = "CenterJustify";
  ParagraphJustification2[ParagraphJustification2["RightJustify"] = 2] = "RightJustify";
  ParagraphJustification2[ParagraphJustification2["FullJustifyLastLineLeft"] = 3] = "FullJustifyLastLineLeft";
  ParagraphJustification2[ParagraphJustification2["FullJustifyLastLineRight"] = 4] = "FullJustifyLastLineRight";
  ParagraphJustification2[ParagraphJustification2["FullJustifyLastLineCenter"] = 5] = "FullJustifyLastLineCenter";
  ParagraphJustification2[ParagraphJustification2["FullJustifyLastLineFull"] = 6] = "FullJustifyLastLineFull";
})(ParagraphJustification || (ParagraphJustification = {}));
var TextDirection;
(function(TextDirection2) {
  TextDirection2[TextDirection2["Default"] = 0] = "Default";
  TextDirection2[TextDirection2["Horizontal"] = 1] = "Horizontal";
  TextDirection2[TextDirection2["Vertical"] = 2] = "Vertical";
})(TextDirection || (TextDirection = {}));
var LayerType;
(function(LayerType2) {
  LayerType2[LayerType2["Unknown"] = 0] = "Unknown";
  LayerType2[LayerType2["Null"] = 1] = "Null";
  LayerType2[LayerType2["Solid"] = 2] = "Solid";
  LayerType2[LayerType2["Text"] = 3] = "Text";
  LayerType2[LayerType2["Shape"] = 4] = "Shape";
  LayerType2[LayerType2["Image"] = 5] = "Image";
  LayerType2[LayerType2["PreCompose"] = 6] = "PreCompose";
})(LayerType || (LayerType = {}));
var PAGTimeStretchMode;
(function(PAGTimeStretchMode2) {
  PAGTimeStretchMode2[PAGTimeStretchMode2["None"] = 0] = "None";
  PAGTimeStretchMode2[PAGTimeStretchMode2["Scale"] = 1] = "Scale";
  PAGTimeStretchMode2[PAGTimeStretchMode2["Repeat"] = 2] = "Repeat";
  PAGTimeStretchMode2[PAGTimeStretchMode2["RepeatInverted"] = 3] = "RepeatInverted";
})(PAGTimeStretchMode || (PAGTimeStretchMode = {}));

class EventManager {
  constructor() {
    this.listenersMap = {};
  }
  on(eventName, listener) {
    if (this.listenersMap[eventName] === void 0) {
      this.listenersMap[eventName] = [];
    }
    this.listenersMap[eventName].push(listener);
    return;
  }
  off(eventName, listener) {
    const listenerList = this.listenersMap[eventName];
    if (listenerList === void 0)
      return;
    if (listener === void 0) {
      delete this.listenersMap[eventName];
      return;
    }
    const index = listenerList.findIndex((fn) => fn === listener);
    listenerList.splice(index, 1);
    return;
  }
  emit(eventName, ...payload) {
    const listenerList = this.listenersMap[eventName];
    if (listenerList === void 0 || listenerList.length < 1)
      return false;
    for (const listener of listenerList) {
      listener(...payload);
    }
    return true;
  }
}

class PAGView {
  constructor(pagPlayer) {
    this.repeatCount = 0;
    this.isPlaying = false;
    this.isDestroyed = false;
    this.startTime = 0;
    this.playTime = 0;
    this.timer = null;
    this.repeatedTimes = 0;
    this.eventManager = null;
    this.player = pagPlayer;
  }
  static async init(file, canvas) {
    let canvasElement;
    if (typeof canvas === "string") {
      canvasElement = document.getElementById(canvas.substr(1));
    } else if (canvas instanceof HTMLCanvasElement) {
      canvasElement = canvas;
    }
    canvasElement.style.width = `${canvasElement.width}px`;
    canvasElement.style.height = `${canvasElement.height}px`;
    canvasElement.width = canvasElement.width * window.devicePixelRatio;
    canvasElement.height = canvasElement.height * window.devicePixelRatio;
    const pagPlayer = await this.module._PAGPlayer.create();
    const pagView = new PAGView(pagPlayer);
    const gl = canvasElement.getContext("webgl");
    const contextID = this.module.GL.registerContext(gl, { majorVersion: 1, minorVersion: 0 });
    this.module.GL.makeContextCurrent(contextID);
    pagView.pagSurface = await this.module._PAGSurface.FromFrameBuffer(0, canvasElement.width, canvasElement.height, true);
    pagView.player.setSurface(pagView.pagSurface);
    pagView.player.setComposition(file);
    await pagView.setProgress(0);
    pagView.eventManager = new EventManager();
    return pagView;
  }
  async duration() {
    return await this.player.duration();
  }
  addListener(eventName, listener) {
    return this.eventManager.on(eventName, listener);
  }
  removeListener(eventName, listener) {
    return this.eventManager.off(eventName, listener);
  }
  async play() {
    if (this.isPlaying || this.isDestroyed)
      return;
    if (this.playTime === 0) {
      this.eventManager.emit(PAGViewListenerEvent.onAnimationStart, this);
    }
    this.isPlaying = true;
    this.startTime = Date.now() * 1e3 - this.playTime;
    await this.flushLoop();
  }
  pause() {
    if (!this.isPlaying || this.isDestroyed)
      return;
    this.clearTimer();
    this.isPlaying = false;
  }
  async stop(notification = true) {
    if (this.isDestroyed)
      return;
    this.clearTimer();
    this.playTime = 0;
    await this.player.setProgress(0);
    await this.flush();
    this.isPlaying = false;
    if (notification) {
      this.eventManager.emit(PAGViewListenerEvent.onAnimationCancel, this);
    }
  }
  setRepeatCount(repeatCount) {
    this.repeatCount = repeatCount < 0 ? 0 : repeatCount - 1;
  }
  async getProgress() {
    return await this.player.getProgress();
  }
  async setProgress(progress) {
    this.playTime = progress * await this.duration();
    this.startTime = Date.now() * 1e3 - this.playTime;
    if (!this.isPlaying) {
      await this.player.setProgressAndFlush(progress);
    }
    return progress;
  }
  async videoEnabled() {
    return await this.player.videoEnabled();
  }
  async setVideoEnabled(enable) {
    await this.player.setVideoEnabled(enable);
  }
  async cacheEnabled() {
    return await this.player.cacheEnabled();
  }
  async setCacheEnabled(enable) {
    await this.player.setCacheEnabled(enable);
  }
  async cacheScale() {
    return await this.player.cacheScale();
  }
  async setCacheScale(value) {
    await this.player.setCacheScale(value);
  }
  async maxFrameRate() {
    return await this.player.maxFrameRate();
  }
  async setMaxFrameRate(value) {
    await this.player.setMaxFrameRate(value);
  }
  async scaleMode() {
    return await this.player.scaleMode();
  }
  async setScaleMode(value) {
    await this.player.setScaleMode(value);
  }
  async flush() {
    await this.player.flush();
  }
  async freeCache() {
    await this.player.freeCache();
  }
  async getComposition() {
    return await this.player.getComposition();
  }
  async updateSize() {
    return this.pagSurface.updateSize();
  }
  async destroy() {
    if (this.isDestroyed)
      return;
    this.clearTimer();
    await this.player.destroy();
    await this.pagSurface.destroy();
    this.isDestroyed = true;
  }
  async flushLoop() {
    if (!this.isPlaying) {
      return;
    }
    this.timer = window.requestAnimationFrame(async () => {
      await this.flushLoop();
    });
    await this.flushNextFrame();
  }
  async flushNextFrame() {
    const duration = await this.duration();
    const count = Math.floor(this.playTime / duration);
    if (this.repeatCount >= 0 && count > this.repeatCount) {
      await this.stop(false);
      this.eventManager.emit(PAGViewListenerEvent.onAnimationEnd, this);
    } else {
      if (this.repeatedTimes < count) {
        this.eventManager.emit(PAGViewListenerEvent.onAnimationRepeat, this);
      }
      this.playTime = Date.now() * 1e3 - this.startTime;
      await this.player.setProgressAndFlush(this.playTime % duration / duration);
    }
    this.repeatedTimes = count;
  }
  clearTimer() {
    if (this.timer) {
      window.cancelAnimationFrame(this.timer);
      this.timer = null;
    }
  }
}

const VIDEO_DECODE_WAIT_FRAME = 3;
const NALU_HEADER_LENGTH = 4;

class ExpGolomb {
  constructor(data) {
    this.data = data;
    this.index = 0;
    this.bitLength = data.byteLength * 8;
  }
  get bitsAvailable() {
    return this.bitLength - this.index;
  }
  readBits(size, moveIndex = true) {
    const result = this.getBits(size, this.index, moveIndex);
    return result;
  }
  skipLZ() {
    let leadingZeroCount;
    for (leadingZeroCount = 0; leadingZeroCount < this.bitLength - this.index; ++leadingZeroCount) {
      if (this.getBits(1, this.index + leadingZeroCount, false) !== 0) {
        this.index += leadingZeroCount;
        return leadingZeroCount;
      }
    }
    return leadingZeroCount;
  }
  readUEG() {
    const prefix = this.skipLZ();
    return this.readBits(prefix + 1) - 1;
  }
  readUByte(numberOfBytes = 1) {
    return this.readBits(numberOfBytes * 8);
  }
  getBits(size, offsetBits, moveIndex = true) {
    if (this.bitsAvailable < size) {
      return 0;
    }
    const offset = offsetBits % 8;
    const byte = this.data[offsetBits / 8 | 0] & 255 >>> offset;
    const bits = 8 - offset;
    if (bits >= size) {
      if (moveIndex) {
        this.index += size;
      }
      return byte >> bits - size;
    }
    if (moveIndex) {
      this.index += bits;
    }
    const nextSize = size - bits;
    return byte << nextSize | this.getBits(nextSize, offsetBits + bits, moveIndex);
  }
}

const _NALU = class {
  static get TYPES() {
    return {
      [_NALU.ndr]: "NDR",
      [_NALU.idr]: "IDR",
      [_NALU.sei]: "SEI",
      [_NALU.sps]: "SPS",
      [_NALU.pps]: "PPS",
      [_NALU.aud]: "AUD"
    };
  }
  static getNaluType(nalu) {
    if (nalu.nalUnitType in _NALU.TYPES) {
      return _NALU.TYPES[nalu.nalUnitType];
    }
    return "UNKNOWN";
  }
  constructor(data) {
    this.payload = data;
    this.nalRefIdc = (this.payload[0] & 96) >> 5;
    this.nalUnitType = this.payload[0] & 31;
    this.isVcl = this.nalUnitType === _NALU.ndr || this.nalUnitType === _NALU.idr;
    this.sliceType = 0;
    this.firstMbInSlice = false;
  }
  toString() {
    return `${_NALU.TYPES[this.nalUnitType]}: NRI: ${this.nalRefIdc}`;
  }
  isKeyframe() {
    return this.nalUnitType === _NALU.idr;
  }
  getPayloadSize() {
    return this.payload.byteLength;
  }
  getSize() {
    return 4 + this.getPayloadSize();
  }
  getData() {
    const result = new Uint8Array(this.getSize());
    const view = new DataView(result.buffer);
    view.setUint32(0, this.getSize() - 4);
    result.set(this.payload, 4);
    return result;
  }
};
let NALU = _NALU;
NALU.ndr = 1;
NALU.idr = 5;
NALU.sei = 6;
NALU.sps = 7;
NALU.pps = 8;
NALU.aud = 9;

const getH264Frames = (nalus) => {
  if (nalus.length < 1)
    Log.errorByCode(ErrorCode.NaluEmpty);
  const frames = [];
  let units = [];
  let isKeyFrame = false;
  let isVcl = false;
  for (const nalu of nalus) {
    const unit = new NALU(nalu.subarray(NALU_HEADER_LENGTH));
    if (unit.nalUnitType === NALU.idr || unit.nalUnitType === NALU.ndr) {
      parseHeader(unit);
    }
    if (units.length && isVcl && (unit.firstMbInSlice || !unit.isVcl)) {
      frames.push({ units, isKeyFrame });
      units = [];
      isKeyFrame = false;
      isVcl = false;
    }
    units.push(unit);
    isKeyFrame = isKeyFrame || unit.isKeyframe();
    isVcl = isVcl || unit.isVcl;
  }
  if (units.length > 0) {
    if (isVcl) {
      frames.push({ units, isKeyFrame });
    } else {
      const last = frames.length - 1;
      frames[last].units = frames[last].units.concat(units);
    }
  }
  return frames;
};
const parseHeader = (nalu) => {
  const decoder = new ExpGolomb(nalu.payload);
  decoder.readUByte();
  nalu.firstMbInSlice = decoder.readUEG() === 0;
  nalu.sliceType = decoder.readUEG();
};

const CORRECTION_UTC = 2082873600;
const decimal2HexadecimalArray = (payload) => [
  payload >> 24,
  payload >> 16 & 255,
  payload >> 8 & 255,
  payload & 255
];
const getCharCode = (name) => [name.charCodeAt(0), name.charCodeAt(1), name.charCodeAt(2), name.charCodeAt(3)];
const _Mp4Generator = class {
  constructor() {
    this.types = {
      avc1: [],
      avcC: [],
      btrt: [],
      ctts: [],
      dinf: [],
      dref: [],
      edts: [],
      elst: [],
      esds: [],
      ftyp: [],
      hdlr: [],
      mdat: [],
      mdhd: [],
      mdia: [],
      mfhd: [],
      minf: [],
      moof: [],
      moov: [],
      mp4a: [],
      mvex: [],
      mvhd: [],
      sdtp: [],
      stbl: [],
      stco: [],
      stsc: [],
      stsd: [],
      stsz: [],
      stts: [],
      stss: [],
      tfdt: [],
      tfhd: [],
      traf: [],
      trak: [],
      trun: [],
      trex: [],
      tkhd: [],
      vmhd: [],
      smhd: []
    };
    Object.keys(this.types).forEach((type) => {
      if (Object.prototype.hasOwnProperty.call(this.types, type)) {
        this.types[type] = getCharCode(type);
      }
    });
    const dref = new Uint8Array([
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      12,
      117,
      114,
      108,
      32,
      0,
      0,
      0,
      1
    ]);
    this.dinf = _Mp4Generator.box(this.types.dinf, _Mp4Generator.box(this.types.dref, dref));
  }
  static box(type, ...payload) {
    let size = 8;
    let i = payload.length;
    const len = i;
    while (i) {
      i -= 1;
      size += payload[i].byteLength;
    }
    const result = new Uint8Array(size);
    result[0] = size >> 24 & 255;
    result[1] = size >> 16 & 255;
    result[2] = size >> 8 & 255;
    result[3] = size & 255;
    result.set(type, 4);
    for (i = 0, size = 8; i < len; ++i) {
      result.set(payload[i], size);
      size += payload[i].byteLength;
    }
    return result;
  }
  ftyp() {
    return _Mp4Generator.box(this.types.ftyp, new Uint8Array(getCharCode("isom")), new Uint8Array([0, 0, 0, 1]), new Uint8Array(getCharCode("isom")), new Uint8Array(getCharCode("iso2")), new Uint8Array(getCharCode("avc1")), new Uint8Array(getCharCode("mp41")));
  }
  moov(tracks, duration, timescale) {
    let i = tracks.length;
    const boxes = [];
    while (i) {
      i -= 1;
      boxes[i] = this.trak(tracks[i]);
    }
    return _Mp4Generator.box.apply(null, [this.types.moov, this.mvhd(timescale, duration)].concat(boxes).concat(this.mvex(tracks)));
  }
  moof(sequence_number, baseMediaDecodeTime, track) {
    return _Mp4Generator.box(this.types.moof, this.mfhd(sequence_number), this.traf(baseMediaDecodeTime, track));
  }
  mdat(data) {
    return _Mp4Generator.box(this.types.mdat, data);
  }
  hdlr(type) {
    return _Mp4Generator.box(this.types.hdlr, _Mp4Generator.hdlrTypes[type]);
  }
  mdhd(timescale, duration) {
    return _Mp4Generator.box(this.types.mdhd, new Uint8Array([
      0,
      0,
      0,
      0,
      ...decimal2HexadecimalArray(Math.floor(Date.now() / 1e3 + CORRECTION_UTC)),
      ...decimal2HexadecimalArray(Math.floor(Date.now() / 1e3 + CORRECTION_UTC)),
      ...decimal2HexadecimalArray(timescale),
      ...decimal2HexadecimalArray(duration),
      85,
      196,
      0,
      0
    ]));
  }
  mdia(track) {
    return _Mp4Generator.box(this.types.mdia, this.mdhd(track.timescale, track.duration), this.hdlr(track.type), this.minf(track));
  }
  mfhd(sequenceNumber) {
    return _Mp4Generator.box(this.types.mfhd, new Uint8Array([
      0,
      0,
      0,
      0,
      sequenceNumber >> 24,
      sequenceNumber >> 16 & 255,
      sequenceNumber >> 8 & 255,
      sequenceNumber & 255
    ]));
  }
  minf(track) {
    if (track.type === "audio") {
      return _Mp4Generator.box(this.types.minf, _Mp4Generator.box(this.types.smhd, _Mp4Generator.smhd), this.dinf, this.stbl(track));
    }
    return _Mp4Generator.box(this.types.minf, _Mp4Generator.box(this.types.vmhd, _Mp4Generator.vmhd), this.dinf, this.stbl(track));
  }
  mvex(tracks) {
    let i = tracks.length;
    const boxes = [];
    while (i) {
      i -= 1;
      boxes[i] = this.trex(tracks[i]);
    }
    return _Mp4Generator.box.apply(null, [this.types.mvex].concat(boxes));
  }
  mvhd(timescale, duration) {
    const bytes = new Uint8Array([
      0,
      0,
      0,
      0,
      ...decimal2HexadecimalArray(Math.floor(Date.now() / 1e3 + CORRECTION_UTC)),
      ...decimal2HexadecimalArray(Math.floor(Date.now() / 1e3 + CORRECTION_UTC)),
      ...decimal2HexadecimalArray(timescale),
      ...decimal2HexadecimalArray(duration),
      0,
      1,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      64,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      2
    ]);
    return _Mp4Generator.box(this.types.mvhd, bytes);
  }
  sdtp(track) {
    const samples = track.samples || [];
    const bytes = new Uint8Array(4 + samples.length);
    let flags;
    let i;
    for (i = 0; i < samples.length; i++) {
      flags = samples[i].flags;
      bytes[i + 4] = flags.dependsOn << 4 | flags.isDependedOn << 2 | flags.hasRedundancy;
    }
    return _Mp4Generator.box(this.types.sdtp, bytes);
  }
  stbl(track) {
    return _Mp4Generator.box(this.types.stbl, this.stsd(track), this.stts(track), this.ctts(track), this.stss(track), _Mp4Generator.box(this.types.stsc, _Mp4Generator.stsc), _Mp4Generator.box(this.types.stsz, _Mp4Generator.stsz), _Mp4Generator.box(this.types.stco, _Mp4Generator.stco));
  }
  avc1(track) {
    let sps = [];
    let pps = [];
    let i;
    let data;
    let len;
    for (i = 0; i < track.sps.length; i++) {
      data = track.sps[i];
      len = data.byteLength;
      sps.push(len >>> 8 & 255);
      sps.push(len & 255);
      sps = sps.concat(Array.prototype.slice.call(data));
    }
    for (i = 0; i < track.pps.length; i++) {
      data = track.pps[i];
      len = data.byteLength;
      pps.push(len >>> 8 & 255);
      pps.push(len & 255);
      pps = pps.concat(Array.prototype.slice.call(data));
    }
    const avcc = _Mp4Generator.box(this.types.avcC, new Uint8Array([
      1,
      sps[3],
      sps[4],
      sps[5],
      252 | 3,
      224 | track.sps.length
    ].concat(sps).concat([
      track.pps.length
    ]).concat(pps)));
    const { width } = track;
    const { height } = track;
    return _Mp4Generator.box(this.types.avc1, new Uint8Array([
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      width >> 8 & 255,
      width & 255,
      height >> 8 & 255,
      height & 255,
      0,
      72,
      0,
      0,
      0,
      72,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      18,
      98,
      105,
      110,
      101,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      24,
      255,
      255
    ]), avcc);
  }
  esds(track) {
    const configlen = track.config.byteLength;
    const data = new Uint8Array(26 + configlen + 3);
    data.set([
      0,
      0,
      0,
      0,
      3,
      23 + configlen,
      0,
      1,
      0,
      4,
      15 + configlen,
      64,
      21,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      5,
      configlen
    ]);
    data.set(track.config, 26);
    data.set([6, 1, 2], 26 + configlen);
    return data;
  }
  mp4a(track) {
    const { audiosamplerate } = track;
    return _Mp4Generator.box(this.types.mp4a, new Uint8Array([
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      track.channelCount,
      0,
      16,
      0,
      0,
      0,
      0,
      audiosamplerate >> 8 & 255,
      audiosamplerate & 255,
      0,
      0
    ]), _Mp4Generator.box(this.types.esds, this.esds(track)));
  }
  stsd(track) {
    if (track.type === "audio") {
      return _Mp4Generator.box(this.types.stsd, _Mp4Generator.stsd, this.mp4a(track));
    }
    return _Mp4Generator.box(this.types.stsd, _Mp4Generator.stsd, this.avc1(track));
  }
  tkhd(track) {
    return _Mp4Generator.box(this.types.tkhd, new Uint8Array([
      0,
      0,
      0,
      1,
      ...decimal2HexadecimalArray(Math.floor(Date.now() / 1e3 + CORRECTION_UTC)),
      ...decimal2HexadecimalArray(Math.floor(Date.now() / 1e3 + CORRECTION_UTC)),
      ...decimal2HexadecimalArray(track.id),
      0,
      0,
      0,
      0,
      ...decimal2HexadecimalArray(track.duration),
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      track.volume >> 0 & 255,
      track.volume % 1 * 10 >> 0 & 255,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      64,
      0,
      0,
      0,
      track.width >> 8 & 255,
      track.width & 255,
      0,
      0,
      track.height >> 8 & 255,
      track.height & 255,
      0,
      0
    ]));
  }
  traf(baseMediaDecodeTime, track) {
    const sampleDependencyTable = this.sdtp(track);
    const { id } = track;
    return _Mp4Generator.box(this.types.traf, _Mp4Generator.box(this.types.tfhd, new Uint8Array([
      0,
      0,
      0,
      0,
      id >> 24,
      id >> 16 & 255,
      id >> 8 & 255,
      id & 255
    ])), _Mp4Generator.box(this.types.tfdt, new Uint8Array([
      0,
      0,
      0,
      0,
      baseMediaDecodeTime >> 24,
      baseMediaDecodeTime >> 16 & 255,
      baseMediaDecodeTime >> 8 & 255,
      baseMediaDecodeTime & 255
    ])), this.trun(track, sampleDependencyTable.length + 16 + 16 + 8 + 16 + 8 + 8), sampleDependencyTable);
  }
  trak(track) {
    track.duration = track.duration || 4294967295;
    return _Mp4Generator.box(this.types.trak, this.tkhd(track), this.edts(track), this.mdia(track));
  }
  edts(track) {
    return _Mp4Generator.box(this.types.edts, this.elst(track));
  }
  elst(track) {
    const sampleCount = track.samples.length;
    const sampleDelta = track.duration / sampleCount;
    const buffer = [
      0,
      0,
      0,
      0,
      ...decimal2HexadecimalArray(1),
      ...decimal2HexadecimalArray(track.duration),
      ...decimal2HexadecimalArray(track.implicitOffset * sampleDelta),
      0,
      1,
      0,
      0
    ];
    return _Mp4Generator.box(this.types.elst, new Uint8Array(buffer));
  }
  trex(track) {
    const { id } = track;
    return _Mp4Generator.box(this.types.trex, new Uint8Array([
      0,
      0,
      0,
      0,
      id >> 24,
      id >> 16 & 255,
      id >> 8 & 255,
      id & 255,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      0,
      1
    ]));
  }
  trun(track, offset) {
    const samples = track.samples || [];
    const len = samples.length;
    const arraylen = 12 + 16 * len;
    const array = new Uint8Array(arraylen);
    let i;
    let sample;
    let duration;
    let size;
    let flags;
    let compositionTimeOffset;
    const dataOffset = offset + 8 + arraylen;
    array.set([
      0,
      0,
      15,
      1,
      len >>> 24 & 255,
      len >>> 16 & 255,
      len >>> 8 & 255,
      len & 255,
      dataOffset >>> 24 & 255,
      dataOffset >>> 16 & 255,
      dataOffset >>> 8 & 255,
      dataOffset & 255
    ], 0);
    for (i = 0; i < len; i++) {
      sample = samples[i];
      duration = sample.duration;
      size = sample.size;
      flags = sample.flags;
      compositionTimeOffset = sample.compositionTimeOffset;
      array.set([
        duration >>> 24 & 255,
        duration >>> 16 & 255,
        duration >>> 8 & 255,
        duration & 255,
        size >>> 24 & 255,
        size >>> 16 & 255,
        size >>> 8 & 255,
        size & 255,
        flags.isLeading << 2 | flags.dependsOn,
        flags.isDependedOn << 6 | flags.hasRedundancy << 4 | flags.paddingValue << 1 | flags.isNonSyncSample,
        flags.degradationPriority & 240 << 8,
        flags.degradationPriority & 15,
        compositionTimeOffset >>> 24 & 255,
        compositionTimeOffset >>> 16 & 255,
        compositionTimeOffset >>> 8 & 255,
        compositionTimeOffset & 255
      ], 12 + 16 * i);
    }
    return _Mp4Generator.box(this.types.trun, array);
  }
  stts(track) {
    const sampleCount = track.samples.length;
    const sampleDelta = Math.floor(track.duration / sampleCount);
    const buffer = [
      0,
      0,
      0,
      0,
      ...decimal2HexadecimalArray(1),
      ...decimal2HexadecimalArray(sampleCount),
      ...decimal2HexadecimalArray(sampleDelta)
    ];
    return _Mp4Generator.box(this.types.stts, new Uint8Array(buffer));
  }
  ctts(track) {
    const sampleCount = track.ptsList.length;
    const sampleDelta = Math.floor(track.duration / sampleCount);
    const buffer = [
      0,
      0,
      0,
      0,
      ...decimal2HexadecimalArray(sampleCount)
    ];
    for (let i = 0; i < sampleCount; i++) {
      buffer.push(...decimal2HexadecimalArray(1));
      const dts = i * sampleDelta;
      const pts = (track.ptsList[i] + track.implicitOffset) * sampleDelta;
      buffer.push(...decimal2HexadecimalArray(pts - dts));
    }
    return _Mp4Generator.box(this.types.ctts, new Uint8Array(buffer));
  }
  stss(track) {
    const iFrames = track.samples.filter((sample) => sample.flags.isKeyFrame).map((sample) => sample.index + 1);
    const buffer = [
      0,
      0,
      0,
      0,
      ...decimal2HexadecimalArray(iFrames.length)
    ];
    for (const iFrame of iFrames) {
      buffer.push(...decimal2HexadecimalArray(iFrame));
    }
    return _Mp4Generator.box(this.types.stss, new Uint8Array(buffer));
  }
};
let Mp4Generator = _Mp4Generator;
Mp4Generator.hdlrTypes = {
  video: new Uint8Array([
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    118,
    105,
    100,
    101,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    86,
    105,
    100,
    101,
    111,
    72,
    97,
    110,
    100,
    108,
    101,
    114,
    0
  ]),
  audio: new Uint8Array([
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    115,
    111,
    117,
    110,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    83,
    111,
    117,
    110,
    100,
    72,
    97,
    110,
    100,
    108,
    101,
    114,
    0
  ])
};
Mp4Generator.fullbox = new Uint8Array([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0
]);
Mp4Generator.stsc = _Mp4Generator.fullbox;
Mp4Generator.stco = _Mp4Generator.fullbox;
Mp4Generator.stsz = new Uint8Array([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0
]);
Mp4Generator.vmhd = new Uint8Array([
  0,
  0,
  0,
  1,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0
]);
Mp4Generator.smhd = new Uint8Array([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0
]);
Mp4Generator.stsd = new Uint8Array([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1
]);

const NALU_BASE_TYPES = [NALU.sps, NALU.pps, NALU.idr, NALU.ndr];
const SEQUENCE_NUMBER = 1;
const BASE_MEDIA_DECODE_TIME = 0;
const BASE_MEDIA_TIME_SCALE = 1e3;
const getImplicitOffset = (ptsList) => {
  const offsetList = ptsList.map((pts, index) => pts - index).filter((offset) => offset < 0);
  if (offsetList.length < 1)
    return 0;
  return Math.abs(Math.min(...offsetList));
};
let trackId = 1;
class H264Remuxer {
  constructor() {
    this.mp4track = {
      id: H264Remuxer.getTrackID(),
      type: "video",
      len: 0,
      fragmented: true,
      sps: null,
      pps: null,
      width: 0,
      height: 0,
      timescale: 0,
      duration: 0,
      samples: [],
      ptsList: [],
      fps: 0,
      implicitOffset: 0
    };
    this.samples = [];
  }
  static getTrackID() {
    const id = trackId;
    trackId += 1;
    return id;
  }
  static remux(frames, headers, width, height, frameRate, ptsList) {
    if (frames.length < 1)
      Log.errorByCode(ErrorCode.FrameEmpty);
    if (headers.length < 2)
      Log.errorByCode(ErrorCode.VideoReaderH264HeaderError);
    const remuxer = new H264Remuxer();
    remuxer.mp4track.timescale = BASE_MEDIA_TIME_SCALE;
    remuxer.mp4track.duration = frames.length / frameRate * BASE_MEDIA_TIME_SCALE;
    remuxer.mp4track.fps = frameRate;
    remuxer.mp4track.ptsList = ptsList;
    remuxer.mp4track.width = width;
    remuxer.mp4track.height = height;
    remuxer.mp4track.sps = [headers[0].subarray(NALU_HEADER_LENGTH)];
    remuxer.mp4track.pps = [headers[1].subarray(NALU_HEADER_LENGTH)];
    remuxer.mp4track.implicitOffset = getImplicitOffset(ptsList);
    for (const frame of frames) {
      const units = frame.units.filter((unit) => NALU_BASE_TYPES.includes(unit.nalUnitType));
      if (units.length < 1)
        continue;
      const size = units.reduce((pre, cur) => pre + cur.getSize(), 0);
      remuxer.mp4track.len += size;
      remuxer.samples.push({
        units,
        size,
        keyFrame: frame.isKeyFrame
      });
    }
    return remuxer;
  }
  convertMp4() {
    const payload = this.getPayload();
    if (!payload)
      return;
    const mp4Generator = new Mp4Generator();
    const ftyp = mp4Generator.ftyp();
    const moov = mp4Generator.moov([this.mp4track], this.mp4track.duration, this.mp4track.timescale);
    const moof = mp4Generator.moof(SEQUENCE_NUMBER, BASE_MEDIA_DECODE_TIME, this.mp4track);
    const mdat = mp4Generator.mdat(payload);
    return concatUint8Arrays([ftyp, moov, moof, mdat]);
  }
  getPayload() {
    const payload = new Uint8Array(this.mp4track.len);
    const sampleDelta = this.mp4track.duration / this.samples.length;
    let offset = 0;
    let count = 0;
    for (const sample of this.samples) {
      const { units } = sample;
      const mp4Sample = {
        index: count,
        size: sample.size,
        duration: sampleDelta,
        compositionTimeOffset: (this.mp4track.ptsList[count] + this.mp4track.implicitOffset - count) * sampleDelta,
        flags: {
          isLeading: 0,
          isDependedOn: 0,
          hasRedundancy: 0,
          degradationPriority: 0,
          isKeyFrame: sample.keyFrame,
          isNonSyncSample: sample.keyFrame ? 0 : 1,
          dependsOn: sample.keyFrame ? 2 : 1
        }
      };
      for (const unit of units) {
        payload.set(unit.getData(), offset);
        offset += unit.getSize();
      }
      this.mp4track.samples.push(mp4Sample);
      count += 1;
    }
    if (!this.mp4track.samples.length)
      return;
    return payload;
  }
}

const convertMp4 = (h264Frames, h264Headers, width, height, frameRate, ptsList) => {
  const frames = getH264Frames([...h264Headers, ...h264Frames]);
  const remuxer = H264Remuxer.remux(frames, h264Headers, width, height, frameRate, ptsList);
  return remuxer.convertMp4();
};

let eventHandlers = {};
const addListener = (node, event, handler, capture = false) => {
  if (!(event in eventHandlers)) {
    eventHandlers[event] = [];
  }
  eventHandlers[event].push({ node, handler, capture });
  node.addEventListener(event, handler, capture);
};
const removeListener = (targetNode, event, targetHandler) => {
  if (!(event in eventHandlers))
    return;
  eventHandlers[event].filter(({ node, handler }) => node === targetNode && handler === targetHandler).forEach(({ node, handler, capture }) => node.removeEventListener(event, handler, capture));
};
const removeAllListeners = (targetNode, event) => {
  if (!(event in eventHandlers))
    return;
  eventHandlers[event].filter(({ node }) => node === targetNode).forEach(({ node, handler, capture }) => node.removeEventListener(event, handler, capture));
  eventHandlers[event] = eventHandlers[event].filter(({ node }) => node !== targetNode);
};

class VideoReader {
  constructor(width, height, frameRate, h264Headers, h264Frames, ptsList) {
    this.videoEl = null;
    this.hadPlay = false;
    this.videoEl = document.createElement("video");
    this.videoEl.style.display = "none";
    this.videoEl.muted = true;
    this.videoEl.playsInline = true;
    addListener(this.videoEl, "timeupdate", this.onTimeupdate.bind(this));
    this.frameRate = frameRate;
    this.lastFlush = -1;
    const mp4 = convertMp4(h264Frames, h264Headers, width, height, this.frameRate, ptsList);
    const blob = new Blob([mp4], { type: "video/mp4" });
    this.videoEl.src = URL.createObjectURL(blob);
  }
  prepareAsync(targetFrame) {
    return new Promise((resolve) => {
      const { currentTime } = this.videoEl;
      const targetTime = targetFrame / this.frameRate;
      this.lastFlush = targetTime;
      if (currentTime === 0 && targetTime === 0) {
        if (this.hadPlay) {
          resolve(true);
        } else {
          const canplayCallback = () => {
            window.requestAnimationFrame(() => {
              this.videoEl.pause();
              this.hadPlay = true;
              resolve(true);
            });
            removeListener(this.videoEl, "playing", canplayCallback);
          };
          addListener(this.videoEl, "playing", canplayCallback);
          this.videoEl.play();
        }
      } else {
        if (targetTime === currentTime) {
          resolve(true);
        } else if (Math.abs(currentTime - targetTime) < 1 / this.frameRate * VIDEO_DECODE_WAIT_FRAME) {
          if (this.videoEl.paused) {
            this.videoEl.play();
          }
          resolve(true);
        } else {
          let isCallback = false;
          const timeupdateCallback = () => {
            removeListener(this.videoEl, "timeupdate", timeupdateCallback);
            this.videoEl.play();
            isCallback = true;
            resolve(true);
          };
          addListener(this.videoEl, "timeupdate", timeupdateCallback);
          this.videoEl.currentTime = targetTime;
          setTimeout(() => {
            if (!isCallback) {
              removeListener(this.videoEl, "timeupdate", timeupdateCallback);
              resolve(true);
            }
          }, 1e3 / this.frameRate * VIDEO_DECODE_WAIT_FRAME);
        }
      }
    });
  }
  renderToTexture(GL, textureID) {
    if (this.videoEl.readyState < 2)
      return;
    const gl = GL.currentContext.GLctx;
    gl.bindTexture(gl.TEXTURE_2D, GL.textures[textureID]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.videoEl);
  }
  onDestroy() {
    removeAllListeners(this.videoEl, "playing");
    removeAllListeners(this.videoEl, "timeupdate");
    this.videoEl = null;
  }
  onTimeupdate() {
    if (this.lastFlush < 0)
      return;
    const { currentTime } = this.videoEl;
    if (currentTime - this.lastFlush >= 1 / this.frameRate * VIDEO_DECODE_WAIT_FRAME && !this.videoEl.paused) {
      this.videoEl.pause();
    }
  }
}

const measureText = (imageData) => {
  const imageDataInt32Array = new Int32Array(imageData.data.buffer);
  let left = getLeftPixel(imageDataInt32Array, imageData.width, imageData.height);
  let top = getTopPixel(imageDataInt32Array, imageData.width, imageData.height);
  let right = getRightPixel(imageDataInt32Array, imageData.width, imageData.height);
  let bottom = getBottomPixel(imageDataInt32Array, imageData.width, imageData.height);
  return { left, top, right, bottom };
};
const getLeftPixel = (imageDataArray, width, height) => {
  const verticalCount = imageDataArray.length / width;
  const acrossCount = imageDataArray.length / height;
  for (let i = 0; i < acrossCount; i++) {
    for (let j = 0; j < verticalCount; j++) {
      if (imageDataArray[i + j * width] !== 0)
        return i;
    }
  }
};
const getTopPixel = (imageDataArray, width, height) => {
  const verticalCount = imageDataArray.length / width;
  const acrossCount = imageDataArray.length / height;
  for (let i = 0; i < verticalCount; i++) {
    for (let j = 0; j < acrossCount; j++) {
      if (imageDataArray[i * width + j] !== 0)
        return i;
    }
  }
};
const getRightPixel = (imageDataArray, width, height) => {
  const verticalCount = imageDataArray.length / width;
  const acrossCount = imageDataArray.length / height;
  for (let i = acrossCount - 1; i > 0; i--) {
    for (let j = verticalCount - 1; j > 0; j--) {
      if (imageDataArray[i + width * j] !== 0)
        return i;
    }
  }
};
const getBottomPixel = (imageDataArray, width, height) => {
  const verticalCount = imageDataArray.length / width;
  const acrossCount = imageDataArray.length / height;
  for (let i = verticalCount - 1; i > 0; i--) {
    for (let j = acrossCount - 1; j > 0; j--) {
      if (imageDataArray[i * width + j] !== 0)
        return i;
    }
  }
};

const canvas = (() => {
  try {
    const offscreenCanvas = new OffscreenCanvas(0, 0);
    const context = offscreenCanvas.getContext("2d");
    if (context == null ? void 0 : context.measureText)
      return offscreenCanvas;
    return document.createElement("canvas");
  } catch (err) {
    return document.createElement("canvas");
  }
})();
canvas.width = 10;
canvas.height = 10;
const testCanvas = document.createElement("canvas");
testCanvas.width = 1;
testCanvas.height = 1;
const testContext = testCanvas.getContext("2d");
testContext.textBaseline = "top";
testContext.font = "100px -no-font-family-here-";
testContext.scale(0.01, 0.01);
testContext.fillStyle = "#000";
testContext.globalCompositeOperation = "copy";
const _ScalerContext = class {
  constructor(fontName, size, fauxBold = false, fauxItalic = false) {
    this.fontBoundingBoxMap = [];
    this.fontName = fontName;
    this.size = size;
    this.fauxBold = fauxBold;
    this.fauxItalic = fauxItalic;
  }
  static isEmoji(text) {
    testContext.fillText(text, 0, 0);
    const color = testContext.getImageData(0, 0, 1, 1).data.toString();
    return !color.includes("0,0,0,");
  }
  fontString() {
    const attributes = [];
    if (this.fauxBold) {
      attributes.push("bold");
    }
    if (this.fauxItalic) {
      attributes.push("italic");
    }
    attributes.push(`${this.size}px`);
    attributes.push(`${this.fontName}`);
    return attributes.join(" ");
  }
  getTextAdvance(text) {
    const { context } = _ScalerContext;
    context.font = this.fontString();
    return context.measureText(text).width;
  }
  getTextBounds(text) {
    const { context } = _ScalerContext;
    context.font = this.fontString();
    const metrics = this.measureText(context, text);
    const bounds = {
      left: Math.floor(-metrics.actualBoundingBoxLeft),
      top: Math.floor(-metrics.actualBoundingBoxAscent),
      right: Math.ceil(metrics.actualBoundingBoxRight),
      bottom: Math.ceil(metrics.actualBoundingBoxDescent)
    };
    return bounds;
  }
  generateFontMetrics() {
    const { context } = _ScalerContext;
    context.font = this.fontString();
    const metrics = this.measureText(context, "\u4E2D");
    const capHeight = metrics.actualBoundingBoxAscent;
    const xMetrics = this.measureText(context, "x");
    const xHeight = xMetrics.actualBoundingBoxAscent;
    return {
      ascent: -metrics.fontBoundingBoxAscent,
      descent: metrics.fontBoundingBoxDescent,
      xHeight,
      capHeight
    };
  }
  generateImage(text, bounds) {
    const canvas2 = document.createElement("canvas");
    canvas2.width = bounds.right - bounds.left;
    canvas2.height = bounds.bottom - bounds.top;
    const context = canvas2.getContext("2d");
    context.font = this.fontString();
    context.fillText(text, -bounds.left, -bounds.top);
    return new NativeImage(canvas2);
  }
  measureText(ctx, text) {
    const metrics = ctx.measureText(text);
    if (metrics == null ? void 0 : metrics.actualBoundingBoxAscent)
      return metrics;
    ctx.canvas.width = this.size * 1.5;
    ctx.canvas.height = this.size * 1.5;
    const pos = [0, this.size];
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.font = this.fontString();
    ctx.fillText(text, pos[0], pos[1]);
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    const { left, top, right, bottom } = measureText(imageData);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    let fontMeasure;
    const fontBoundingBox = this.fontBoundingBoxMap.find((item) => item.key === this.fontName);
    if (fontBoundingBox) {
      fontMeasure = fontBoundingBox.value;
    } else {
      ctx.font = this.fontString();
      ctx.fillText("\u6D4B", pos[0], pos[1]);
      const fontImageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
      fontMeasure = measureText(fontImageData);
      this.fontBoundingBoxMap.push({ key: this.fontName, value: fontMeasure });
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
    return {
      actualBoundingBoxAscent: pos[1] - top,
      actualBoundingBoxRight: right - pos[0],
      actualBoundingBoxDescent: bottom - pos[1],
      actualBoundingBoxLeft: pos[0] - left,
      fontBoundingBoxAscent: fontMeasure.bottom - fontMeasure.top,
      fontBoundingBoxDescent: 0
    };
  }
};
let ScalerContext = _ScalerContext;
ScalerContext.canvas = canvas;
ScalerContext.context = canvas.getContext("2d");

class WebMask {
  static getLineCap(cap) {
    switch (cap) {
      case 1:
        return "round";
      case 2:
        return "square";
      default:
        return "butt";
    }
  }
  static getLineJoin(join) {
    switch (join) {
      case 1:
        return "round";
      case 2:
        return "bevel";
      default:
        return "miter";
    }
  }
  constructor(width, height) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
  }
  fillPath(path, fillType) {
    const context = this.canvas.getContext("2d");
    if (fillType === WebMask.module.PathFillType.INVERSE_WINDING || fillType === WebMask.module.PathFillType.INVERSE_EVEN_ODD) {
      context.clip(path, fillType === WebMask.module.PathFillType.INVERSE_EVEN_ODD ? "evenodd" : "nonzero");
      context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    } else {
      context.fill(path, fillType === WebMask.module.PathFillType.EVEN_ODD ? "evenodd" : "nonzero");
    }
  }
  fillText(size, fauxBold, fauxItalic, fontName, texts, positions, matrix) {
    const scalerContext = new ScalerContext(fontName, size, fauxBold, fauxItalic);
    const context = this.canvas.getContext("2d");
    context.transform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
    context.font = scalerContext.fontString();
    for (let i = 0; i < texts.size(); i++) {
      const position = positions.get(i);
      context.fillText(texts.get(i), position.x, position.y);
    }
  }
  strokeText(size, fauxBold, fauxItalic, fontName, stroke, texts, positions, matrix) {
    if (stroke.width < 0.5) {
      return;
    }
    const scalerContext = new ScalerContext(fontName, size, fauxBold, fauxItalic);
    const context = this.canvas.getContext("2d");
    context.transform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
    context.font = scalerContext.fontString();
    context.lineJoin = WebMask.getLineJoin(stroke.join);
    context.miterLimit = stroke.miterLimit;
    context.lineCap = WebMask.getLineCap(stroke.cap);
    context.lineWidth = stroke.width;
    for (let i = 0; i < texts.size(); i++) {
      const position = positions.get(i);
      context.strokeText(texts.get(i), position.x, position.y);
    }
  }
  update(GL) {
    const gl = GL.currentContext.GLctx;
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA, gl.ALPHA, gl.UNSIGNED_BYTE, this.canvas);
  }
}

const binding = (module) => {
  module.PAGFile = PAGFile;
  PAGFile.module = module;
  module.PAGPlayer = PAGPlayer;
  PAGPlayer.module = module;
  module.PAGView = PAGView;
  PAGView.module = module;
  module.PAGFont = PAGFont;
  PAGFont.module = module;
  module.PAGImage = PAGImage;
  PAGImage.module = module;
  module.PAGLayer = PAGLayer;
  PAGLayer.module = module;
  module.PAGComposition = PAGComposition;
  PAGComposition.module = module;
  module.VideoReader = VideoReader;
  module.NativeImage = NativeImage;
  module.ScalerContext = ScalerContext;
  module.WebMask = WebMask;
  WebMask.module = module;
  module.registerFontPath = function(path) {
    this._RegisterFontPath(path);
  };
  module.setFallbackFontNames = function(fontNames) {
    this._SetFallbackFontNames(fontNames);
  };
  module._PAGFile.Load = async function(bytes, length) {
    const wasmIns = await module.webAssemblyQueue.exec(this._Load, this, bytes, length);
    return new PAGFile(wasmIns);
  };
  module._PAGSurface.FromCanvas = async function(canvasID) {
    const pagSurfaceWasm = await module.webAssemblyQueue.exec(this._FromCanvas, this, canvasID);
    return new PAGSurface(module, pagSurfaceWasm);
  };
  module._PAGSurface.FromTexture = async function(textureID, width, height, flipY) {
    const pagSurfaceWasm = await module.webAssemblyQueue.exec(this._FromTexture, this, textureID, width, height, flipY);
    return new PAGSurface(module, pagSurfaceWasm);
  };
  module._PAGSurface.FromFrameBuffer = async function(frameBufferID, width, height, flipY) {
    const pagSurfaceWasm = await module.webAssemblyQueue.exec(this._FromFrameBuffer, this, frameBufferID, width, height, flipY);
    return new PAGSurface(module, pagSurfaceWasm);
  };
  module._PAGImage.FromBytes = async function(bytes, length) {
    const pagImageWasm = await module.webAssemblyQueue.exec(this._FromBytes, this, bytes, length);
    return new PAGImage(pagImageWasm);
  };
  module._PAGImage.FromNativeImage = async function(nativeImage) {
    const pagImageWasm = await module.webAssemblyQueue.exec(this._FromNativeImage, this, nativeImage);
    return new PAGImage(pagImageWasm);
  };
  module._PAGPlayer.create = async function() {
    const pagPlayerWasm = await module.webAssemblyQueue.exec(async () => await new module._PAGPlayer(), this);
    return new PAGPlayer(pagPlayerWasm);
  };
  module.traceImage = function(info, pixels) {
    const canvas = document.createElement("canvas");
    canvas.width = info.width;
    canvas.height = info.height;
    const context = canvas.getContext("2d");
    const imageData = new ImageData(new Uint8ClampedArray(pixels), canvas.width, canvas.height);
    context.putImageData(imageData, 0, 0);
    document.body.appendChild(canvas);
  };
};

var PAGInit$1 = (() => {
  var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : void 0;
  return function(PAGInit2) {
    PAGInit2 = PAGInit2 || {};
    var Module = typeof PAGInit2 !== "undefined" ? PAGInit2 : {};
    var objAssign = Object.assign;
    var readyPromiseResolve, readyPromiseReject;
    Module["ready"] = new Promise(function(resolve, reject) {
      readyPromiseResolve = resolve;
      readyPromiseReject = reject;
    });
    var moduleOverrides = objAssign({}, Module);
    var quit_ = (status, toThrow) => {
      throw toThrow;
    };
    var ENVIRONMENT_IS_WEB = true;
    var scriptDirectory = "";
    function locateFile(path) {
      if (Module["locateFile"]) {
        return Module["locateFile"](path, scriptDirectory);
      }
      return scriptDirectory + path;
    }
    var read_, readAsync, readBinary;
    {
      if (typeof document !== "undefined" && document.currentScript) {
        scriptDirectory = document.currentScript.src;
      }
      if (_scriptDir) {
        scriptDirectory = _scriptDir;
      }
      if (scriptDirectory.indexOf("blob:") !== 0) {
        scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1);
      } else {
        scriptDirectory = "";
      }
      {
        read_ = function(url) {
          var xhr = new XMLHttpRequest();
          xhr.open("GET", url, false);
          xhr.send(null);
          return xhr.responseText;
        };
        readAsync = function(url, onload, onerror) {
          var xhr = new XMLHttpRequest();
          xhr.open("GET", url, true);
          xhr.responseType = "arraybuffer";
          xhr.onload = function() {
            if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
              onload(xhr.response);
              return;
            }
            onerror();
          };
          xhr.onerror = onerror;
          xhr.send(null);
        };
      }
    }
    var out = Module["print"] || console.log.bind(console);
    var err = Module["printErr"] || console.warn.bind(console);
    objAssign(Module, moduleOverrides);
    moduleOverrides = null;
    if (Module["arguments"])
      ;
    if (Module["thisProgram"])
      ;
    if (Module["quit"])
      quit_ = Module["quit"];
    var wasmBinary;
    if (Module["wasmBinary"])
      wasmBinary = Module["wasmBinary"];
    Module["noExitRuntime"] || true;
    if (typeof WebAssembly !== "object") {
      abort("no native wasm support detected");
    }
    var wasmMemory;
    var ABORT = false;
    var EXITSTATUS;
    function assert(condition, text) {
      if (!condition) {
        abort(text);
      }
    }
    var UTF8Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf8") : void 0;
    function UTF8ArrayToString(heap, idx, maxBytesToRead) {
      var endIdx = idx + maxBytesToRead;
      var endPtr = idx;
      while (heap[endPtr] && !(endPtr >= endIdx))
        ++endPtr;
      if (endPtr - idx > 16 && heap.subarray && UTF8Decoder) {
        return UTF8Decoder.decode(heap.subarray(idx, endPtr));
      } else {
        var str = "";
        while (idx < endPtr) {
          var u0 = heap[idx++];
          if (!(u0 & 128)) {
            str += String.fromCharCode(u0);
            continue;
          }
          var u1 = heap[idx++] & 63;
          if ((u0 & 224) == 192) {
            str += String.fromCharCode((u0 & 31) << 6 | u1);
            continue;
          }
          var u2 = heap[idx++] & 63;
          if ((u0 & 240) == 224) {
            u0 = (u0 & 15) << 12 | u1 << 6 | u2;
          } else {
            u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heap[idx++] & 63;
          }
          if (u0 < 65536) {
            str += String.fromCharCode(u0);
          } else {
            var ch = u0 - 65536;
            str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
          }
        }
      }
      return str;
    }
    function UTF8ToString(ptr, maxBytesToRead) {
      return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";
    }
    function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
      if (!(maxBytesToWrite > 0))
        return 0;
      var startIdx = outIdx;
      var endIdx = outIdx + maxBytesToWrite - 1;
      for (var i2 = 0; i2 < str.length; ++i2) {
        var u = str.charCodeAt(i2);
        if (u >= 55296 && u <= 57343) {
          var u1 = str.charCodeAt(++i2);
          u = 65536 + ((u & 1023) << 10) | u1 & 1023;
        }
        if (u <= 127) {
          if (outIdx >= endIdx)
            break;
          heap[outIdx++] = u;
        } else if (u <= 2047) {
          if (outIdx + 1 >= endIdx)
            break;
          heap[outIdx++] = 192 | u >> 6;
          heap[outIdx++] = 128 | u & 63;
        } else if (u <= 65535) {
          if (outIdx + 2 >= endIdx)
            break;
          heap[outIdx++] = 224 | u >> 12;
          heap[outIdx++] = 128 | u >> 6 & 63;
          heap[outIdx++] = 128 | u & 63;
        } else {
          if (outIdx + 3 >= endIdx)
            break;
          heap[outIdx++] = 240 | u >> 18;
          heap[outIdx++] = 128 | u >> 12 & 63;
          heap[outIdx++] = 128 | u >> 6 & 63;
          heap[outIdx++] = 128 | u & 63;
        }
      }
      heap[outIdx] = 0;
      return outIdx - startIdx;
    }
    function stringToUTF8(str, outPtr, maxBytesToWrite) {
      return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
    }
    function lengthBytesUTF8(str) {
      var len = 0;
      for (var i2 = 0; i2 < str.length; ++i2) {
        var u = str.charCodeAt(i2);
        if (u >= 55296 && u <= 57343)
          u = 65536 + ((u & 1023) << 10) | str.charCodeAt(++i2) & 1023;
        if (u <= 127)
          ++len;
        else if (u <= 2047)
          len += 2;
        else if (u <= 65535)
          len += 3;
        else
          len += 4;
      }
      return len;
    }
    var UTF16Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf-16le") : void 0;
    function UTF16ToString(ptr, maxBytesToRead) {
      var endPtr = ptr;
      var idx = endPtr >> 1;
      var maxIdx = idx + maxBytesToRead / 2;
      while (!(idx >= maxIdx) && HEAPU16[idx])
        ++idx;
      endPtr = idx << 1;
      if (endPtr - ptr > 32 && UTF16Decoder) {
        return UTF16Decoder.decode(HEAPU8.subarray(ptr, endPtr));
      } else {
        var str = "";
        for (var i2 = 0; !(i2 >= maxBytesToRead / 2); ++i2) {
          var codeUnit = HEAP16[ptr + i2 * 2 >> 1];
          if (codeUnit == 0)
            break;
          str += String.fromCharCode(codeUnit);
        }
        return str;
      }
    }
    function stringToUTF16(str, outPtr, maxBytesToWrite) {
      if (maxBytesToWrite === void 0) {
        maxBytesToWrite = 2147483647;
      }
      if (maxBytesToWrite < 2)
        return 0;
      maxBytesToWrite -= 2;
      var startPtr = outPtr;
      var numCharsToWrite = maxBytesToWrite < str.length * 2 ? maxBytesToWrite / 2 : str.length;
      for (var i2 = 0; i2 < numCharsToWrite; ++i2) {
        var codeUnit = str.charCodeAt(i2);
        HEAP16[outPtr >> 1] = codeUnit;
        outPtr += 2;
      }
      HEAP16[outPtr >> 1] = 0;
      return outPtr - startPtr;
    }
    function lengthBytesUTF16(str) {
      return str.length * 2;
    }
    function UTF32ToString(ptr, maxBytesToRead) {
      var i2 = 0;
      var str = "";
      while (!(i2 >= maxBytesToRead / 4)) {
        var utf32 = HEAP32[ptr + i2 * 4 >> 2];
        if (utf32 == 0)
          break;
        ++i2;
        if (utf32 >= 65536) {
          var ch = utf32 - 65536;
          str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
        } else {
          str += String.fromCharCode(utf32);
        }
      }
      return str;
    }
    function stringToUTF32(str, outPtr, maxBytesToWrite) {
      if (maxBytesToWrite === void 0) {
        maxBytesToWrite = 2147483647;
      }
      if (maxBytesToWrite < 4)
        return 0;
      var startPtr = outPtr;
      var endPtr = startPtr + maxBytesToWrite - 4;
      for (var i2 = 0; i2 < str.length; ++i2) {
        var codeUnit = str.charCodeAt(i2);
        if (codeUnit >= 55296 && codeUnit <= 57343) {
          var trailSurrogate = str.charCodeAt(++i2);
          codeUnit = 65536 + ((codeUnit & 1023) << 10) | trailSurrogate & 1023;
        }
        HEAP32[outPtr >> 2] = codeUnit;
        outPtr += 4;
        if (outPtr + 4 > endPtr)
          break;
      }
      HEAP32[outPtr >> 2] = 0;
      return outPtr - startPtr;
    }
    function lengthBytesUTF32(str) {
      var len = 0;
      for (var i2 = 0; i2 < str.length; ++i2) {
        var codeUnit = str.charCodeAt(i2);
        if (codeUnit >= 55296 && codeUnit <= 57343)
          ++i2;
        len += 4;
      }
      return len;
    }
    function alignUp(x, multiple) {
      if (x % multiple > 0) {
        x += multiple - x % multiple;
      }
      return x;
    }
    var buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
    function updateGlobalBufferAndViews(buf) {
      buffer = buf;
      Module["HEAP8"] = HEAP8 = new Int8Array(buf);
      Module["HEAP16"] = HEAP16 = new Int16Array(buf);
      Module["HEAP32"] = HEAP32 = new Int32Array(buf);
      Module["HEAPU8"] = HEAPU8 = new Uint8Array(buf);
      Module["HEAPU16"] = HEAPU16 = new Uint16Array(buf);
      Module["HEAPU32"] = HEAPU32 = new Uint32Array(buf);
      Module["HEAPF32"] = HEAPF32 = new Float32Array(buf);
      Module["HEAPF64"] = HEAPF64 = new Float64Array(buf);
    }
    Module["INITIAL_MEMORY"] || 16777216;
    var __ATPRERUN__ = [];
    var __ATINIT__ = [];
    var __ATPOSTRUN__ = [];
    function preRun() {
      if (Module["preRun"]) {
        if (typeof Module["preRun"] == "function")
          Module["preRun"] = [Module["preRun"]];
        while (Module["preRun"].length) {
          addOnPreRun(Module["preRun"].shift());
        }
      }
      callRuntimeCallbacks(__ATPRERUN__);
    }
    function initRuntime() {
      if (!Module["noFSInit"] && !FS.init.initialized)
        FS.init();
      FS.ignorePermissions = false;
      callRuntimeCallbacks(__ATINIT__);
    }
    function postRun() {
      if (Module["postRun"]) {
        if (typeof Module["postRun"] == "function")
          Module["postRun"] = [Module["postRun"]];
        while (Module["postRun"].length) {
          addOnPostRun(Module["postRun"].shift());
        }
      }
      callRuntimeCallbacks(__ATPOSTRUN__);
    }
    function addOnPreRun(cb) {
      __ATPRERUN__.unshift(cb);
    }
    function addOnInit(cb) {
      __ATINIT__.unshift(cb);
    }
    function addOnPostRun(cb) {
      __ATPOSTRUN__.unshift(cb);
    }
    var runDependencies = 0;
    var dependenciesFulfilled = null;
    function getUniqueRunDependency(id) {
      return id;
    }
    function addRunDependency(id) {
      runDependencies++;
      if (Module["monitorRunDependencies"]) {
        Module["monitorRunDependencies"](runDependencies);
      }
    }
    function removeRunDependency(id) {
      runDependencies--;
      if (Module["monitorRunDependencies"]) {
        Module["monitorRunDependencies"](runDependencies);
      }
      if (runDependencies == 0) {
        if (dependenciesFulfilled) {
          var callback = dependenciesFulfilled;
          dependenciesFulfilled = null;
          callback();
        }
      }
    }
    Module["preloadedImages"] = {};
    Module["preloadedAudios"] = {};
    function abort(what) {
      {
        if (Module["onAbort"]) {
          Module["onAbort"](what);
        }
      }
      what = "Aborted(" + what + ")";
      err(what);
      ABORT = true;
      EXITSTATUS = 1;
      what += ". Build with -s ASSERTIONS=1 for more info.";
      var e = new WebAssembly.RuntimeError(what);
      readyPromiseReject(e);
      throw e;
    }
    var dataURIPrefix = "data:application/octet-stream;base64,";
    function isDataURI(filename) {
      return filename.startsWith(dataURIPrefix);
    }
    var wasmBinaryFile;
    wasmBinaryFile = "libpag.wasm";
    if (!isDataURI(wasmBinaryFile)) {
      wasmBinaryFile = locateFile(wasmBinaryFile);
    }
    function getBinary(file) {
      try {
        if (file == wasmBinaryFile && wasmBinary) {
          return new Uint8Array(wasmBinary);
        }
        if (readBinary) ; else {
          throw "both async and sync fetching of the wasm failed";
        }
      } catch (err2) {
        abort(err2);
      }
    }
    function getBinaryPromise() {
      if (!wasmBinary && (ENVIRONMENT_IS_WEB )) {
        if (typeof fetch === "function") {
          return fetch(wasmBinaryFile, { credentials: "same-origin" }).then(function(response) {
            if (!response["ok"]) {
              throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
            }
            return response["arrayBuffer"]();
          }).catch(function() {
            return getBinary(wasmBinaryFile);
          });
        }
      }
      return Promise.resolve().then(function() {
        return getBinary(wasmBinaryFile);
      });
    }
    function createWasm() {
      var info = { "a": asmLibraryArg };
      function receiveInstance(instance, module) {
        var exports2 = instance.exports;
        exports2 = Asyncify.instrumentWasmExports(exports2);
        Module["asm"] = exports2;
        wasmMemory = Module["asm"]["bc"];
        updateGlobalBufferAndViews(wasmMemory.buffer);
        Module["asm"]["ec"];
        addOnInit(Module["asm"]["cc"]);
        removeRunDependency();
      }
      addRunDependency();
      function receiveInstantiationResult(result) {
        receiveInstance(result["instance"]);
      }
      function instantiateArrayBuffer(receiver) {
        return getBinaryPromise().then(function(binary) {
          return WebAssembly.instantiate(binary, info);
        }).then(function(instance) {
          return instance;
        }).then(receiver, function(reason) {
          err("failed to asynchronously prepare wasm: " + reason);
          abort(reason);
        });
      }
      function instantiateAsync() {
        if (!wasmBinary && typeof WebAssembly.instantiateStreaming === "function" && !isDataURI(wasmBinaryFile) && typeof fetch === "function") {
          return fetch(wasmBinaryFile, { credentials: "same-origin" }).then(function(response) {
            var result = WebAssembly.instantiateStreaming(response, info);
            return result.then(receiveInstantiationResult, function(reason) {
              err("wasm streaming compile failed: " + reason);
              err("falling back to ArrayBuffer instantiation");
              return instantiateArrayBuffer(receiveInstantiationResult);
            });
          });
        } else {
          return instantiateArrayBuffer(receiveInstantiationResult);
        }
      }
      if (Module["instantiateWasm"]) {
        try {
          var exports = Module["instantiateWasm"](info, receiveInstance);
          exports = Asyncify.instrumentWasmExports(exports);
          return exports;
        } catch (e) {
          err("Module.instantiateWasm callback failed with error: " + e);
          return false;
        }
      }
      instantiateAsync().catch(readyPromiseReject);
      return {};
    }
    var tempDouble;
    var tempI64;
    function callRuntimeCallbacks(callbacks) {
      while (callbacks.length > 0) {
        var callback = callbacks.shift();
        if (typeof callback == "function") {
          callback(Module);
          continue;
        }
        var func = callback.func;
        if (typeof func === "number") {
          if (callback.arg === void 0) {
            (function() {
              dynCall_v.call(null, func);
            })();
          } else {
            (function(a1) {
              dynCall_vi.apply(null, [func, a1]);
            })(callback.arg);
          }
        } else {
          func(callback.arg === void 0 ? null : callback.arg);
        }
      }
    }
    function handleException(e) {
      if (e instanceof ExitStatus || e == "unwind") {
        return EXITSTATUS;
      }
      quit_(1, e);
    }
    function ___assert_fail(condition, filename, line, func) {
      abort("Assertion failed: " + UTF8ToString(condition) + ", at: " + [filename ? UTF8ToString(filename) : "unknown filename", line, func ? UTF8ToString(func) : "unknown function"]);
    }
    function ___cxa_allocate_exception(size) {
      return _malloc(size + 16) + 16;
    }
    function ExceptionInfo(excPtr) {
      this.excPtr = excPtr;
      this.ptr = excPtr - 16;
      this.set_type = function(type) {
        HEAP32[this.ptr + 4 >> 2] = type;
      };
      this.get_type = function() {
        return HEAP32[this.ptr + 4 >> 2];
      };
      this.set_destructor = function(destructor) {
        HEAP32[this.ptr + 8 >> 2] = destructor;
      };
      this.get_destructor = function() {
        return HEAP32[this.ptr + 8 >> 2];
      };
      this.set_refcount = function(refcount) {
        HEAP32[this.ptr >> 2] = refcount;
      };
      this.set_caught = function(caught) {
        caught = caught ? 1 : 0;
        HEAP8[this.ptr + 12 >> 0] = caught;
      };
      this.get_caught = function() {
        return HEAP8[this.ptr + 12 >> 0] != 0;
      };
      this.set_rethrown = function(rethrown) {
        rethrown = rethrown ? 1 : 0;
        HEAP8[this.ptr + 13 >> 0] = rethrown;
      };
      this.get_rethrown = function() {
        return HEAP8[this.ptr + 13 >> 0] != 0;
      };
      this.init = function(type, destructor) {
        this.set_type(type);
        this.set_destructor(destructor);
        this.set_refcount(0);
        this.set_caught(false);
        this.set_rethrown(false);
      };
      this.add_ref = function() {
        var value = HEAP32[this.ptr >> 2];
        HEAP32[this.ptr >> 2] = value + 1;
      };
      this.release_ref = function() {
        var prev = HEAP32[this.ptr >> 2];
        HEAP32[this.ptr >> 2] = prev - 1;
        return prev === 1;
      };
    }
    function ___cxa_throw(ptr, type, destructor) {
      var info = new ExceptionInfo(ptr);
      info.init(type, destructor);
      throw ptr;
    }
    function setErrNo(value) {
      HEAP32[___errno_location() >> 2] = value;
      return value;
    }
    var PATH = { splitPath: function(filename) {
      var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
      return splitPathRe.exec(filename).slice(1);
    }, normalizeArray: function(parts, allowAboveRoot) {
      var up = 0;
      for (var i2 = parts.length - 1; i2 >= 0; i2--) {
        var last = parts[i2];
        if (last === ".") {
          parts.splice(i2, 1);
        } else if (last === "..") {
          parts.splice(i2, 1);
          up++;
        } else if (up) {
          parts.splice(i2, 1);
          up--;
        }
      }
      if (allowAboveRoot) {
        for (; up; up--) {
          parts.unshift("..");
        }
      }
      return parts;
    }, normalize: function(path) {
      var isAbsolute = path.charAt(0) === "/", trailingSlash = path.substr(-1) === "/";
      path = PATH.normalizeArray(path.split("/").filter(function(p) {
        return !!p;
      }), !isAbsolute).join("/");
      if (!path && !isAbsolute) {
        path = ".";
      }
      if (path && trailingSlash) {
        path += "/";
      }
      return (isAbsolute ? "/" : "") + path;
    }, dirname: function(path) {
      var result = PATH.splitPath(path), root = result[0], dir = result[1];
      if (!root && !dir) {
        return ".";
      }
      if (dir) {
        dir = dir.substr(0, dir.length - 1);
      }
      return root + dir;
    }, basename: function(path) {
      if (path === "/")
        return "/";
      path = PATH.normalize(path);
      path = path.replace(/\/$/, "");
      var lastSlash = path.lastIndexOf("/");
      if (lastSlash === -1)
        return path;
      return path.substr(lastSlash + 1);
    }, extname: function(path) {
      return PATH.splitPath(path)[3];
    }, join: function() {
      var paths = Array.prototype.slice.call(arguments, 0);
      return PATH.normalize(paths.join("/"));
    }, join2: function(l, r) {
      return PATH.normalize(l + "/" + r);
    } };
    function getRandomDevice() {
      if (typeof crypto === "object" && typeof crypto["getRandomValues"] === "function") {
        var randomBuffer = new Uint8Array(1);
        return function() {
          crypto.getRandomValues(randomBuffer);
          return randomBuffer[0];
        };
      } else
        return function() {
          abort("randomDevice");
        };
    }
    var PATH_FS = { resolve: function() {
      var resolvedPath = "", resolvedAbsolute = false;
      for (var i2 = arguments.length - 1; i2 >= -1 && !resolvedAbsolute; i2--) {
        var path = i2 >= 0 ? arguments[i2] : FS.cwd();
        if (typeof path !== "string") {
          throw new TypeError("Arguments to path.resolve must be strings");
        } else if (!path) {
          return "";
        }
        resolvedPath = path + "/" + resolvedPath;
        resolvedAbsolute = path.charAt(0) === "/";
      }
      resolvedPath = PATH.normalizeArray(resolvedPath.split("/").filter(function(p) {
        return !!p;
      }), !resolvedAbsolute).join("/");
      return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
    }, relative: function(from, to) {
      from = PATH_FS.resolve(from).substr(1);
      to = PATH_FS.resolve(to).substr(1);
      function trim(arr) {
        var start = 0;
        for (; start < arr.length; start++) {
          if (arr[start] !== "")
            break;
        }
        var end = arr.length - 1;
        for (; end >= 0; end--) {
          if (arr[end] !== "")
            break;
        }
        if (start > end)
          return [];
        return arr.slice(start, end - start + 1);
      }
      var fromParts = trim(from.split("/"));
      var toParts = trim(to.split("/"));
      var length = Math.min(fromParts.length, toParts.length);
      var samePartsLength = length;
      for (var i2 = 0; i2 < length; i2++) {
        if (fromParts[i2] !== toParts[i2]) {
          samePartsLength = i2;
          break;
        }
      }
      var outputParts = [];
      for (var i2 = samePartsLength; i2 < fromParts.length; i2++) {
        outputParts.push("..");
      }
      outputParts = outputParts.concat(toParts.slice(samePartsLength));
      return outputParts.join("/");
    } };
    var TTY = { ttys: [], init: function() {
    }, shutdown: function() {
    }, register: function(dev, ops) {
      TTY.ttys[dev] = { input: [], output: [], ops };
      FS.registerDevice(dev, TTY.stream_ops);
    }, stream_ops: { open: function(stream) {
      var tty = TTY.ttys[stream.node.rdev];
      if (!tty) {
        throw new FS.ErrnoError(43);
      }
      stream.tty = tty;
      stream.seekable = false;
    }, close: function(stream) {
      stream.tty.ops.flush(stream.tty);
    }, flush: function(stream) {
      stream.tty.ops.flush(stream.tty);
    }, read: function(stream, buffer2, offset, length, pos) {
      if (!stream.tty || !stream.tty.ops.get_char) {
        throw new FS.ErrnoError(60);
      }
      var bytesRead = 0;
      for (var i2 = 0; i2 < length; i2++) {
        var result;
        try {
          result = stream.tty.ops.get_char(stream.tty);
        } catch (e) {
          throw new FS.ErrnoError(29);
        }
        if (result === void 0 && bytesRead === 0) {
          throw new FS.ErrnoError(6);
        }
        if (result === null || result === void 0)
          break;
        bytesRead++;
        buffer2[offset + i2] = result;
      }
      if (bytesRead) {
        stream.node.timestamp = Date.now();
      }
      return bytesRead;
    }, write: function(stream, buffer2, offset, length, pos) {
      if (!stream.tty || !stream.tty.ops.put_char) {
        throw new FS.ErrnoError(60);
      }
      try {
        for (var i2 = 0; i2 < length; i2++) {
          stream.tty.ops.put_char(stream.tty, buffer2[offset + i2]);
        }
      } catch (e) {
        throw new FS.ErrnoError(29);
      }
      if (length) {
        stream.node.timestamp = Date.now();
      }
      return i2;
    } }, default_tty_ops: { get_char: function(tty) {
      if (!tty.input.length) {
        var result = null;
        if (typeof window != "undefined" && typeof window.prompt == "function") {
          result = window.prompt("Input: ");
          if (result !== null) {
            result += "\n";
          }
        } else if (typeof readline == "function") {
          result = readline();
          if (result !== null) {
            result += "\n";
          }
        }
        if (!result) {
          return null;
        }
        tty.input = intArrayFromString(result, true);
      }
      return tty.input.shift();
    }, put_char: function(tty, val) {
      if (val === null || val === 10) {
        out(UTF8ArrayToString(tty.output, 0));
        tty.output = [];
      } else {
        if (val != 0)
          tty.output.push(val);
      }
    }, flush: function(tty) {
      if (tty.output && tty.output.length > 0) {
        out(UTF8ArrayToString(tty.output, 0));
        tty.output = [];
      }
    } }, default_tty1_ops: { put_char: function(tty, val) {
      if (val === null || val === 10) {
        err(UTF8ArrayToString(tty.output, 0));
        tty.output = [];
      } else {
        if (val != 0)
          tty.output.push(val);
      }
    }, flush: function(tty) {
      if (tty.output && tty.output.length > 0) {
        err(UTF8ArrayToString(tty.output, 0));
        tty.output = [];
      }
    } } };
    function mmapAlloc(size) {
      abort();
    }
    var MEMFS = { ops_table: null, mount: function(mount) {
      return MEMFS.createNode(null, "/", 16384 | 511, 0);
    }, createNode: function(parent, name, mode, dev) {
      if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
        throw new FS.ErrnoError(63);
      }
      if (!MEMFS.ops_table) {
        MEMFS.ops_table = { dir: { node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr, lookup: MEMFS.node_ops.lookup, mknod: MEMFS.node_ops.mknod, rename: MEMFS.node_ops.rename, unlink: MEMFS.node_ops.unlink, rmdir: MEMFS.node_ops.rmdir, readdir: MEMFS.node_ops.readdir, symlink: MEMFS.node_ops.symlink }, stream: { llseek: MEMFS.stream_ops.llseek } }, file: { node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr }, stream: { llseek: MEMFS.stream_ops.llseek, read: MEMFS.stream_ops.read, write: MEMFS.stream_ops.write, allocate: MEMFS.stream_ops.allocate, mmap: MEMFS.stream_ops.mmap, msync: MEMFS.stream_ops.msync } }, link: { node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr, readlink: MEMFS.node_ops.readlink }, stream: {} }, chrdev: { node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr }, stream: FS.chrdev_stream_ops } };
      }
      var node = FS.createNode(parent, name, mode, dev);
      if (FS.isDir(node.mode)) {
        node.node_ops = MEMFS.ops_table.dir.node;
        node.stream_ops = MEMFS.ops_table.dir.stream;
        node.contents = {};
      } else if (FS.isFile(node.mode)) {
        node.node_ops = MEMFS.ops_table.file.node;
        node.stream_ops = MEMFS.ops_table.file.stream;
        node.usedBytes = 0;
        node.contents = null;
      } else if (FS.isLink(node.mode)) {
        node.node_ops = MEMFS.ops_table.link.node;
        node.stream_ops = MEMFS.ops_table.link.stream;
      } else if (FS.isChrdev(node.mode)) {
        node.node_ops = MEMFS.ops_table.chrdev.node;
        node.stream_ops = MEMFS.ops_table.chrdev.stream;
      }
      node.timestamp = Date.now();
      if (parent) {
        parent.contents[name] = node;
        parent.timestamp = node.timestamp;
      }
      return node;
    }, getFileDataAsTypedArray: function(node) {
      if (!node.contents)
        return new Uint8Array(0);
      if (node.contents.subarray)
        return node.contents.subarray(0, node.usedBytes);
      return new Uint8Array(node.contents);
    }, expandFileStorage: function(node, newCapacity) {
      var prevCapacity = node.contents ? node.contents.length : 0;
      if (prevCapacity >= newCapacity)
        return;
      var CAPACITY_DOUBLING_MAX = 1024 * 1024;
      newCapacity = Math.max(newCapacity, prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125) >>> 0);
      if (prevCapacity != 0)
        newCapacity = Math.max(newCapacity, 256);
      var oldContents = node.contents;
      node.contents = new Uint8Array(newCapacity);
      if (node.usedBytes > 0)
        node.contents.set(oldContents.subarray(0, node.usedBytes), 0);
    }, resizeFileStorage: function(node, newSize) {
      if (node.usedBytes == newSize)
        return;
      if (newSize == 0) {
        node.contents = null;
        node.usedBytes = 0;
      } else {
        var oldContents = node.contents;
        node.contents = new Uint8Array(newSize);
        if (oldContents) {
          node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)));
        }
        node.usedBytes = newSize;
      }
    }, node_ops: { getattr: function(node) {
      var attr = {};
      attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
      attr.ino = node.id;
      attr.mode = node.mode;
      attr.nlink = 1;
      attr.uid = 0;
      attr.gid = 0;
      attr.rdev = node.rdev;
      if (FS.isDir(node.mode)) {
        attr.size = 4096;
      } else if (FS.isFile(node.mode)) {
        attr.size = node.usedBytes;
      } else if (FS.isLink(node.mode)) {
        attr.size = node.link.length;
      } else {
        attr.size = 0;
      }
      attr.atime = new Date(node.timestamp);
      attr.mtime = new Date(node.timestamp);
      attr.ctime = new Date(node.timestamp);
      attr.blksize = 4096;
      attr.blocks = Math.ceil(attr.size / attr.blksize);
      return attr;
    }, setattr: function(node, attr) {
      if (attr.mode !== void 0) {
        node.mode = attr.mode;
      }
      if (attr.timestamp !== void 0) {
        node.timestamp = attr.timestamp;
      }
      if (attr.size !== void 0) {
        MEMFS.resizeFileStorage(node, attr.size);
      }
    }, lookup: function(parent, name) {
      throw FS.genericErrors[44];
    }, mknod: function(parent, name, mode, dev) {
      return MEMFS.createNode(parent, name, mode, dev);
    }, rename: function(old_node, new_dir, new_name) {
      if (FS.isDir(old_node.mode)) {
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
        }
        if (new_node) {
          for (var i2 in new_node.contents) {
            throw new FS.ErrnoError(55);
          }
        }
      }
      delete old_node.parent.contents[old_node.name];
      old_node.parent.timestamp = Date.now();
      old_node.name = new_name;
      new_dir.contents[new_name] = old_node;
      new_dir.timestamp = old_node.parent.timestamp;
      old_node.parent = new_dir;
    }, unlink: function(parent, name) {
      delete parent.contents[name];
      parent.timestamp = Date.now();
    }, rmdir: function(parent, name) {
      var node = FS.lookupNode(parent, name);
      for (var i2 in node.contents) {
        throw new FS.ErrnoError(55);
      }
      delete parent.contents[name];
      parent.timestamp = Date.now();
    }, readdir: function(node) {
      var entries = [".", ".."];
      for (var key in node.contents) {
        if (!node.contents.hasOwnProperty(key)) {
          continue;
        }
        entries.push(key);
      }
      return entries;
    }, symlink: function(parent, newname, oldpath) {
      var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
      node.link = oldpath;
      return node;
    }, readlink: function(node) {
      if (!FS.isLink(node.mode)) {
        throw new FS.ErrnoError(28);
      }
      return node.link;
    } }, stream_ops: { read: function(stream, buffer2, offset, length, position) {
      var contents = stream.node.contents;
      if (position >= stream.node.usedBytes)
        return 0;
      var size = Math.min(stream.node.usedBytes - position, length);
      if (size > 8 && contents.subarray) {
        buffer2.set(contents.subarray(position, position + size), offset);
      } else {
        for (var i2 = 0; i2 < size; i2++)
          buffer2[offset + i2] = contents[position + i2];
      }
      return size;
    }, write: function(stream, buffer2, offset, length, position, canOwn) {
      if (buffer2.buffer === HEAP8.buffer) {
        canOwn = false;
      }
      if (!length)
        return 0;
      var node = stream.node;
      node.timestamp = Date.now();
      if (buffer2.subarray && (!node.contents || node.contents.subarray)) {
        if (canOwn) {
          node.contents = buffer2.subarray(offset, offset + length);
          node.usedBytes = length;
          return length;
        } else if (node.usedBytes === 0 && position === 0) {
          node.contents = buffer2.slice(offset, offset + length);
          node.usedBytes = length;
          return length;
        } else if (position + length <= node.usedBytes) {
          node.contents.set(buffer2.subarray(offset, offset + length), position);
          return length;
        }
      }
      MEMFS.expandFileStorage(node, position + length);
      if (node.contents.subarray && buffer2.subarray) {
        node.contents.set(buffer2.subarray(offset, offset + length), position);
      } else {
        for (var i2 = 0; i2 < length; i2++) {
          node.contents[position + i2] = buffer2[offset + i2];
        }
      }
      node.usedBytes = Math.max(node.usedBytes, position + length);
      return length;
    }, llseek: function(stream, offset, whence) {
      var position = offset;
      if (whence === 1) {
        position += stream.position;
      } else if (whence === 2) {
        if (FS.isFile(stream.node.mode)) {
          position += stream.node.usedBytes;
        }
      }
      if (position < 0) {
        throw new FS.ErrnoError(28);
      }
      return position;
    }, allocate: function(stream, offset, length) {
      MEMFS.expandFileStorage(stream.node, offset + length);
      stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
    }, mmap: function(stream, address, length, position, prot, flags) {
      if (address !== 0) {
        throw new FS.ErrnoError(28);
      }
      if (!FS.isFile(stream.node.mode)) {
        throw new FS.ErrnoError(43);
      }
      var ptr;
      var allocated;
      var contents = stream.node.contents;
      if (!(flags & 2) && contents.buffer === buffer) {
        allocated = false;
        ptr = contents.byteOffset;
      } else {
        if (position > 0 || position + length < contents.length) {
          if (contents.subarray) {
            contents = contents.subarray(position, position + length);
          } else {
            contents = Array.prototype.slice.call(contents, position, position + length);
          }
        }
        allocated = true;
        ptr = mmapAlloc();
        if (!ptr) {
          throw new FS.ErrnoError(48);
        }
        HEAP8.set(contents, ptr);
      }
      return { ptr, allocated };
    }, msync: function(stream, buffer2, offset, length, mmapFlags) {
      if (!FS.isFile(stream.node.mode)) {
        throw new FS.ErrnoError(43);
      }
      if (mmapFlags & 2) {
        return 0;
      }
      MEMFS.stream_ops.write(stream, buffer2, 0, length, offset, false);
      return 0;
    } } };
    function asyncLoad(url, onload, onerror, noRunDep) {
      var dep = !noRunDep ? getUniqueRunDependency("al " + url) : "";
      readAsync(url, function(arrayBuffer) {
        assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
        onload(new Uint8Array(arrayBuffer));
        if (dep)
          removeRunDependency();
      }, function(event) {
        if (onerror) {
          onerror();
        } else {
          throw 'Loading data file "' + url + '" failed.';
        }
      });
      if (dep)
        addRunDependency();
    }
    var FS = { root: null, mounts: [], devices: {}, streams: [], nextInode: 1, nameTable: null, currentPath: "/", initialized: false, ignorePermissions: true, ErrnoError: null, genericErrors: {}, filesystems: null, syncFSRequests: 0, lookupPath: function(path, opts) {
      path = PATH_FS.resolve(FS.cwd(), path);
      opts = opts || {};
      if (!path)
        return { path: "", node: null };
      var defaults = { follow_mount: true, recurse_count: 0 };
      for (var key in defaults) {
        if (opts[key] === void 0) {
          opts[key] = defaults[key];
        }
      }
      if (opts.recurse_count > 8) {
        throw new FS.ErrnoError(32);
      }
      var parts = PATH.normalizeArray(path.split("/").filter(function(p) {
        return !!p;
      }), false);
      var current = FS.root;
      var current_path = "/";
      for (var i2 = 0; i2 < parts.length; i2++) {
        var islast = i2 === parts.length - 1;
        if (islast && opts.parent) {
          break;
        }
        current = FS.lookupNode(current, parts[i2]);
        current_path = PATH.join2(current_path, parts[i2]);
        if (FS.isMountpoint(current)) {
          if (!islast || islast && opts.follow_mount) {
            current = current.mounted.root;
          }
        }
        if (!islast || opts.follow) {
          var count = 0;
          while (FS.isLink(current.mode)) {
            var link = FS.readlink(current_path);
            current_path = PATH_FS.resolve(PATH.dirname(current_path), link);
            var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
            current = lookup.node;
            if (count++ > 40) {
              throw new FS.ErrnoError(32);
            }
          }
        }
      }
      return { path: current_path, node: current };
    }, getPath: function(node) {
      var path;
      while (true) {
        if (FS.isRoot(node)) {
          var mount = node.mount.mountpoint;
          if (!path)
            return mount;
          return mount[mount.length - 1] !== "/" ? mount + "/" + path : mount + path;
        }
        path = path ? node.name + "/" + path : node.name;
        node = node.parent;
      }
    }, hashName: function(parentid, name) {
      var hash = 0;
      for (var i2 = 0; i2 < name.length; i2++) {
        hash = (hash << 5) - hash + name.charCodeAt(i2) | 0;
      }
      return (parentid + hash >>> 0) % FS.nameTable.length;
    }, hashAddNode: function(node) {
      var hash = FS.hashName(node.parent.id, node.name);
      node.name_next = FS.nameTable[hash];
      FS.nameTable[hash] = node;
    }, hashRemoveNode: function(node) {
      var hash = FS.hashName(node.parent.id, node.name);
      if (FS.nameTable[hash] === node) {
        FS.nameTable[hash] = node.name_next;
      } else {
        var current = FS.nameTable[hash];
        while (current) {
          if (current.name_next === node) {
            current.name_next = node.name_next;
            break;
          }
          current = current.name_next;
        }
      }
    }, lookupNode: function(parent, name) {
      var errCode = FS.mayLookup(parent);
      if (errCode) {
        throw new FS.ErrnoError(errCode, parent);
      }
      var hash = FS.hashName(parent.id, name);
      for (var node = FS.nameTable[hash]; node; node = node.name_next) {
        var nodeName = node.name;
        if (node.parent.id === parent.id && nodeName === name) {
          return node;
        }
      }
      return FS.lookup(parent, name);
    }, createNode: function(parent, name, mode, rdev) {
      var node = new FS.FSNode(parent, name, mode, rdev);
      FS.hashAddNode(node);
      return node;
    }, destroyNode: function(node) {
      FS.hashRemoveNode(node);
    }, isRoot: function(node) {
      return node === node.parent;
    }, isMountpoint: function(node) {
      return !!node.mounted;
    }, isFile: function(mode) {
      return (mode & 61440) === 32768;
    }, isDir: function(mode) {
      return (mode & 61440) === 16384;
    }, isLink: function(mode) {
      return (mode & 61440) === 40960;
    }, isChrdev: function(mode) {
      return (mode & 61440) === 8192;
    }, isBlkdev: function(mode) {
      return (mode & 61440) === 24576;
    }, isFIFO: function(mode) {
      return (mode & 61440) === 4096;
    }, isSocket: function(mode) {
      return (mode & 49152) === 49152;
    }, flagModes: { "r": 0, "r+": 2, "w": 577, "w+": 578, "a": 1089, "a+": 1090 }, modeStringToFlags: function(str) {
      var flags = FS.flagModes[str];
      if (typeof flags === "undefined") {
        throw new Error("Unknown file open mode: " + str);
      }
      return flags;
    }, flagsToPermissionString: function(flag) {
      var perms = ["r", "w", "rw"][flag & 3];
      if (flag & 512) {
        perms += "w";
      }
      return perms;
    }, nodePermissions: function(node, perms) {
      if (FS.ignorePermissions) {
        return 0;
      }
      if (perms.includes("r") && !(node.mode & 292)) {
        return 2;
      } else if (perms.includes("w") && !(node.mode & 146)) {
        return 2;
      } else if (perms.includes("x") && !(node.mode & 73)) {
        return 2;
      }
      return 0;
    }, mayLookup: function(dir) {
      var errCode = FS.nodePermissions(dir, "x");
      if (errCode)
        return errCode;
      if (!dir.node_ops.lookup)
        return 2;
      return 0;
    }, mayCreate: function(dir, name) {
      try {
        var node = FS.lookupNode(dir, name);
        return 20;
      } catch (e) {
      }
      return FS.nodePermissions(dir, "wx");
    }, mayDelete: function(dir, name, isdir) {
      var node;
      try {
        node = FS.lookupNode(dir, name);
      } catch (e) {
        return e.errno;
      }
      var errCode = FS.nodePermissions(dir, "wx");
      if (errCode) {
        return errCode;
      }
      if (isdir) {
        if (!FS.isDir(node.mode)) {
          return 54;
        }
        if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
          return 10;
        }
      } else {
        if (FS.isDir(node.mode)) {
          return 31;
        }
      }
      return 0;
    }, mayOpen: function(node, flags) {
      if (!node) {
        return 44;
      }
      if (FS.isLink(node.mode)) {
        return 32;
      } else if (FS.isDir(node.mode)) {
        if (FS.flagsToPermissionString(flags) !== "r" || flags & 512) {
          return 31;
        }
      }
      return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
    }, MAX_OPEN_FDS: 4096, nextfd: function(fd_start, fd_end) {
      fd_start = fd_start || 0;
      fd_end = fd_end || FS.MAX_OPEN_FDS;
      for (var fd = fd_start; fd <= fd_end; fd++) {
        if (!FS.streams[fd]) {
          return fd;
        }
      }
      throw new FS.ErrnoError(33);
    }, getStream: function(fd) {
      return FS.streams[fd];
    }, createStream: function(stream, fd_start, fd_end) {
      if (!FS.FSStream) {
        FS.FSStream = function() {
        };
        FS.FSStream.prototype = { object: { get: function() {
          return this.node;
        }, set: function(val) {
          this.node = val;
        } }, isRead: { get: function() {
          return (this.flags & 2097155) !== 1;
        } }, isWrite: { get: function() {
          return (this.flags & 2097155) !== 0;
        } }, isAppend: { get: function() {
          return this.flags & 1024;
        } } };
      }
      var newStream = new FS.FSStream();
      for (var p in stream) {
        newStream[p] = stream[p];
      }
      stream = newStream;
      var fd = FS.nextfd(fd_start, fd_end);
      stream.fd = fd;
      FS.streams[fd] = stream;
      return stream;
    }, closeStream: function(fd) {
      FS.streams[fd] = null;
    }, chrdev_stream_ops: { open: function(stream) {
      var device = FS.getDevice(stream.node.rdev);
      stream.stream_ops = device.stream_ops;
      if (stream.stream_ops.open) {
        stream.stream_ops.open(stream);
      }
    }, llseek: function() {
      throw new FS.ErrnoError(70);
    } }, major: function(dev) {
      return dev >> 8;
    }, minor: function(dev) {
      return dev & 255;
    }, makedev: function(ma, mi) {
      return ma << 8 | mi;
    }, registerDevice: function(dev, ops) {
      FS.devices[dev] = { stream_ops: ops };
    }, getDevice: function(dev) {
      return FS.devices[dev];
    }, getMounts: function(mount) {
      var mounts = [];
      var check = [mount];
      while (check.length) {
        var m = check.pop();
        mounts.push(m);
        check.push.apply(check, m.mounts);
      }
      return mounts;
    }, syncfs: function(populate, callback) {
      if (typeof populate === "function") {
        callback = populate;
        populate = false;
      }
      FS.syncFSRequests++;
      if (FS.syncFSRequests > 1) {
        err("warning: " + FS.syncFSRequests + " FS.syncfs operations in flight at once, probably just doing extra work");
      }
      var mounts = FS.getMounts(FS.root.mount);
      var completed = 0;
      function doCallback(errCode) {
        FS.syncFSRequests--;
        return callback(errCode);
      }
      function done(errCode) {
        if (errCode) {
          if (!done.errored) {
            done.errored = true;
            return doCallback(errCode);
          }
          return;
        }
        if (++completed >= mounts.length) {
          doCallback(null);
        }
      }
      mounts.forEach(function(mount) {
        if (!mount.type.syncfs) {
          return done(null);
        }
        mount.type.syncfs(mount, populate, done);
      });
    }, mount: function(type, opts, mountpoint) {
      var root = mountpoint === "/";
      var pseudo = !mountpoint;
      var node;
      if (root && FS.root) {
        throw new FS.ErrnoError(10);
      } else if (!root && !pseudo) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
        mountpoint = lookup.path;
        node = lookup.node;
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(10);
        }
        if (!FS.isDir(node.mode)) {
          throw new FS.ErrnoError(54);
        }
      }
      var mount = { type, opts, mountpoint, mounts: [] };
      var mountRoot = type.mount(mount);
      mountRoot.mount = mount;
      mount.root = mountRoot;
      if (root) {
        FS.root = mountRoot;
      } else if (node) {
        node.mounted = mount;
        if (node.mount) {
          node.mount.mounts.push(mount);
        }
      }
      return mountRoot;
    }, unmount: function(mountpoint) {
      var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
      if (!FS.isMountpoint(lookup.node)) {
        throw new FS.ErrnoError(28);
      }
      var node = lookup.node;
      var mount = node.mounted;
      var mounts = FS.getMounts(mount);
      Object.keys(FS.nameTable).forEach(function(hash) {
        var current = FS.nameTable[hash];
        while (current) {
          var next = current.name_next;
          if (mounts.includes(current.mount)) {
            FS.destroyNode(current);
          }
          current = next;
        }
      });
      node.mounted = null;
      var idx = node.mount.mounts.indexOf(mount);
      node.mount.mounts.splice(idx, 1);
    }, lookup: function(parent, name) {
      return parent.node_ops.lookup(parent, name);
    }, mknod: function(path, mode, dev) {
      var lookup = FS.lookupPath(path, { parent: true });
      var parent = lookup.node;
      var name = PATH.basename(path);
      if (!name || name === "." || name === "..") {
        throw new FS.ErrnoError(28);
      }
      var errCode = FS.mayCreate(parent, name);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      if (!parent.node_ops.mknod) {
        throw new FS.ErrnoError(63);
      }
      return parent.node_ops.mknod(parent, name, mode, dev);
    }, create: function(path, mode) {
      mode = mode !== void 0 ? mode : 438;
      mode &= 4095;
      mode |= 32768;
      return FS.mknod(path, mode, 0);
    }, mkdir: function(path, mode) {
      mode = mode !== void 0 ? mode : 511;
      mode &= 511 | 512;
      mode |= 16384;
      return FS.mknod(path, mode, 0);
    }, mkdirTree: function(path, mode) {
      var dirs = path.split("/");
      var d = "";
      for (var i2 = 0; i2 < dirs.length; ++i2) {
        if (!dirs[i2])
          continue;
        d += "/" + dirs[i2];
        try {
          FS.mkdir(d, mode);
        } catch (e) {
          if (e.errno != 20)
            throw e;
        }
      }
    }, mkdev: function(path, mode, dev) {
      if (typeof dev === "undefined") {
        dev = mode;
        mode = 438;
      }
      mode |= 8192;
      return FS.mknod(path, mode, dev);
    }, symlink: function(oldpath, newpath) {
      if (!PATH_FS.resolve(oldpath)) {
        throw new FS.ErrnoError(44);
      }
      var lookup = FS.lookupPath(newpath, { parent: true });
      var parent = lookup.node;
      if (!parent) {
        throw new FS.ErrnoError(44);
      }
      var newname = PATH.basename(newpath);
      var errCode = FS.mayCreate(parent, newname);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      if (!parent.node_ops.symlink) {
        throw new FS.ErrnoError(63);
      }
      return parent.node_ops.symlink(parent, newname, oldpath);
    }, rename: function(old_path, new_path) {
      var old_dirname = PATH.dirname(old_path);
      var new_dirname = PATH.dirname(new_path);
      var old_name = PATH.basename(old_path);
      var new_name = PATH.basename(new_path);
      var lookup, old_dir, new_dir;
      lookup = FS.lookupPath(old_path, { parent: true });
      old_dir = lookup.node;
      lookup = FS.lookupPath(new_path, { parent: true });
      new_dir = lookup.node;
      if (!old_dir || !new_dir)
        throw new FS.ErrnoError(44);
      if (old_dir.mount !== new_dir.mount) {
        throw new FS.ErrnoError(75);
      }
      var old_node = FS.lookupNode(old_dir, old_name);
      var relative = PATH_FS.relative(old_path, new_dirname);
      if (relative.charAt(0) !== ".") {
        throw new FS.ErrnoError(28);
      }
      relative = PATH_FS.relative(new_path, old_dirname);
      if (relative.charAt(0) !== ".") {
        throw new FS.ErrnoError(55);
      }
      var new_node;
      try {
        new_node = FS.lookupNode(new_dir, new_name);
      } catch (e) {
      }
      if (old_node === new_node) {
        return;
      }
      var isdir = FS.isDir(old_node.mode);
      var errCode = FS.mayDelete(old_dir, old_name, isdir);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      errCode = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      if (!old_dir.node_ops.rename) {
        throw new FS.ErrnoError(63);
      }
      if (FS.isMountpoint(old_node) || new_node && FS.isMountpoint(new_node)) {
        throw new FS.ErrnoError(10);
      }
      if (new_dir !== old_dir) {
        errCode = FS.nodePermissions(old_dir, "w");
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
      }
      FS.hashRemoveNode(old_node);
      try {
        old_dir.node_ops.rename(old_node, new_dir, new_name);
      } catch (e) {
        throw e;
      } finally {
        FS.hashAddNode(old_node);
      }
    }, rmdir: function(path) {
      var lookup = FS.lookupPath(path, { parent: true });
      var parent = lookup.node;
      var name = PATH.basename(path);
      var node = FS.lookupNode(parent, name);
      var errCode = FS.mayDelete(parent, name, true);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      if (!parent.node_ops.rmdir) {
        throw new FS.ErrnoError(63);
      }
      if (FS.isMountpoint(node)) {
        throw new FS.ErrnoError(10);
      }
      parent.node_ops.rmdir(parent, name);
      FS.destroyNode(node);
    }, readdir: function(path) {
      var lookup = FS.lookupPath(path, { follow: true });
      var node = lookup.node;
      if (!node.node_ops.readdir) {
        throw new FS.ErrnoError(54);
      }
      return node.node_ops.readdir(node);
    }, unlink: function(path) {
      var lookup = FS.lookupPath(path, { parent: true });
      var parent = lookup.node;
      if (!parent) {
        throw new FS.ErrnoError(44);
      }
      var name = PATH.basename(path);
      var node = FS.lookupNode(parent, name);
      var errCode = FS.mayDelete(parent, name, false);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      if (!parent.node_ops.unlink) {
        throw new FS.ErrnoError(63);
      }
      if (FS.isMountpoint(node)) {
        throw new FS.ErrnoError(10);
      }
      parent.node_ops.unlink(parent, name);
      FS.destroyNode(node);
    }, readlink: function(path) {
      var lookup = FS.lookupPath(path);
      var link = lookup.node;
      if (!link) {
        throw new FS.ErrnoError(44);
      }
      if (!link.node_ops.readlink) {
        throw new FS.ErrnoError(28);
      }
      return PATH_FS.resolve(FS.getPath(link.parent), link.node_ops.readlink(link));
    }, stat: function(path, dontFollow) {
      var lookup = FS.lookupPath(path, { follow: !dontFollow });
      var node = lookup.node;
      if (!node) {
        throw new FS.ErrnoError(44);
      }
      if (!node.node_ops.getattr) {
        throw new FS.ErrnoError(63);
      }
      return node.node_ops.getattr(node);
    }, lstat: function(path) {
      return FS.stat(path, true);
    }, chmod: function(path, mode, dontFollow) {
      var node;
      if (typeof path === "string") {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        node = lookup.node;
      } else {
        node = path;
      }
      if (!node.node_ops.setattr) {
        throw new FS.ErrnoError(63);
      }
      node.node_ops.setattr(node, { mode: mode & 4095 | node.mode & ~4095, timestamp: Date.now() });
    }, lchmod: function(path, mode) {
      FS.chmod(path, mode, true);
    }, fchmod: function(fd, mode) {
      var stream = FS.getStream(fd);
      if (!stream) {
        throw new FS.ErrnoError(8);
      }
      FS.chmod(stream.node, mode);
    }, chown: function(path, uid, gid, dontFollow) {
      var node;
      if (typeof path === "string") {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        node = lookup.node;
      } else {
        node = path;
      }
      if (!node.node_ops.setattr) {
        throw new FS.ErrnoError(63);
      }
      node.node_ops.setattr(node, { timestamp: Date.now() });
    }, lchown: function(path, uid, gid) {
      FS.chown(path, uid, gid, true);
    }, fchown: function(fd, uid, gid) {
      var stream = FS.getStream(fd);
      if (!stream) {
        throw new FS.ErrnoError(8);
      }
      FS.chown(stream.node, uid, gid);
    }, truncate: function(path, len) {
      if (len < 0) {
        throw new FS.ErrnoError(28);
      }
      var node;
      if (typeof path === "string") {
        var lookup = FS.lookupPath(path, { follow: true });
        node = lookup.node;
      } else {
        node = path;
      }
      if (!node.node_ops.setattr) {
        throw new FS.ErrnoError(63);
      }
      if (FS.isDir(node.mode)) {
        throw new FS.ErrnoError(31);
      }
      if (!FS.isFile(node.mode)) {
        throw new FS.ErrnoError(28);
      }
      var errCode = FS.nodePermissions(node, "w");
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      node.node_ops.setattr(node, { size: len, timestamp: Date.now() });
    }, ftruncate: function(fd, len) {
      var stream = FS.getStream(fd);
      if (!stream) {
        throw new FS.ErrnoError(8);
      }
      if ((stream.flags & 2097155) === 0) {
        throw new FS.ErrnoError(28);
      }
      FS.truncate(stream.node, len);
    }, utime: function(path, atime, mtime) {
      var lookup = FS.lookupPath(path, { follow: true });
      var node = lookup.node;
      node.node_ops.setattr(node, { timestamp: Math.max(atime, mtime) });
    }, open: function(path, flags, mode, fd_start, fd_end) {
      if (path === "") {
        throw new FS.ErrnoError(44);
      }
      flags = typeof flags === "string" ? FS.modeStringToFlags(flags) : flags;
      mode = typeof mode === "undefined" ? 438 : mode;
      if (flags & 64) {
        mode = mode & 4095 | 32768;
      } else {
        mode = 0;
      }
      var node;
      if (typeof path === "object") {
        node = path;
      } else {
        path = PATH.normalize(path);
        try {
          var lookup = FS.lookupPath(path, { follow: !(flags & 131072) });
          node = lookup.node;
        } catch (e) {
        }
      }
      var created = false;
      if (flags & 64) {
        if (node) {
          if (flags & 128) {
            throw new FS.ErrnoError(20);
          }
        } else {
          node = FS.mknod(path, mode, 0);
          created = true;
        }
      }
      if (!node) {
        throw new FS.ErrnoError(44);
      }
      if (FS.isChrdev(node.mode)) {
        flags &= ~512;
      }
      if (flags & 65536 && !FS.isDir(node.mode)) {
        throw new FS.ErrnoError(54);
      }
      if (!created) {
        var errCode = FS.mayOpen(node, flags);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
      }
      if (flags & 512) {
        FS.truncate(node, 0);
      }
      flags &= ~(128 | 512 | 131072);
      var stream = FS.createStream({ node, path: FS.getPath(node), id: node.id, flags, mode: node.mode, seekable: true, position: 0, stream_ops: node.stream_ops, node_ops: node.node_ops, ungotten: [], error: false }, fd_start, fd_end);
      if (stream.stream_ops.open) {
        stream.stream_ops.open(stream);
      }
      if (Module["logReadFiles"] && !(flags & 1)) {
        if (!FS.readFiles)
          FS.readFiles = {};
        if (!(path in FS.readFiles)) {
          FS.readFiles[path] = 1;
        }
      }
      return stream;
    }, close: function(stream) {
      if (FS.isClosed(stream)) {
        throw new FS.ErrnoError(8);
      }
      if (stream.getdents)
        stream.getdents = null;
      try {
        if (stream.stream_ops.close) {
          stream.stream_ops.close(stream);
        }
      } catch (e) {
        throw e;
      } finally {
        FS.closeStream(stream.fd);
      }
      stream.fd = null;
    }, isClosed: function(stream) {
      return stream.fd === null;
    }, llseek: function(stream, offset, whence) {
      if (FS.isClosed(stream)) {
        throw new FS.ErrnoError(8);
      }
      if (!stream.seekable || !stream.stream_ops.llseek) {
        throw new FS.ErrnoError(70);
      }
      if (whence != 0 && whence != 1 && whence != 2) {
        throw new FS.ErrnoError(28);
      }
      stream.position = stream.stream_ops.llseek(stream, offset, whence);
      stream.ungotten = [];
      return stream.position;
    }, read: function(stream, buffer2, offset, length, position) {
      if (length < 0 || position < 0) {
        throw new FS.ErrnoError(28);
      }
      if (FS.isClosed(stream)) {
        throw new FS.ErrnoError(8);
      }
      if ((stream.flags & 2097155) === 1) {
        throw new FS.ErrnoError(8);
      }
      if (FS.isDir(stream.node.mode)) {
        throw new FS.ErrnoError(31);
      }
      if (!stream.stream_ops.read) {
        throw new FS.ErrnoError(28);
      }
      var seeking = typeof position !== "undefined";
      if (!seeking) {
        position = stream.position;
      } else if (!stream.seekable) {
        throw new FS.ErrnoError(70);
      }
      var bytesRead = stream.stream_ops.read(stream, buffer2, offset, length, position);
      if (!seeking)
        stream.position += bytesRead;
      return bytesRead;
    }, write: function(stream, buffer2, offset, length, position, canOwn) {
      if (length < 0 || position < 0) {
        throw new FS.ErrnoError(28);
      }
      if (FS.isClosed(stream)) {
        throw new FS.ErrnoError(8);
      }
      if ((stream.flags & 2097155) === 0) {
        throw new FS.ErrnoError(8);
      }
      if (FS.isDir(stream.node.mode)) {
        throw new FS.ErrnoError(31);
      }
      if (!stream.stream_ops.write) {
        throw new FS.ErrnoError(28);
      }
      if (stream.seekable && stream.flags & 1024) {
        FS.llseek(stream, 0, 2);
      }
      var seeking = typeof position !== "undefined";
      if (!seeking) {
        position = stream.position;
      } else if (!stream.seekable) {
        throw new FS.ErrnoError(70);
      }
      var bytesWritten = stream.stream_ops.write(stream, buffer2, offset, length, position, canOwn);
      if (!seeking)
        stream.position += bytesWritten;
      return bytesWritten;
    }, allocate: function(stream, offset, length) {
      if (FS.isClosed(stream)) {
        throw new FS.ErrnoError(8);
      }
      if (offset < 0 || length <= 0) {
        throw new FS.ErrnoError(28);
      }
      if ((stream.flags & 2097155) === 0) {
        throw new FS.ErrnoError(8);
      }
      if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
        throw new FS.ErrnoError(43);
      }
      if (!stream.stream_ops.allocate) {
        throw new FS.ErrnoError(138);
      }
      stream.stream_ops.allocate(stream, offset, length);
    }, mmap: function(stream, address, length, position, prot, flags) {
      if ((prot & 2) !== 0 && (flags & 2) === 0 && (stream.flags & 2097155) !== 2) {
        throw new FS.ErrnoError(2);
      }
      if ((stream.flags & 2097155) === 1) {
        throw new FS.ErrnoError(2);
      }
      if (!stream.stream_ops.mmap) {
        throw new FS.ErrnoError(43);
      }
      return stream.stream_ops.mmap(stream, address, length, position, prot, flags);
    }, msync: function(stream, buffer2, offset, length, mmapFlags) {
      if (!stream || !stream.stream_ops.msync) {
        return 0;
      }
      return stream.stream_ops.msync(stream, buffer2, offset, length, mmapFlags);
    }, munmap: function(stream) {
      return 0;
    }, ioctl: function(stream, cmd, arg) {
      if (!stream.stream_ops.ioctl) {
        throw new FS.ErrnoError(59);
      }
      return stream.stream_ops.ioctl(stream, cmd, arg);
    }, readFile: function(path, opts) {
      opts = opts || {};
      opts.flags = opts.flags || 0;
      opts.encoding = opts.encoding || "binary";
      if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
        throw new Error('Invalid encoding type "' + opts.encoding + '"');
      }
      var ret;
      var stream = FS.open(path, opts.flags);
      var stat = FS.stat(path);
      var length = stat.size;
      var buf = new Uint8Array(length);
      FS.read(stream, buf, 0, length, 0);
      if (opts.encoding === "utf8") {
        ret = UTF8ArrayToString(buf, 0);
      } else if (opts.encoding === "binary") {
        ret = buf;
      }
      FS.close(stream);
      return ret;
    }, writeFile: function(path, data, opts) {
      opts = opts || {};
      opts.flags = opts.flags || 577;
      var stream = FS.open(path, opts.flags, opts.mode);
      if (typeof data === "string") {
        var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
        var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
        FS.write(stream, buf, 0, actualNumBytes, void 0, opts.canOwn);
      } else if (ArrayBuffer.isView(data)) {
        FS.write(stream, data, 0, data.byteLength, void 0, opts.canOwn);
      } else {
        throw new Error("Unsupported data type");
      }
      FS.close(stream);
    }, cwd: function() {
      return FS.currentPath;
    }, chdir: function(path) {
      var lookup = FS.lookupPath(path, { follow: true });
      if (lookup.node === null) {
        throw new FS.ErrnoError(44);
      }
      if (!FS.isDir(lookup.node.mode)) {
        throw new FS.ErrnoError(54);
      }
      var errCode = FS.nodePermissions(lookup.node, "x");
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      FS.currentPath = lookup.path;
    }, createDefaultDirectories: function() {
      FS.mkdir("/tmp");
      FS.mkdir("/home");
      FS.mkdir("/home/web_user");
    }, createDefaultDevices: function() {
      FS.mkdir("/dev");
      FS.registerDevice(FS.makedev(1, 3), { read: function() {
        return 0;
      }, write: function(stream, buffer2, offset, length, pos) {
        return length;
      } });
      FS.mkdev("/dev/null", FS.makedev(1, 3));
      TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
      TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
      FS.mkdev("/dev/tty", FS.makedev(5, 0));
      FS.mkdev("/dev/tty1", FS.makedev(6, 0));
      var random_device = getRandomDevice();
      FS.createDevice("/dev", "random", random_device);
      FS.createDevice("/dev", "urandom", random_device);
      FS.mkdir("/dev/shm");
      FS.mkdir("/dev/shm/tmp");
    }, createSpecialDirectories: function() {
      FS.mkdir("/proc");
      var proc_self = FS.mkdir("/proc/self");
      FS.mkdir("/proc/self/fd");
      FS.mount({ mount: function() {
        var node = FS.createNode(proc_self, "fd", 16384 | 511, 73);
        node.node_ops = { lookup: function(parent, name) {
          var fd = +name;
          var stream = FS.getStream(fd);
          if (!stream)
            throw new FS.ErrnoError(8);
          var ret = { parent: null, mount: { mountpoint: "fake" }, node_ops: { readlink: function() {
            return stream.path;
          } } };
          ret.parent = ret;
          return ret;
        } };
        return node;
      } }, {}, "/proc/self/fd");
    }, createStandardStreams: function() {
      if (Module["stdin"]) {
        FS.createDevice("/dev", "stdin", Module["stdin"]);
      } else {
        FS.symlink("/dev/tty", "/dev/stdin");
      }
      if (Module["stdout"]) {
        FS.createDevice("/dev", "stdout", null, Module["stdout"]);
      } else {
        FS.symlink("/dev/tty", "/dev/stdout");
      }
      if (Module["stderr"]) {
        FS.createDevice("/dev", "stderr", null, Module["stderr"]);
      } else {
        FS.symlink("/dev/tty1", "/dev/stderr");
      }
      FS.open("/dev/stdin", 0);
      FS.open("/dev/stdout", 1);
      FS.open("/dev/stderr", 1);
    }, ensureErrnoError: function() {
      if (FS.ErrnoError)
        return;
      FS.ErrnoError = function ErrnoError(errno, node) {
        this.node = node;
        this.setErrno = function(errno2) {
          this.errno = errno2;
        };
        this.setErrno(errno);
        this.message = "FS error";
      };
      FS.ErrnoError.prototype = new Error();
      FS.ErrnoError.prototype.constructor = FS.ErrnoError;
      [44].forEach(function(code) {
        FS.genericErrors[code] = new FS.ErrnoError(code);
        FS.genericErrors[code].stack = "<generic error, no stack>";
      });
    }, staticInit: function() {
      FS.ensureErrnoError();
      FS.nameTable = new Array(4096);
      FS.mount(MEMFS, {}, "/");
      FS.createDefaultDirectories();
      FS.createDefaultDevices();
      FS.createSpecialDirectories();
      FS.filesystems = { "MEMFS": MEMFS };
    }, init: function(input, output, error) {
      FS.init.initialized = true;
      FS.ensureErrnoError();
      Module["stdin"] = input || Module["stdin"];
      Module["stdout"] = output || Module["stdout"];
      Module["stderr"] = error || Module["stderr"];
      FS.createStandardStreams();
    }, quit: function() {
      FS.init.initialized = false;
      for (var i2 = 0; i2 < FS.streams.length; i2++) {
        var stream = FS.streams[i2];
        if (!stream) {
          continue;
        }
        FS.close(stream);
      }
    }, getMode: function(canRead, canWrite) {
      var mode = 0;
      if (canRead)
        mode |= 292 | 73;
      if (canWrite)
        mode |= 146;
      return mode;
    }, findObject: function(path, dontResolveLastLink) {
      var ret = FS.analyzePath(path, dontResolveLastLink);
      if (ret.exists) {
        return ret.object;
      } else {
        return null;
      }
    }, analyzePath: function(path, dontResolveLastLink) {
      try {
        var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
        path = lookup.path;
      } catch (e) {
      }
      var ret = { isRoot: false, exists: false, error: 0, name: null, path: null, object: null, parentExists: false, parentPath: null, parentObject: null };
      try {
        var lookup = FS.lookupPath(path, { parent: true });
        ret.parentExists = true;
        ret.parentPath = lookup.path;
        ret.parentObject = lookup.node;
        ret.name = PATH.basename(path);
        lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
        ret.exists = true;
        ret.path = lookup.path;
        ret.object = lookup.node;
        ret.name = lookup.node.name;
        ret.isRoot = lookup.path === "/";
      } catch (e) {
        ret.error = e.errno;
      }
      return ret;
    }, createPath: function(parent, path, canRead, canWrite) {
      parent = typeof parent === "string" ? parent : FS.getPath(parent);
      var parts = path.split("/").reverse();
      while (parts.length) {
        var part = parts.pop();
        if (!part)
          continue;
        var current = PATH.join2(parent, part);
        try {
          FS.mkdir(current);
        } catch (e) {
        }
        parent = current;
      }
      return current;
    }, createFile: function(parent, name, properties, canRead, canWrite) {
      var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
      var mode = FS.getMode(canRead, canWrite);
      return FS.create(path, mode);
    }, createDataFile: function(parent, name, data, canRead, canWrite, canOwn) {
      var path = name ? PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name) : parent;
      var mode = FS.getMode(canRead, canWrite);
      var node = FS.create(path, mode);
      if (data) {
        if (typeof data === "string") {
          var arr = new Array(data.length);
          for (var i2 = 0, len = data.length; i2 < len; ++i2)
            arr[i2] = data.charCodeAt(i2);
          data = arr;
        }
        FS.chmod(node, mode | 146);
        var stream = FS.open(node, 577);
        FS.write(stream, data, 0, data.length, 0, canOwn);
        FS.close(stream);
        FS.chmod(node, mode);
      }
      return node;
    }, createDevice: function(parent, name, input, output) {
      var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
      var mode = FS.getMode(!!input, !!output);
      if (!FS.createDevice.major)
        FS.createDevice.major = 64;
      var dev = FS.makedev(FS.createDevice.major++, 0);
      FS.registerDevice(dev, { open: function(stream) {
        stream.seekable = false;
      }, close: function(stream) {
        if (output && output.buffer && output.buffer.length) {
          output(10);
        }
      }, read: function(stream, buffer2, offset, length, pos) {
        var bytesRead = 0;
        for (var i2 = 0; i2 < length; i2++) {
          var result;
          try {
            result = input();
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
          if (result === void 0 && bytesRead === 0) {
            throw new FS.ErrnoError(6);
          }
          if (result === null || result === void 0)
            break;
          bytesRead++;
          buffer2[offset + i2] = result;
        }
        if (bytesRead) {
          stream.node.timestamp = Date.now();
        }
        return bytesRead;
      }, write: function(stream, buffer2, offset, length, pos) {
        for (var i2 = 0; i2 < length; i2++) {
          try {
            output(buffer2[offset + i2]);
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
        }
        if (length) {
          stream.node.timestamp = Date.now();
        }
        return i2;
      } });
      return FS.mkdev(path, mode, dev);
    }, forceLoadFile: function(obj) {
      if (obj.isDevice || obj.isFolder || obj.link || obj.contents)
        return true;
      if (typeof XMLHttpRequest !== "undefined") {
        throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
      } else if (read_) {
        try {
          obj.contents = intArrayFromString(read_(obj.url), true);
          obj.usedBytes = obj.contents.length;
        } catch (e) {
          throw new FS.ErrnoError(29);
        }
      } else {
        throw new Error("Cannot load without read() or XMLHttpRequest.");
      }
    }, createLazyFile: function(parent, name, url, canRead, canWrite) {
      function LazyUint8Array() {
        this.lengthKnown = false;
        this.chunks = [];
      }
      LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
        if (idx > this.length - 1 || idx < 0) {
          return void 0;
        }
        var chunkOffset = idx % this.chunkSize;
        var chunkNum = idx / this.chunkSize | 0;
        return this.getter(chunkNum)[chunkOffset];
      };
      LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
        this.getter = getter;
      };
      LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
        var xhr = new XMLHttpRequest();
        xhr.open("HEAD", url, false);
        xhr.send(null);
        if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304))
          throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
        var datalength = Number(xhr.getResponseHeader("Content-length"));
        var header;
        var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
        var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
        var chunkSize = 1024 * 1024;
        if (!hasByteServing)
          chunkSize = datalength;
        var doXHR = function(from, to) {
          if (from > to)
            throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
          if (to > datalength - 1)
            throw new Error("only " + datalength + " bytes available! programmer error!");
          var xhr2 = new XMLHttpRequest();
          xhr2.open("GET", url, false);
          if (datalength !== chunkSize)
            xhr2.setRequestHeader("Range", "bytes=" + from + "-" + to);
          if (typeof Uint8Array != "undefined")
            xhr2.responseType = "arraybuffer";
          if (xhr2.overrideMimeType) {
            xhr2.overrideMimeType("text/plain; charset=x-user-defined");
          }
          xhr2.send(null);
          if (!(xhr2.status >= 200 && xhr2.status < 300 || xhr2.status === 304))
            throw new Error("Couldn't load " + url + ". Status: " + xhr2.status);
          if (xhr2.response !== void 0) {
            return new Uint8Array(xhr2.response || []);
          } else {
            return intArrayFromString(xhr2.responseText || "", true);
          }
        };
        var lazyArray2 = this;
        lazyArray2.setDataGetter(function(chunkNum) {
          var start = chunkNum * chunkSize;
          var end = (chunkNum + 1) * chunkSize - 1;
          end = Math.min(end, datalength - 1);
          if (typeof lazyArray2.chunks[chunkNum] === "undefined") {
            lazyArray2.chunks[chunkNum] = doXHR(start, end);
          }
          if (typeof lazyArray2.chunks[chunkNum] === "undefined")
            throw new Error("doXHR failed!");
          return lazyArray2.chunks[chunkNum];
        });
        if (usesGzip || !datalength) {
          chunkSize = datalength = 1;
          datalength = this.getter(0).length;
          chunkSize = datalength;
          out("LazyFiles on gzip forces download of the whole file when length is accessed");
        }
        this._length = datalength;
        this._chunkSize = chunkSize;
        this.lengthKnown = true;
      };
      if (typeof XMLHttpRequest !== "undefined") {
        throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
        var lazyArray = new LazyUint8Array();
        var properties = { isDevice: false, contents: lazyArray };
      } else {
        var properties = { isDevice: false, url };
      }
      var node = FS.createFile(parent, name, properties, canRead, canWrite);
      if (properties.contents) {
        node.contents = properties.contents;
      } else if (properties.url) {
        node.contents = null;
        node.url = properties.url;
      }
      Object.defineProperties(node, { usedBytes: { get: function() {
        return this.contents.length;
      } } });
      var stream_ops = {};
      var keys = Object.keys(node.stream_ops);
      keys.forEach(function(key) {
        var fn = node.stream_ops[key];
        stream_ops[key] = function forceLoadLazyFile() {
          FS.forceLoadFile(node);
          return fn.apply(null, arguments);
        };
      });
      stream_ops.read = function stream_ops_read(stream, buffer2, offset, length, position) {
        FS.forceLoadFile(node);
        var contents = stream.node.contents;
        if (position >= contents.length)
          return 0;
        var size = Math.min(contents.length - position, length);
        if (contents.slice) {
          for (var i2 = 0; i2 < size; i2++) {
            buffer2[offset + i2] = contents[position + i2];
          }
        } else {
          for (var i2 = 0; i2 < size; i2++) {
            buffer2[offset + i2] = contents.get(position + i2);
          }
        }
        return size;
      };
      node.stream_ops = stream_ops;
      return node;
    }, createPreloadedFile: function(parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) {
      Browser.init();
      var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
      function processData(byteArray) {
        function finish(byteArray2) {
          if (preFinish)
            preFinish();
          if (!dontCreateFile) {
            FS.createDataFile(parent, name, byteArray2, canRead, canWrite, canOwn);
          }
          if (onload)
            onload();
          removeRunDependency();
        }
        var handled = false;
        Module["preloadPlugins"].forEach(function(plugin) {
          if (handled)
            return;
          if (plugin["canHandle"](fullname)) {
            plugin["handle"](byteArray, fullname, finish, function() {
              if (onerror)
                onerror();
              removeRunDependency();
            });
            handled = true;
          }
        });
        if (!handled)
          finish(byteArray);
      }
      addRunDependency();
      if (typeof url == "string") {
        asyncLoad(url, function(byteArray) {
          processData(byteArray);
        }, onerror);
      } else {
        processData(url);
      }
    }, indexedDB: function() {
      return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    }, DB_NAME: function() {
      return "EM_FS_" + window.location.pathname;
    }, DB_VERSION: 20, DB_STORE_NAME: "FILE_DATA", saveFilesToDB: function(paths, onload, onerror) {
      onload = onload || function() {
      };
      onerror = onerror || function() {
      };
      var indexedDB = FS.indexedDB();
      try {
        var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
      } catch (e) {
        return onerror(e);
      }
      openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
        out("creating db");
        var db = openRequest.result;
        db.createObjectStore(FS.DB_STORE_NAME);
      };
      openRequest.onsuccess = function openRequest_onsuccess() {
        var db = openRequest.result;
        var transaction = db.transaction([FS.DB_STORE_NAME], "readwrite");
        var files = transaction.objectStore(FS.DB_STORE_NAME);
        var ok = 0, fail = 0, total = paths.length;
        function finish() {
          if (fail == 0)
            onload();
          else
            onerror();
        }
        paths.forEach(function(path) {
          var putRequest = files.put(FS.analyzePath(path).object.contents, path);
          putRequest.onsuccess = function putRequest_onsuccess() {
            ok++;
            if (ok + fail == total)
              finish();
          };
          putRequest.onerror = function putRequest_onerror() {
            fail++;
            if (ok + fail == total)
              finish();
          };
        });
        transaction.onerror = onerror;
      };
      openRequest.onerror = onerror;
    }, loadFilesFromDB: function(paths, onload, onerror) {
      onload = onload || function() {
      };
      onerror = onerror || function() {
      };
      var indexedDB = FS.indexedDB();
      try {
        var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
      } catch (e) {
        return onerror(e);
      }
      openRequest.onupgradeneeded = onerror;
      openRequest.onsuccess = function openRequest_onsuccess() {
        var db = openRequest.result;
        try {
          var transaction = db.transaction([FS.DB_STORE_NAME], "readonly");
        } catch (e) {
          onerror(e);
          return;
        }
        var files = transaction.objectStore(FS.DB_STORE_NAME);
        var ok = 0, fail = 0, total = paths.length;
        function finish() {
          if (fail == 0)
            onload();
          else
            onerror();
        }
        paths.forEach(function(path) {
          var getRequest = files.get(path);
          getRequest.onsuccess = function getRequest_onsuccess() {
            if (FS.analyzePath(path).exists) {
              FS.unlink(path);
            }
            FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
            ok++;
            if (ok + fail == total)
              finish();
          };
          getRequest.onerror = function getRequest_onerror() {
            fail++;
            if (ok + fail == total)
              finish();
          };
        });
        transaction.onerror = onerror;
      };
      openRequest.onerror = onerror;
    } };
    var SYSCALLS = { mappings: {}, DEFAULT_POLLMASK: 5, calculateAt: function(dirfd, path, allowEmpty) {
      if (path[0] === "/") {
        return path;
      }
      var dir;
      if (dirfd === -100) {
        dir = FS.cwd();
      } else {
        var dirstream = FS.getStream(dirfd);
        if (!dirstream)
          throw new FS.ErrnoError(8);
        dir = dirstream.path;
      }
      if (path.length == 0) {
        if (!allowEmpty) {
          throw new FS.ErrnoError(44);
        }
        return dir;
      }
      return PATH.join2(dir, path);
    }, doStat: function(func, path, buf) {
      try {
        var stat = func(path);
      } catch (e) {
        if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
          return -54;
        }
        throw e;
      }
      HEAP32[buf >> 2] = stat.dev;
      HEAP32[buf + 4 >> 2] = 0;
      HEAP32[buf + 8 >> 2] = stat.ino;
      HEAP32[buf + 12 >> 2] = stat.mode;
      HEAP32[buf + 16 >> 2] = stat.nlink;
      HEAP32[buf + 20 >> 2] = stat.uid;
      HEAP32[buf + 24 >> 2] = stat.gid;
      HEAP32[buf + 28 >> 2] = stat.rdev;
      HEAP32[buf + 32 >> 2] = 0;
      tempI64 = [stat.size >>> 0, (tempDouble = stat.size, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 40 >> 2] = tempI64[0], HEAP32[buf + 44 >> 2] = tempI64[1];
      HEAP32[buf + 48 >> 2] = 4096;
      HEAP32[buf + 52 >> 2] = stat.blocks;
      HEAP32[buf + 56 >> 2] = stat.atime.getTime() / 1e3 | 0;
      HEAP32[buf + 60 >> 2] = 0;
      HEAP32[buf + 64 >> 2] = stat.mtime.getTime() / 1e3 | 0;
      HEAP32[buf + 68 >> 2] = 0;
      HEAP32[buf + 72 >> 2] = stat.ctime.getTime() / 1e3 | 0;
      HEAP32[buf + 76 >> 2] = 0;
      tempI64 = [stat.ino >>> 0, (tempDouble = stat.ino, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 80 >> 2] = tempI64[0], HEAP32[buf + 84 >> 2] = tempI64[1];
      return 0;
    }, doMsync: function(addr, stream, len, flags, offset) {
      var buffer2 = HEAPU8.slice(addr, addr + len);
      FS.msync(stream, buffer2, offset, len, flags);
    }, doMkdir: function(path, mode) {
      path = PATH.normalize(path);
      if (path[path.length - 1] === "/")
        path = path.substr(0, path.length - 1);
      FS.mkdir(path, mode, 0);
      return 0;
    }, doMknod: function(path, mode, dev) {
      switch (mode & 61440) {
        case 32768:
        case 8192:
        case 24576:
        case 4096:
        case 49152:
          break;
        default:
          return -28;
      }
      FS.mknod(path, mode, dev);
      return 0;
    }, doReadlink: function(path, buf, bufsize) {
      if (bufsize <= 0)
        return -28;
      var ret = FS.readlink(path);
      var len = Math.min(bufsize, lengthBytesUTF8(ret));
      var endChar = HEAP8[buf + len];
      stringToUTF8(ret, buf, bufsize + 1);
      HEAP8[buf + len] = endChar;
      return len;
    }, doAccess: function(path, amode) {
      if (amode & ~7) {
        return -28;
      }
      var lookup = FS.lookupPath(path, { follow: true });
      var node = lookup.node;
      if (!node) {
        return -44;
      }
      var perms = "";
      if (amode & 4)
        perms += "r";
      if (amode & 2)
        perms += "w";
      if (amode & 1)
        perms += "x";
      if (perms && FS.nodePermissions(node, perms)) {
        return -2;
      }
      return 0;
    }, doDup: function(path, flags, suggestFD) {
      var suggest = FS.getStream(suggestFD);
      if (suggest)
        FS.close(suggest);
      return FS.open(path, flags, 0, suggestFD, suggestFD).fd;
    }, doReadv: function(stream, iov, iovcnt, offset) {
      var ret = 0;
      for (var i2 = 0; i2 < iovcnt; i2++) {
        var ptr = HEAP32[iov + i2 * 8 >> 2];
        var len = HEAP32[iov + (i2 * 8 + 4) >> 2];
        var curr = FS.read(stream, HEAP8, ptr, len, offset);
        if (curr < 0)
          return -1;
        ret += curr;
        if (curr < len)
          break;
      }
      return ret;
    }, doWritev: function(stream, iov, iovcnt, offset) {
      var ret = 0;
      for (var i2 = 0; i2 < iovcnt; i2++) {
        var ptr = HEAP32[iov + i2 * 8 >> 2];
        var len = HEAP32[iov + (i2 * 8 + 4) >> 2];
        var curr = FS.write(stream, HEAP8, ptr, len, offset);
        if (curr < 0)
          return -1;
        ret += curr;
      }
      return ret;
    }, varargs: void 0, get: function() {
      SYSCALLS.varargs += 4;
      var ret = HEAP32[SYSCALLS.varargs - 4 >> 2];
      return ret;
    }, getStr: function(ptr) {
      var ret = UTF8ToString(ptr);
      return ret;
    }, getStreamFromFD: function(fd) {
      var stream = FS.getStream(fd);
      if (!stream)
        throw new FS.ErrnoError(8);
      return stream;
    }, get64: function(low, high) {
      return low;
    } };
    function ___syscall_fcntl64(fd, cmd, varargs) {
      SYSCALLS.varargs = varargs;
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        switch (cmd) {
          case 0: {
            var arg = SYSCALLS.get();
            if (arg < 0) {
              return -28;
            }
            var newStream;
            newStream = FS.open(stream.path, stream.flags, 0, arg);
            return newStream.fd;
          }
          case 1:
          case 2:
            return 0;
          case 3:
            return stream.flags;
          case 4: {
            var arg = SYSCALLS.get();
            stream.flags |= arg;
            return 0;
          }
          case 5: {
            var arg = SYSCALLS.get();
            var offset = 0;
            HEAP16[arg + offset >> 1] = 2;
            return 0;
          }
          case 6:
          case 7:
            return 0;
          case 16:
          case 8:
            return -28;
          case 9:
            setErrNo(28);
            return -1;
          default: {
            return -28;
          }
        }
      } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
          throw e;
        return -e.errno;
      }
    }
    function ___syscall_ioctl(fd, op, varargs) {
      SYSCALLS.varargs = varargs;
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        switch (op) {
          case 21509:
          case 21505: {
            if (!stream.tty)
              return -59;
            return 0;
          }
          case 21510:
          case 21511:
          case 21512:
          case 21506:
          case 21507:
          case 21508: {
            if (!stream.tty)
              return -59;
            return 0;
          }
          case 21519: {
            if (!stream.tty)
              return -59;
            var argp = SYSCALLS.get();
            HEAP32[argp >> 2] = 0;
            return 0;
          }
          case 21520: {
            if (!stream.tty)
              return -59;
            return -28;
          }
          case 21531: {
            var argp = SYSCALLS.get();
            return FS.ioctl(stream, op, argp);
          }
          case 21523: {
            if (!stream.tty)
              return -59;
            return 0;
          }
          case 21524: {
            if (!stream.tty)
              return -59;
            return 0;
          }
          default:
            abort("bad ioctl syscall " + op);
        }
      } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
          throw e;
        return -e.errno;
      }
    }
    function ___syscall_open(path, flags, varargs) {
      SYSCALLS.varargs = varargs;
      try {
        var pathname = SYSCALLS.getStr(path);
        var mode = varargs ? SYSCALLS.get() : 0;
        var stream = FS.open(pathname, flags, mode);
        return stream.fd;
      } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
          throw e;
        return -e.errno;
      }
    }
    var structRegistrations = {};
    function runDestructors(destructors) {
      while (destructors.length) {
        var ptr = destructors.pop();
        var del = destructors.pop();
        del(ptr);
      }
    }
    function simpleReadValueFromPointer(pointer) {
      return this["fromWireType"](HEAPU32[pointer >> 2]);
    }
    var awaitingDependencies = {};
    var registeredTypes = {};
    var typeDependencies = {};
    var char_0 = 48;
    var char_9 = 57;
    function makeLegalFunctionName(name) {
      if (name === void 0) {
        return "_unknown";
      }
      name = name.replace(/[^a-zA-Z0-9_]/g, "$");
      var f = name.charCodeAt(0);
      if (f >= char_0 && f <= char_9) {
        return "_" + name;
      } else {
        return name;
      }
    }
    function createNamedFunction(name, body) {
      name = makeLegalFunctionName(name);
      return new Function("body", "return function " + name + '() {\n    "use strict";    return body.apply(this, arguments);\n};\n')(body);
    }
    function extendError(baseErrorType, errorName) {
      var errorClass = createNamedFunction(errorName, function(message) {
        this.name = errorName;
        this.message = message;
        var stack = new Error(message).stack;
        if (stack !== void 0) {
          this.stack = this.toString() + "\n" + stack.replace(/^Error(:[^\n]*)?\n/, "");
        }
      });
      errorClass.prototype = Object.create(baseErrorType.prototype);
      errorClass.prototype.constructor = errorClass;
      errorClass.prototype.toString = function() {
        if (this.message === void 0) {
          return this.name;
        } else {
          return this.name + ": " + this.message;
        }
      };
      return errorClass;
    }
    var InternalError = void 0;
    function throwInternalError(message) {
      throw new InternalError(message);
    }
    function whenDependentTypesAreResolved(myTypes, dependentTypes, getTypeConverters) {
      myTypes.forEach(function(type) {
        typeDependencies[type] = dependentTypes;
      });
      function onComplete(typeConverters2) {
        var myTypeConverters = getTypeConverters(typeConverters2);
        if (myTypeConverters.length !== myTypes.length) {
          throwInternalError("Mismatched type converter count");
        }
        for (var i2 = 0; i2 < myTypes.length; ++i2) {
          registerType(myTypes[i2], myTypeConverters[i2]);
        }
      }
      var typeConverters = new Array(dependentTypes.length);
      var unregisteredTypes = [];
      var registered = 0;
      dependentTypes.forEach(function(dt, i2) {
        if (registeredTypes.hasOwnProperty(dt)) {
          typeConverters[i2] = registeredTypes[dt];
        } else {
          unregisteredTypes.push(dt);
          if (!awaitingDependencies.hasOwnProperty(dt)) {
            awaitingDependencies[dt] = [];
          }
          awaitingDependencies[dt].push(function() {
            typeConverters[i2] = registeredTypes[dt];
            ++registered;
            if (registered === unregisteredTypes.length) {
              onComplete(typeConverters);
            }
          });
        }
      });
      if (unregisteredTypes.length === 0) {
        onComplete(typeConverters);
      }
    }
    function __embind_finalize_value_object(structType) {
      var reg = structRegistrations[structType];
      delete structRegistrations[structType];
      var rawConstructor = reg.rawConstructor;
      var rawDestructor = reg.rawDestructor;
      var fieldRecords = reg.fields;
      var fieldTypes = fieldRecords.map(function(field) {
        return field.getterReturnType;
      }).concat(fieldRecords.map(function(field) {
        return field.setterArgumentType;
      }));
      whenDependentTypesAreResolved([structType], fieldTypes, function(fieldTypes2) {
        var fields = {};
        fieldRecords.forEach(function(field, i2) {
          var fieldName = field.fieldName;
          var getterReturnType = fieldTypes2[i2];
          var getter = field.getter;
          var getterContext = field.getterContext;
          var setterArgumentType = fieldTypes2[i2 + fieldRecords.length];
          var setter = field.setter;
          var setterContext = field.setterContext;
          fields[fieldName] = { read: function(ptr) {
            return getterReturnType["fromWireType"](getter(getterContext, ptr));
          }, write: function(ptr, o) {
            var destructors = [];
            setter(setterContext, ptr, setterArgumentType["toWireType"](destructors, o));
            runDestructors(destructors);
          } };
        });
        return [{ name: reg.name, "fromWireType": function(ptr) {
          var rv = {};
          for (var i2 in fields) {
            rv[i2] = fields[i2].read(ptr);
          }
          rawDestructor(ptr);
          return rv;
        }, "toWireType": function(destructors, o) {
          for (var fieldName in fields) {
            if (!(fieldName in o)) {
              throw new TypeError('Missing field:  "' + fieldName + '"');
            }
          }
          var ptr = rawConstructor();
          for (fieldName in fields) {
            fields[fieldName].write(ptr, o[fieldName]);
          }
          if (destructors !== null) {
            destructors.push(rawDestructor, ptr);
          }
          return ptr;
        }, "argPackAdvance": 8, "readValueFromPointer": simpleReadValueFromPointer, destructorFunction: rawDestructor }];
      });
    }
    function __embind_register_bigint(primitiveType, name, size, minRange, maxRange) {
    }
    function getShiftFromSize(size) {
      switch (size) {
        case 1:
          return 0;
        case 2:
          return 1;
        case 4:
          return 2;
        case 8:
          return 3;
        default:
          throw new TypeError("Unknown type size: " + size);
      }
    }
    function embind_init_charCodes() {
      var codes = new Array(256);
      for (var i2 = 0; i2 < 256; ++i2) {
        codes[i2] = String.fromCharCode(i2);
      }
      embind_charCodes = codes;
    }
    var embind_charCodes = void 0;
    function readLatin1String(ptr) {
      var ret = "";
      var c = ptr;
      while (HEAPU8[c]) {
        ret += embind_charCodes[HEAPU8[c++]];
      }
      return ret;
    }
    var BindingError = void 0;
    function throwBindingError(message) {
      throw new BindingError(message);
    }
    function registerType(rawType, registeredInstance, options) {
      options = options || {};
      if (!("argPackAdvance" in registeredInstance)) {
        throw new TypeError("registerType registeredInstance requires argPackAdvance");
      }
      var name = registeredInstance.name;
      if (!rawType) {
        throwBindingError('type "' + name + '" must have a positive integer typeid pointer');
      }
      if (registeredTypes.hasOwnProperty(rawType)) {
        if (options.ignoreDuplicateRegistrations) {
          return;
        } else {
          throwBindingError("Cannot register type '" + name + "' twice");
        }
      }
      registeredTypes[rawType] = registeredInstance;
      delete typeDependencies[rawType];
      if (awaitingDependencies.hasOwnProperty(rawType)) {
        var callbacks = awaitingDependencies[rawType];
        delete awaitingDependencies[rawType];
        callbacks.forEach(function(cb) {
          cb();
        });
      }
    }
    function __embind_register_bool(rawType, name, size, trueValue, falseValue) {
      var shift = getShiftFromSize(size);
      name = readLatin1String(name);
      registerType(rawType, { name, "fromWireType": function(wt) {
        return !!wt;
      }, "toWireType": function(destructors, o) {
        return o ? trueValue : falseValue;
      }, "argPackAdvance": 8, "readValueFromPointer": function(pointer) {
        var heap;
        if (size === 1) {
          heap = HEAP8;
        } else if (size === 2) {
          heap = HEAP16;
        } else if (size === 4) {
          heap = HEAP32;
        } else {
          throw new TypeError("Unknown boolean type size: " + name);
        }
        return this["fromWireType"](heap[pointer >> shift]);
      }, destructorFunction: null });
    }
    function ClassHandle_isAliasOf(other) {
      if (!(this instanceof ClassHandle)) {
        return false;
      }
      if (!(other instanceof ClassHandle)) {
        return false;
      }
      var leftClass = this.$$.ptrType.registeredClass;
      var left = this.$$.ptr;
      var rightClass = other.$$.ptrType.registeredClass;
      var right = other.$$.ptr;
      while (leftClass.baseClass) {
        left = leftClass.upcast(left);
        leftClass = leftClass.baseClass;
      }
      while (rightClass.baseClass) {
        right = rightClass.upcast(right);
        rightClass = rightClass.baseClass;
      }
      return leftClass === rightClass && left === right;
    }
    function shallowCopyInternalPointer(o) {
      return { count: o.count, deleteScheduled: o.deleteScheduled, preservePointerOnDelete: o.preservePointerOnDelete, ptr: o.ptr, ptrType: o.ptrType, smartPtr: o.smartPtr, smartPtrType: o.smartPtrType };
    }
    function throwInstanceAlreadyDeleted(obj) {
      function getInstanceTypeName(handle) {
        return handle.$$.ptrType.registeredClass.name;
      }
      throwBindingError(getInstanceTypeName(obj) + " instance already deleted");
    }
    var finalizationGroup = false;
    function detachFinalizer(handle) {
    }
    function runDestructor($$) {
      if ($$.smartPtr) {
        $$.smartPtrType.rawDestructor($$.smartPtr);
      } else {
        $$.ptrType.registeredClass.rawDestructor($$.ptr);
      }
    }
    function releaseClassHandle($$) {
      $$.count.value -= 1;
      var toDelete = $$.count.value === 0;
      if (toDelete) {
        runDestructor($$);
      }
    }
    function attachFinalizer(handle) {
      if (typeof FinalizationGroup === "undefined") {
        attachFinalizer = function(handle2) {
          return handle2;
        };
        return handle;
      }
      finalizationGroup = new FinalizationGroup(function(iter) {
        for (var result = iter.next(); !result.done; result = iter.next()) {
          var $$ = result.value;
          if (!$$.ptr) {
            console.warn("object already deleted: " + $$.ptr);
          } else {
            releaseClassHandle($$);
          }
        }
      });
      attachFinalizer = function(handle2) {
        finalizationGroup.register(handle2, handle2.$$, handle2.$$);
        return handle2;
      };
      detachFinalizer = function(handle2) {
        finalizationGroup.unregister(handle2.$$);
      };
      return attachFinalizer(handle);
    }
    function ClassHandle_clone() {
      if (!this.$$.ptr) {
        throwInstanceAlreadyDeleted(this);
      }
      if (this.$$.preservePointerOnDelete) {
        this.$$.count.value += 1;
        return this;
      } else {
        var clone = attachFinalizer(Object.create(Object.getPrototypeOf(this), { $$: { value: shallowCopyInternalPointer(this.$$) } }));
        clone.$$.count.value += 1;
        clone.$$.deleteScheduled = false;
        return clone;
      }
    }
    function ClassHandle_delete() {
      if (!this.$$.ptr) {
        throwInstanceAlreadyDeleted(this);
      }
      if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
        throwBindingError("Object already scheduled for deletion");
      }
      detachFinalizer(this);
      releaseClassHandle(this.$$);
      if (!this.$$.preservePointerOnDelete) {
        this.$$.smartPtr = void 0;
        this.$$.ptr = void 0;
      }
    }
    function ClassHandle_isDeleted() {
      return !this.$$.ptr;
    }
    var delayFunction = void 0;
    var deletionQueue = [];
    function flushPendingDeletes() {
      while (deletionQueue.length) {
        var obj = deletionQueue.pop();
        obj.$$.deleteScheduled = false;
        obj["delete"]();
      }
    }
    function ClassHandle_deleteLater() {
      if (!this.$$.ptr) {
        throwInstanceAlreadyDeleted(this);
      }
      if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
        throwBindingError("Object already scheduled for deletion");
      }
      deletionQueue.push(this);
      if (deletionQueue.length === 1 && delayFunction) {
        delayFunction(flushPendingDeletes);
      }
      this.$$.deleteScheduled = true;
      return this;
    }
    function init_ClassHandle() {
      ClassHandle.prototype["isAliasOf"] = ClassHandle_isAliasOf;
      ClassHandle.prototype["clone"] = ClassHandle_clone;
      ClassHandle.prototype["delete"] = ClassHandle_delete;
      ClassHandle.prototype["isDeleted"] = ClassHandle_isDeleted;
      ClassHandle.prototype["deleteLater"] = ClassHandle_deleteLater;
    }
    function ClassHandle() {
    }
    var registeredPointers = {};
    function ensureOverloadTable(proto, methodName, humanName) {
      if (proto[methodName].overloadTable === void 0) {
        var prevFunc = proto[methodName];
        proto[methodName] = function() {
          if (!proto[methodName].overloadTable.hasOwnProperty(arguments.length)) {
            throwBindingError("Function '" + humanName + "' called with an invalid number of arguments (" + arguments.length + ") - expects one of (" + proto[methodName].overloadTable + ")!");
          }
          return proto[methodName].overloadTable[arguments.length].apply(this, arguments);
        };
        proto[methodName].overloadTable = [];
        proto[methodName].overloadTable[prevFunc.argCount] = prevFunc;
      }
    }
    function exposePublicSymbol(name, value, numArguments) {
      if (Module.hasOwnProperty(name)) {
        if (numArguments === void 0 || Module[name].overloadTable !== void 0 && Module[name].overloadTable[numArguments] !== void 0) {
          throwBindingError("Cannot register public name '" + name + "' twice");
        }
        ensureOverloadTable(Module, name, name);
        if (Module.hasOwnProperty(numArguments)) {
          throwBindingError("Cannot register multiple overloads of a function with the same number of arguments (" + numArguments + ")!");
        }
        Module[name].overloadTable[numArguments] = value;
      } else {
        Module[name] = value;
        if (numArguments !== void 0) {
          Module[name].numArguments = numArguments;
        }
      }
    }
    function RegisteredClass(name, constructor, instancePrototype, rawDestructor, baseClass, getActualType, upcast, downcast) {
      this.name = name;
      this.constructor = constructor;
      this.instancePrototype = instancePrototype;
      this.rawDestructor = rawDestructor;
      this.baseClass = baseClass;
      this.getActualType = getActualType;
      this.upcast = upcast;
      this.downcast = downcast;
      this.pureVirtualFunctions = [];
    }
    function upcastPointer(ptr, ptrClass, desiredClass) {
      while (ptrClass !== desiredClass) {
        if (!ptrClass.upcast) {
          throwBindingError("Expected null or instance of " + desiredClass.name + ", got an instance of " + ptrClass.name);
        }
        ptr = ptrClass.upcast(ptr);
        ptrClass = ptrClass.baseClass;
      }
      return ptr;
    }
    function constNoSmartPtrRawPointerToWireType(destructors, handle) {
      if (handle === null) {
        if (this.isReference) {
          throwBindingError("null is not a valid " + this.name);
        }
        return 0;
      }
      if (!handle.$$) {
        throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name);
      }
      if (!handle.$$.ptr) {
        throwBindingError("Cannot pass deleted object as a pointer of type " + this.name);
      }
      var handleClass = handle.$$.ptrType.registeredClass;
      var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
      return ptr;
    }
    function genericPointerToWireType(destructors, handle) {
      var ptr;
      if (handle === null) {
        if (this.isReference) {
          throwBindingError("null is not a valid " + this.name);
        }
        if (this.isSmartPointer) {
          ptr = this.rawConstructor();
          if (destructors !== null) {
            destructors.push(this.rawDestructor, ptr);
          }
          return ptr;
        } else {
          return 0;
        }
      }
      if (!handle.$$) {
        throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name);
      }
      if (!handle.$$.ptr) {
        throwBindingError("Cannot pass deleted object as a pointer of type " + this.name);
      }
      if (!this.isConst && handle.$$.ptrType.isConst) {
        throwBindingError("Cannot convert argument of type " + (handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name) + " to parameter type " + this.name);
      }
      var handleClass = handle.$$.ptrType.registeredClass;
      ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
      if (this.isSmartPointer) {
        if (handle.$$.smartPtr === void 0) {
          throwBindingError("Passing raw pointer to smart pointer is illegal");
        }
        switch (this.sharingPolicy) {
          case 0:
            if (handle.$$.smartPtrType === this) {
              ptr = handle.$$.smartPtr;
            } else {
              throwBindingError("Cannot convert argument of type " + (handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name) + " to parameter type " + this.name);
            }
            break;
          case 1:
            ptr = handle.$$.smartPtr;
            break;
          case 2:
            if (handle.$$.smartPtrType === this) {
              ptr = handle.$$.smartPtr;
            } else {
              var clonedHandle = handle["clone"]();
              ptr = this.rawShare(ptr, Emval.toHandle(function() {
                clonedHandle["delete"]();
              }));
              if (destructors !== null) {
                destructors.push(this.rawDestructor, ptr);
              }
            }
            break;
          default:
            throwBindingError("Unsupporting sharing policy");
        }
      }
      return ptr;
    }
    function nonConstNoSmartPtrRawPointerToWireType(destructors, handle) {
      if (handle === null) {
        if (this.isReference) {
          throwBindingError("null is not a valid " + this.name);
        }
        return 0;
      }
      if (!handle.$$) {
        throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name);
      }
      if (!handle.$$.ptr) {
        throwBindingError("Cannot pass deleted object as a pointer of type " + this.name);
      }
      if (handle.$$.ptrType.isConst) {
        throwBindingError("Cannot convert argument of type " + handle.$$.ptrType.name + " to parameter type " + this.name);
      }
      var handleClass = handle.$$.ptrType.registeredClass;
      var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
      return ptr;
    }
    function RegisteredPointer_getPointee(ptr) {
      if (this.rawGetPointee) {
        ptr = this.rawGetPointee(ptr);
      }
      return ptr;
    }
    function RegisteredPointer_destructor(ptr) {
      if (this.rawDestructor) {
        this.rawDestructor(ptr);
      }
    }
    function RegisteredPointer_deleteObject(handle) {
      if (handle !== null) {
        handle["delete"]();
      }
    }
    function downcastPointer(ptr, ptrClass, desiredClass) {
      if (ptrClass === desiredClass) {
        return ptr;
      }
      if (desiredClass.baseClass === void 0) {
        return null;
      }
      var rv = downcastPointer(ptr, ptrClass, desiredClass.baseClass);
      if (rv === null) {
        return null;
      }
      return desiredClass.downcast(rv);
    }
    function getInheritedInstanceCount() {
      return Object.keys(registeredInstances).length;
    }
    function getLiveInheritedInstances() {
      var rv = [];
      for (var k in registeredInstances) {
        if (registeredInstances.hasOwnProperty(k)) {
          rv.push(registeredInstances[k]);
        }
      }
      return rv;
    }
    function setDelayFunction(fn) {
      delayFunction = fn;
      if (deletionQueue.length && delayFunction) {
        delayFunction(flushPendingDeletes);
      }
    }
    function init_embind() {
      Module["getInheritedInstanceCount"] = getInheritedInstanceCount;
      Module["getLiveInheritedInstances"] = getLiveInheritedInstances;
      Module["flushPendingDeletes"] = flushPendingDeletes;
      Module["setDelayFunction"] = setDelayFunction;
    }
    var registeredInstances = {};
    function getBasestPointer(class_, ptr) {
      if (ptr === void 0) {
        throwBindingError("ptr should not be undefined");
      }
      while (class_.baseClass) {
        ptr = class_.upcast(ptr);
        class_ = class_.baseClass;
      }
      return ptr;
    }
    function getInheritedInstance(class_, ptr) {
      ptr = getBasestPointer(class_, ptr);
      return registeredInstances[ptr];
    }
    function makeClassHandle(prototype, record) {
      if (!record.ptrType || !record.ptr) {
        throwInternalError("makeClassHandle requires ptr and ptrType");
      }
      var hasSmartPtrType = !!record.smartPtrType;
      var hasSmartPtr = !!record.smartPtr;
      if (hasSmartPtrType !== hasSmartPtr) {
        throwInternalError("Both smartPtrType and smartPtr must be specified");
      }
      record.count = { value: 1 };
      return attachFinalizer(Object.create(prototype, { $$: { value: record } }));
    }
    function RegisteredPointer_fromWireType(ptr) {
      var rawPointer = this.getPointee(ptr);
      if (!rawPointer) {
        this.destructor(ptr);
        return null;
      }
      var registeredInstance = getInheritedInstance(this.registeredClass, rawPointer);
      if (registeredInstance !== void 0) {
        if (registeredInstance.$$.count.value === 0) {
          registeredInstance.$$.ptr = rawPointer;
          registeredInstance.$$.smartPtr = ptr;
          return registeredInstance["clone"]();
        } else {
          var rv = registeredInstance["clone"]();
          this.destructor(ptr);
          return rv;
        }
      }
      function makeDefaultHandle() {
        if (this.isSmartPointer) {
          return makeClassHandle(this.registeredClass.instancePrototype, { ptrType: this.pointeeType, ptr: rawPointer, smartPtrType: this, smartPtr: ptr });
        } else {
          return makeClassHandle(this.registeredClass.instancePrototype, { ptrType: this, ptr });
        }
      }
      var actualType = this.registeredClass.getActualType(rawPointer);
      var registeredPointerRecord = registeredPointers[actualType];
      if (!registeredPointerRecord) {
        return makeDefaultHandle.call(this);
      }
      var toType;
      if (this.isConst) {
        toType = registeredPointerRecord.constPointerType;
      } else {
        toType = registeredPointerRecord.pointerType;
      }
      var dp = downcastPointer(rawPointer, this.registeredClass, toType.registeredClass);
      if (dp === null) {
        return makeDefaultHandle.call(this);
      }
      if (this.isSmartPointer) {
        return makeClassHandle(toType.registeredClass.instancePrototype, { ptrType: toType, ptr: dp, smartPtrType: this, smartPtr: ptr });
      } else {
        return makeClassHandle(toType.registeredClass.instancePrototype, { ptrType: toType, ptr: dp });
      }
    }
    function init_RegisteredPointer() {
      RegisteredPointer.prototype.getPointee = RegisteredPointer_getPointee;
      RegisteredPointer.prototype.destructor = RegisteredPointer_destructor;
      RegisteredPointer.prototype["argPackAdvance"] = 8;
      RegisteredPointer.prototype["readValueFromPointer"] = simpleReadValueFromPointer;
      RegisteredPointer.prototype["deleteObject"] = RegisteredPointer_deleteObject;
      RegisteredPointer.prototype["fromWireType"] = RegisteredPointer_fromWireType;
    }
    function RegisteredPointer(name, registeredClass, isReference, isConst, isSmartPointer, pointeeType, sharingPolicy, rawGetPointee, rawConstructor, rawShare, rawDestructor) {
      this.name = name;
      this.registeredClass = registeredClass;
      this.isReference = isReference;
      this.isConst = isConst;
      this.isSmartPointer = isSmartPointer;
      this.pointeeType = pointeeType;
      this.sharingPolicy = sharingPolicy;
      this.rawGetPointee = rawGetPointee;
      this.rawConstructor = rawConstructor;
      this.rawShare = rawShare;
      this.rawDestructor = rawDestructor;
      if (!isSmartPointer && registeredClass.baseClass === void 0) {
        if (isConst) {
          this["toWireType"] = constNoSmartPtrRawPointerToWireType;
          this.destructorFunction = null;
        } else {
          this["toWireType"] = nonConstNoSmartPtrRawPointerToWireType;
          this.destructorFunction = null;
        }
      } else {
        this["toWireType"] = genericPointerToWireType;
      }
    }
    function replacePublicSymbol(name, value, numArguments) {
      if (!Module.hasOwnProperty(name)) {
        throwInternalError("Replacing nonexistant public symbol");
      }
      if (Module[name].overloadTable !== void 0 && numArguments !== void 0) {
        Module[name].overloadTable[numArguments] = value;
      } else {
        Module[name] = value;
        Module[name].argCount = numArguments;
      }
    }
    function dynCallLegacy(sig, ptr, args) {
      var f = Module["dynCall_" + sig];
      return args && args.length ? f.apply(null, [ptr].concat(args)) : f.call(null, ptr);
    }
    function dynCall(sig, ptr, args) {
      return dynCallLegacy(sig, ptr, args);
    }
    function getDynCaller(sig, ptr) {
      var argCache = [];
      return function() {
        argCache.length = arguments.length;
        for (var i2 = 0; i2 < arguments.length; i2++) {
          argCache[i2] = arguments[i2];
        }
        return dynCall(sig, ptr, argCache);
      };
    }
    function embind__requireFunction(signature, rawFunction) {
      signature = readLatin1String(signature);
      function makeDynCaller() {
        return getDynCaller(signature, rawFunction);
      }
      var fp = makeDynCaller();
      if (typeof fp !== "function") {
        throwBindingError("unknown function pointer with signature " + signature + ": " + rawFunction);
      }
      return fp;
    }
    var UnboundTypeError = void 0;
    function getTypeName(type) {
      var ptr = ___getTypeName(type);
      var rv = readLatin1String(ptr);
      _free(ptr);
      return rv;
    }
    function throwUnboundTypeError(message, types) {
      var unboundTypes = [];
      var seen = {};
      function visit(type) {
        if (seen[type]) {
          return;
        }
        if (registeredTypes[type]) {
          return;
        }
        if (typeDependencies[type]) {
          typeDependencies[type].forEach(visit);
          return;
        }
        unboundTypes.push(type);
        seen[type] = true;
      }
      types.forEach(visit);
      throw new UnboundTypeError(message + ": " + unboundTypes.map(getTypeName).join([", "]));
    }
    function __embind_register_class(rawType, rawPointerType, rawConstPointerType, baseClassRawType, getActualTypeSignature, getActualType, upcastSignature, upcast, downcastSignature, downcast, name, destructorSignature, rawDestructor) {
      name = readLatin1String(name);
      getActualType = embind__requireFunction(getActualTypeSignature, getActualType);
      if (upcast) {
        upcast = embind__requireFunction(upcastSignature, upcast);
      }
      if (downcast) {
        downcast = embind__requireFunction(downcastSignature, downcast);
      }
      rawDestructor = embind__requireFunction(destructorSignature, rawDestructor);
      var legalFunctionName = makeLegalFunctionName(name);
      exposePublicSymbol(legalFunctionName, function() {
        throwUnboundTypeError("Cannot construct " + name + " due to unbound types", [baseClassRawType]);
      });
      whenDependentTypesAreResolved([rawType, rawPointerType, rawConstPointerType], baseClassRawType ? [baseClassRawType] : [], function(base) {
        base = base[0];
        var baseClass;
        var basePrototype;
        if (baseClassRawType) {
          baseClass = base.registeredClass;
          basePrototype = baseClass.instancePrototype;
        } else {
          basePrototype = ClassHandle.prototype;
        }
        var constructor = createNamedFunction(legalFunctionName, function() {
          if (Object.getPrototypeOf(this) !== instancePrototype) {
            throw new BindingError("Use 'new' to construct " + name);
          }
          if (registeredClass.constructor_body === void 0) {
            throw new BindingError(name + " has no accessible constructor");
          }
          var body = registeredClass.constructor_body[arguments.length];
          if (body === void 0) {
            throw new BindingError("Tried to invoke ctor of " + name + " with invalid number of parameters (" + arguments.length + ") - expected (" + Object.keys(registeredClass.constructor_body).toString() + ") parameters instead!");
          }
          return body.apply(this, arguments);
        });
        var instancePrototype = Object.create(basePrototype, { constructor: { value: constructor } });
        constructor.prototype = instancePrototype;
        var registeredClass = new RegisteredClass(name, constructor, instancePrototype, rawDestructor, baseClass, getActualType, upcast, downcast);
        var referenceConverter = new RegisteredPointer(name, registeredClass, true, false, false);
        var pointerConverter = new RegisteredPointer(name + "*", registeredClass, false, false, false);
        var constPointerConverter = new RegisteredPointer(name + " const*", registeredClass, false, true, false);
        registeredPointers[rawType] = { pointerType: pointerConverter, constPointerType: constPointerConverter };
        replacePublicSymbol(legalFunctionName, constructor);
        return [referenceConverter, pointerConverter, constPointerConverter];
      });
    }
    function new_(constructor, argumentList) {
      if (!(constructor instanceof Function)) {
        throw new TypeError("new_ called with constructor type " + typeof constructor + " which is not a function");
      }
      var dummy = createNamedFunction(constructor.name || "unknownFunctionName", function() {
      });
      dummy.prototype = constructor.prototype;
      var obj = new dummy();
      var r = constructor.apply(obj, argumentList);
      return r instanceof Object ? r : obj;
    }
    function runAndAbortIfError(func) {
      try {
        return func();
      } catch (e) {
        abort(e);
      }
    }
    function callUserCallback(func, synchronous) {
      if (ABORT) {
        return;
      }
      if (synchronous) {
        func();
        return;
      }
      try {
        func();
      } catch (e) {
        handleException(e);
      }
    }
    var Asyncify = { State: { Normal: 0, Unwinding: 1, Rewinding: 2, Disabled: 3 }, state: 0, StackSize: 4096, currData: null, handleSleepReturnValue: 0, exportCallStack: [], callStackNameToId: {}, callStackIdToName: {}, callStackId: 0, asyncPromiseHandlers: null, sleepCallbacks: [], getCallStackId: function(funcName) {
      var id = Asyncify.callStackNameToId[funcName];
      if (id === void 0) {
        id = Asyncify.callStackId++;
        Asyncify.callStackNameToId[funcName] = id;
        Asyncify.callStackIdToName[id] = funcName;
      }
      return id;
    }, instrumentWasmExports: function(exports) {
      var ret = {};
      for (var x in exports) {
        (function(x2) {
          var original = exports[x2];
          if (typeof original === "function") {
            ret[x2] = function() {
              Asyncify.exportCallStack.push(x2);
              try {
                return original.apply(null, arguments);
              } finally {
                if (!ABORT) {
                  var y = Asyncify.exportCallStack.pop();
                  assert(y === x2);
                  Asyncify.maybeStopUnwind();
                }
              }
            };
          } else {
            ret[x2] = original;
          }
        })(x);
      }
      return ret;
    }, maybeStopUnwind: function() {
      if (Asyncify.currData && Asyncify.state === Asyncify.State.Unwinding && Asyncify.exportCallStack.length === 0) {
        Asyncify.state = Asyncify.State.Normal;
        runAndAbortIfError(Module["_asyncify_stop_unwind"]);
        if (typeof Fibers !== "undefined") {
          Fibers.trampoline();
        }
      }
    }, whenDone: function() {
      return new Promise(function(resolve, reject) {
        Asyncify.asyncPromiseHandlers = { resolve, reject };
      });
    }, allocateData: function() {
      var ptr = _malloc(12 + Asyncify.StackSize);
      Asyncify.setDataHeader(ptr, ptr + 12, Asyncify.StackSize);
      Asyncify.setDataRewindFunc(ptr);
      return ptr;
    }, setDataHeader: function(ptr, stack, stackSize) {
      HEAP32[ptr >> 2] = stack;
      HEAP32[ptr + 4 >> 2] = stack + stackSize;
    }, setDataRewindFunc: function(ptr) {
      var bottomOfCallStack = Asyncify.exportCallStack[0];
      var rewindId = Asyncify.getCallStackId(bottomOfCallStack);
      HEAP32[ptr + 8 >> 2] = rewindId;
    }, getDataRewindFunc: function(ptr) {
      var id = HEAP32[ptr + 8 >> 2];
      var name = Asyncify.callStackIdToName[id];
      var func = Module["asm"][name];
      return func;
    }, doRewind: function(ptr) {
      var start = Asyncify.getDataRewindFunc(ptr);
      return start();
    }, handleSleep: function(startAsync) {
      if (ABORT)
        return;
      if (Asyncify.state === Asyncify.State.Normal) {
        var reachedCallback = false;
        var reachedAfterCallback = false;
        startAsync(function(handleSleepReturnValue) {
          if (ABORT)
            return;
          Asyncify.handleSleepReturnValue = handleSleepReturnValue || 0;
          reachedCallback = true;
          if (!reachedAfterCallback) {
            return;
          }
          Asyncify.state = Asyncify.State.Rewinding;
          runAndAbortIfError(function() {
            Module["_asyncify_start_rewind"](Asyncify.currData);
          });
          if (typeof Browser !== "undefined" && Browser.mainLoop.func) {
            Browser.mainLoop.resume();
          }
          var asyncWasmReturnValue, isError = false;
          try {
            asyncWasmReturnValue = Asyncify.doRewind(Asyncify.currData);
          } catch (err2) {
            asyncWasmReturnValue = err2;
            isError = true;
          }
          var handled = false;
          if (!Asyncify.currData) {
            var asyncPromiseHandlers = Asyncify.asyncPromiseHandlers;
            if (asyncPromiseHandlers) {
              Asyncify.asyncPromiseHandlers = null;
              (isError ? asyncPromiseHandlers.reject : asyncPromiseHandlers.resolve)(asyncWasmReturnValue);
              handled = true;
            }
          }
          if (isError && !handled) {
            throw asyncWasmReturnValue;
          }
        });
        reachedAfterCallback = true;
        if (!reachedCallback) {
          Asyncify.state = Asyncify.State.Unwinding;
          Asyncify.currData = Asyncify.allocateData();
          runAndAbortIfError(function() {
            Module["_asyncify_start_unwind"](Asyncify.currData);
          });
          if (typeof Browser !== "undefined" && Browser.mainLoop.func) {
            Browser.mainLoop.pause();
          }
        }
      } else if (Asyncify.state === Asyncify.State.Rewinding) {
        Asyncify.state = Asyncify.State.Normal;
        runAndAbortIfError(Module["_asyncify_stop_rewind"]);
        _free(Asyncify.currData);
        Asyncify.currData = null;
        Asyncify.sleepCallbacks.forEach(function(func) {
          callUserCallback(func);
        });
      } else {
        abort("invalid state: " + Asyncify.state);
      }
      return Asyncify.handleSleepReturnValue;
    }, handleAsync: function(startAsync) {
      return Asyncify.handleSleep(function(wakeUp) {
        startAsync().then(wakeUp);
      });
    } };
    function craftInvokerFunction(humanName, argTypes, classType, cppInvokerFunc, cppTargetFunc) {
      var argCount = argTypes.length;
      if (argCount < 2) {
        throwBindingError("argTypes array size mismatch! Must at least get return value and 'this' types!");
      }
      var isClassMethodFunc = argTypes[1] !== null && classType !== null;
      var needsDestructorStack = false;
      for (var i2 = 1; i2 < argTypes.length; ++i2) {
        if (argTypes[i2] !== null && argTypes[i2].destructorFunction === void 0) {
          needsDestructorStack = true;
          break;
        }
      }
      var returns = argTypes[0].name !== "void";
      var argsList = "";
      var argsListWired = "";
      for (var i2 = 0; i2 < argCount - 2; ++i2) {
        argsList += (i2 !== 0 ? ", " : "") + "arg" + i2;
        argsListWired += (i2 !== 0 ? ", " : "") + "arg" + i2 + "Wired";
      }
      var invokerFnBody = "return function " + makeLegalFunctionName(humanName) + "(" + argsList + ") {\nif (arguments.length !== " + (argCount - 2) + ") {\nthrowBindingError('function " + humanName + " called with ' + arguments.length + ' arguments, expected " + (argCount - 2) + " args!');\n}\n";
      if (needsDestructorStack) {
        invokerFnBody += "var destructors = [];\n";
      }
      var dtorStack = needsDestructorStack ? "destructors" : "null";
      var args1 = ["throwBindingError", "invoker", "fn", "runDestructors", "retType", "classParam"];
      var args2 = [throwBindingError, cppInvokerFunc, cppTargetFunc, runDestructors, argTypes[0], argTypes[1]];
      if (isClassMethodFunc) {
        invokerFnBody += "var thisWired = classParam.toWireType(" + dtorStack + ", this);\n";
      }
      for (var i2 = 0; i2 < argCount - 2; ++i2) {
        invokerFnBody += "var arg" + i2 + "Wired = argType" + i2 + ".toWireType(" + dtorStack + ", arg" + i2 + "); // " + argTypes[i2 + 2].name + "\n";
        args1.push("argType" + i2);
        args2.push(argTypes[i2 + 2]);
      }
      if (isClassMethodFunc) {
        argsListWired = "thisWired" + (argsListWired.length > 0 ? ", " : "") + argsListWired;
      }
      invokerFnBody += (returns ? "var rv = " : "") + "invoker(fn" + (argsListWired.length > 0 ? ", " : "") + argsListWired + ");\n";
      args1.push("Asyncify");
      args2.push(Asyncify);
      invokerFnBody += "function onDone(" + (returns ? "rv" : "") + ") {\n";
      if (needsDestructorStack) {
        invokerFnBody += "runDestructors(destructors);\n";
      } else {
        for (var i2 = isClassMethodFunc ? 1 : 2; i2 < argTypes.length; ++i2) {
          var paramName = i2 === 1 ? "thisWired" : "arg" + (i2 - 2) + "Wired";
          if (argTypes[i2].destructorFunction !== null) {
            invokerFnBody += paramName + "_dtor(" + paramName + "); // " + argTypes[i2].name + "\n";
            args1.push(paramName + "_dtor");
            args2.push(argTypes[i2].destructorFunction);
          }
        }
      }
      if (returns) {
        invokerFnBody += "var ret = retType.fromWireType(rv);\nreturn ret;\n";
      }
      invokerFnBody += "}\n";
      invokerFnBody += "return Asyncify.currData ? Asyncify.whenDone().then(onDone) : onDone(" + (returns ? "rv" : "") + ");\n";
      invokerFnBody += "}\n";
      args1.push(invokerFnBody);
      var invokerFunction = new_(Function, args1).apply(null, args2);
      return invokerFunction;
    }
    function heap32VectorToArray(count, firstElement) {
      var array = [];
      for (var i2 = 0; i2 < count; i2++) {
        array.push(HEAP32[(firstElement >> 2) + i2]);
      }
      return array;
    }
    function __embind_register_class_class_function(rawClassType, methodName, argCount, rawArgTypesAddr, invokerSignature, rawInvoker, fn) {
      var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
      methodName = readLatin1String(methodName);
      rawInvoker = embind__requireFunction(invokerSignature, rawInvoker);
      whenDependentTypesAreResolved([], [rawClassType], function(classType) {
        classType = classType[0];
        var humanName = classType.name + "." + methodName;
        function unboundTypesHandler() {
          throwUnboundTypeError("Cannot call " + humanName + " due to unbound types", rawArgTypes);
        }
        if (methodName.startsWith("@@")) {
          methodName = Symbol[methodName.substring(2)];
        }
        var proto = classType.registeredClass.constructor;
        if (proto[methodName] === void 0) {
          unboundTypesHandler.argCount = argCount - 1;
          proto[methodName] = unboundTypesHandler;
        } else {
          ensureOverloadTable(proto, methodName, humanName);
          proto[methodName].overloadTable[argCount - 1] = unboundTypesHandler;
        }
        whenDependentTypesAreResolved([], rawArgTypes, function(argTypes) {
          var invokerArgsArray = [argTypes[0], null].concat(argTypes.slice(1));
          var func = craftInvokerFunction(humanName, invokerArgsArray, null, rawInvoker, fn);
          if (proto[methodName].overloadTable === void 0) {
            func.argCount = argCount - 1;
            proto[methodName] = func;
          } else {
            proto[methodName].overloadTable[argCount - 1] = func;
          }
          return [];
        });
        return [];
      });
    }
    function __embind_register_class_constructor(rawClassType, argCount, rawArgTypesAddr, invokerSignature, invoker, rawConstructor) {
      assert(argCount > 0);
      var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
      invoker = embind__requireFunction(invokerSignature, invoker);
      whenDependentTypesAreResolved([], [rawClassType], function(classType) {
        classType = classType[0];
        var humanName = "constructor " + classType.name;
        if (classType.registeredClass.constructor_body === void 0) {
          classType.registeredClass.constructor_body = [];
        }
        if (classType.registeredClass.constructor_body[argCount - 1] !== void 0) {
          throw new BindingError("Cannot register multiple constructors with identical number of parameters (" + (argCount - 1) + ") for class '" + classType.name + "'! Overload resolution is currently only performed using the parameter count, not actual type info!");
        }
        classType.registeredClass.constructor_body[argCount - 1] = function unboundTypeHandler() {
          throwUnboundTypeError("Cannot construct " + classType.name + " due to unbound types", rawArgTypes);
        };
        whenDependentTypesAreResolved([], rawArgTypes, function(argTypes) {
          argTypes.splice(1, 0, null);
          classType.registeredClass.constructor_body[argCount - 1] = craftInvokerFunction(humanName, argTypes, null, invoker, rawConstructor);
          return [];
        });
        return [];
      });
    }
    function __embind_register_class_function(rawClassType, methodName, argCount, rawArgTypesAddr, invokerSignature, rawInvoker, context, isPureVirtual) {
      var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
      methodName = readLatin1String(methodName);
      rawInvoker = embind__requireFunction(invokerSignature, rawInvoker);
      whenDependentTypesAreResolved([], [rawClassType], function(classType) {
        classType = classType[0];
        var humanName = classType.name + "." + methodName;
        if (methodName.startsWith("@@")) {
          methodName = Symbol[methodName.substring(2)];
        }
        if (isPureVirtual) {
          classType.registeredClass.pureVirtualFunctions.push(methodName);
        }
        function unboundTypesHandler() {
          throwUnboundTypeError("Cannot call " + humanName + " due to unbound types", rawArgTypes);
        }
        var proto = classType.registeredClass.instancePrototype;
        var method = proto[methodName];
        if (method === void 0 || method.overloadTable === void 0 && method.className !== classType.name && method.argCount === argCount - 2) {
          unboundTypesHandler.argCount = argCount - 2;
          unboundTypesHandler.className = classType.name;
          proto[methodName] = unboundTypesHandler;
        } else {
          ensureOverloadTable(proto, methodName, humanName);
          proto[methodName].overloadTable[argCount - 2] = unboundTypesHandler;
        }
        whenDependentTypesAreResolved([], rawArgTypes, function(argTypes) {
          var memberFunction = craftInvokerFunction(humanName, argTypes, classType, rawInvoker, context);
          if (proto[methodName].overloadTable === void 0) {
            memberFunction.argCount = argCount - 2;
            proto[methodName] = memberFunction;
          } else {
            proto[methodName].overloadTable[argCount - 2] = memberFunction;
          }
          return [];
        });
        return [];
      });
    }
    function validateThis(this_, classType, humanName) {
      if (!(this_ instanceof Object)) {
        throwBindingError(humanName + ' with invalid "this": ' + this_);
      }
      if (!(this_ instanceof classType.registeredClass.constructor)) {
        throwBindingError(humanName + ' incompatible with "this" of type ' + this_.constructor.name);
      }
      if (!this_.$$.ptr) {
        throwBindingError("cannot call emscripten binding method " + humanName + " on deleted object");
      }
      return upcastPointer(this_.$$.ptr, this_.$$.ptrType.registeredClass, classType.registeredClass);
    }
    function __embind_register_class_property(classType, fieldName, getterReturnType, getterSignature, getter, getterContext, setterArgumentType, setterSignature, setter, setterContext) {
      fieldName = readLatin1String(fieldName);
      getter = embind__requireFunction(getterSignature, getter);
      whenDependentTypesAreResolved([], [classType], function(classType2) {
        classType2 = classType2[0];
        var humanName = classType2.name + "." + fieldName;
        var desc = { get: function() {
          throwUnboundTypeError("Cannot access " + humanName + " due to unbound types", [getterReturnType, setterArgumentType]);
        }, enumerable: true, configurable: true };
        if (setter) {
          desc.set = function() {
            throwUnboundTypeError("Cannot access " + humanName + " due to unbound types", [getterReturnType, setterArgumentType]);
          };
        } else {
          desc.set = function(v) {
            throwBindingError(humanName + " is a read-only property");
          };
        }
        Object.defineProperty(classType2.registeredClass.instancePrototype, fieldName, desc);
        whenDependentTypesAreResolved([], setter ? [getterReturnType, setterArgumentType] : [getterReturnType], function(types) {
          var getterReturnType2 = types[0];
          var desc2 = { get: function() {
            var ptr = validateThis(this, classType2, humanName + " getter");
            return getterReturnType2["fromWireType"](getter(getterContext, ptr));
          }, enumerable: true };
          if (setter) {
            setter = embind__requireFunction(setterSignature, setter);
            var setterArgumentType2 = types[1];
            desc2.set = function(v) {
              var ptr = validateThis(this, classType2, humanName + " setter");
              var destructors = [];
              setter(setterContext, ptr, setterArgumentType2["toWireType"](destructors, v));
              runDestructors(destructors);
            };
          }
          Object.defineProperty(classType2.registeredClass.instancePrototype, fieldName, desc2);
          return [];
        });
        return [];
      });
    }
    var emval_free_list = [];
    var emval_handle_array = [{}, { value: void 0 }, { value: null }, { value: true }, { value: false }];
    function __emval_decref(handle) {
      if (handle > 4 && --emval_handle_array[handle].refcount === 0) {
        emval_handle_array[handle] = void 0;
        emval_free_list.push(handle);
      }
    }
    function count_emval_handles() {
      var count = 0;
      for (var i2 = 5; i2 < emval_handle_array.length; ++i2) {
        if (emval_handle_array[i2] !== void 0) {
          ++count;
        }
      }
      return count;
    }
    function get_first_emval() {
      for (var i2 = 5; i2 < emval_handle_array.length; ++i2) {
        if (emval_handle_array[i2] !== void 0) {
          return emval_handle_array[i2];
        }
      }
      return null;
    }
    function init_emval() {
      Module["count_emval_handles"] = count_emval_handles;
      Module["get_first_emval"] = get_first_emval;
    }
    var Emval = { toValue: function(handle) {
      if (!handle) {
        throwBindingError("Cannot use deleted val. handle = " + handle);
      }
      return emval_handle_array[handle].value;
    }, toHandle: function(value) {
      switch (value) {
        case void 0: {
          return 1;
        }
        case null: {
          return 2;
        }
        case true: {
          return 3;
        }
        case false: {
          return 4;
        }
        default: {
          var handle = emval_free_list.length ? emval_free_list.pop() : emval_handle_array.length;
          emval_handle_array[handle] = { refcount: 1, value };
          return handle;
        }
      }
    } };
    function __embind_register_emval(rawType, name) {
      name = readLatin1String(name);
      registerType(rawType, { name, "fromWireType": function(handle) {
        var rv = Emval.toValue(handle);
        __emval_decref(handle);
        return rv;
      }, "toWireType": function(destructors, value) {
        return Emval.toHandle(value);
      }, "argPackAdvance": 8, "readValueFromPointer": simpleReadValueFromPointer, destructorFunction: null });
    }
    function enumReadValueFromPointer(name, shift, signed) {
      switch (shift) {
        case 0:
          return function(pointer) {
            var heap = signed ? HEAP8 : HEAPU8;
            return this["fromWireType"](heap[pointer]);
          };
        case 1:
          return function(pointer) {
            var heap = signed ? HEAP16 : HEAPU16;
            return this["fromWireType"](heap[pointer >> 1]);
          };
        case 2:
          return function(pointer) {
            var heap = signed ? HEAP32 : HEAPU32;
            return this["fromWireType"](heap[pointer >> 2]);
          };
        default:
          throw new TypeError("Unknown integer type: " + name);
      }
    }
    function __embind_register_enum(rawType, name, size, isSigned) {
      var shift = getShiftFromSize(size);
      name = readLatin1String(name);
      function ctor() {
      }
      ctor.values = {};
      registerType(rawType, { name, constructor: ctor, "fromWireType": function(c) {
        return this.constructor.values[c];
      }, "toWireType": function(destructors, c) {
        return c.value;
      }, "argPackAdvance": 8, "readValueFromPointer": enumReadValueFromPointer(name, shift, isSigned), destructorFunction: null });
      exposePublicSymbol(name, ctor);
    }
    function requireRegisteredType(rawType, humanName) {
      var impl = registeredTypes[rawType];
      if (impl === void 0) {
        throwBindingError(humanName + " has unknown type " + getTypeName(rawType));
      }
      return impl;
    }
    function __embind_register_enum_value(rawEnumType, name, enumValue) {
      var enumType = requireRegisteredType(rawEnumType, "enum");
      name = readLatin1String(name);
      var Enum = enumType.constructor;
      var Value = Object.create(enumType.constructor.prototype, { value: { value: enumValue }, constructor: { value: createNamedFunction(enumType.name + "_" + name, function() {
      }) } });
      Enum.values[enumValue] = Value;
      Enum[name] = Value;
    }
    function _embind_repr(v) {
      if (v === null) {
        return "null";
      }
      var t = typeof v;
      if (t === "object" || t === "array" || t === "function") {
        return v.toString();
      } else {
        return "" + v;
      }
    }
    function floatReadValueFromPointer(name, shift) {
      switch (shift) {
        case 2:
          return function(pointer) {
            return this["fromWireType"](HEAPF32[pointer >> 2]);
          };
        case 3:
          return function(pointer) {
            return this["fromWireType"](HEAPF64[pointer >> 3]);
          };
        default:
          throw new TypeError("Unknown float type: " + name);
      }
    }
    function __embind_register_float(rawType, name, size) {
      var shift = getShiftFromSize(size);
      name = readLatin1String(name);
      registerType(rawType, { name, "fromWireType": function(value) {
        return value;
      }, "toWireType": function(destructors, value) {
        return value;
      }, "argPackAdvance": 8, "readValueFromPointer": floatReadValueFromPointer(name, shift), destructorFunction: null });
    }
    function __embind_register_function(name, argCount, rawArgTypesAddr, signature, rawInvoker, fn) {
      var argTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
      name = readLatin1String(name);
      rawInvoker = embind__requireFunction(signature, rawInvoker);
      exposePublicSymbol(name, function() {
        throwUnboundTypeError("Cannot call " + name + " due to unbound types", argTypes);
      }, argCount - 1);
      whenDependentTypesAreResolved([], argTypes, function(argTypes2) {
        var invokerArgsArray = [argTypes2[0], null].concat(argTypes2.slice(1));
        replacePublicSymbol(name, craftInvokerFunction(name, invokerArgsArray, null, rawInvoker, fn), argCount - 1);
        return [];
      });
    }
    function integerReadValueFromPointer(name, shift, signed) {
      switch (shift) {
        case 0:
          return signed ? function readS8FromPointer(pointer) {
            return HEAP8[pointer];
          } : function readU8FromPointer(pointer) {
            return HEAPU8[pointer];
          };
        case 1:
          return signed ? function readS16FromPointer(pointer) {
            return HEAP16[pointer >> 1];
          } : function readU16FromPointer(pointer) {
            return HEAPU16[pointer >> 1];
          };
        case 2:
          return signed ? function readS32FromPointer(pointer) {
            return HEAP32[pointer >> 2];
          } : function readU32FromPointer(pointer) {
            return HEAPU32[pointer >> 2];
          };
        default:
          throw new TypeError("Unknown integer type: " + name);
      }
    }
    function __embind_register_integer(primitiveType, name, size, minRange, maxRange) {
      name = readLatin1String(name);
      var shift = getShiftFromSize(size);
      var fromWireType = function(value) {
        return value;
      };
      if (minRange === 0) {
        var bitshift = 32 - 8 * size;
        fromWireType = function(value) {
          return value << bitshift >>> bitshift;
        };
      }
      var isUnsignedType = name.includes("unsigned");
      var checkAssertions = function(value, toTypeName) {
      };
      var toWireType;
      if (isUnsignedType) {
        toWireType = function(destructors, value) {
          checkAssertions(value, this.name);
          return value >>> 0;
        };
      } else {
        toWireType = function(destructors, value) {
          checkAssertions(value, this.name);
          return value;
        };
      }
      registerType(primitiveType, { name, "fromWireType": fromWireType, "toWireType": toWireType, "argPackAdvance": 8, "readValueFromPointer": integerReadValueFromPointer(name, shift, minRange !== 0), destructorFunction: null });
    }
    function __embind_register_memory_view(rawType, dataTypeIndex, name) {
      var typeMapping = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array];
      var TA = typeMapping[dataTypeIndex];
      function decodeMemoryView(handle) {
        handle = handle >> 2;
        var heap = HEAPU32;
        var size = heap[handle];
        var data = heap[handle + 1];
        return new TA(buffer, data, size);
      }
      name = readLatin1String(name);
      registerType(rawType, { name, "fromWireType": decodeMemoryView, "argPackAdvance": 8, "readValueFromPointer": decodeMemoryView }, { ignoreDuplicateRegistrations: true });
    }
    function __embind_register_smart_ptr(rawType, rawPointeeType, name, sharingPolicy, getPointeeSignature, rawGetPointee, constructorSignature, rawConstructor, shareSignature, rawShare, destructorSignature, rawDestructor) {
      name = readLatin1String(name);
      rawGetPointee = embind__requireFunction(getPointeeSignature, rawGetPointee);
      rawConstructor = embind__requireFunction(constructorSignature, rawConstructor);
      rawShare = embind__requireFunction(shareSignature, rawShare);
      rawDestructor = embind__requireFunction(destructorSignature, rawDestructor);
      whenDependentTypesAreResolved([rawType], [rawPointeeType], function(pointeeType) {
        pointeeType = pointeeType[0];
        var registeredPointer = new RegisteredPointer(name, pointeeType.registeredClass, false, false, true, pointeeType, sharingPolicy, rawGetPointee, rawConstructor, rawShare, rawDestructor);
        return [registeredPointer];
      });
    }
    function __embind_register_std_string(rawType, name) {
      name = readLatin1String(name);
      var stdStringIsUTF8 = name === "std::string";
      registerType(rawType, { name, "fromWireType": function(value) {
        var length = HEAPU32[value >> 2];
        var str;
        if (stdStringIsUTF8) {
          var decodeStartPtr = value + 4;
          for (var i2 = 0; i2 <= length; ++i2) {
            var currentBytePtr = value + 4 + i2;
            if (i2 == length || HEAPU8[currentBytePtr] == 0) {
              var maxRead = currentBytePtr - decodeStartPtr;
              var stringSegment = UTF8ToString(decodeStartPtr, maxRead);
              if (str === void 0) {
                str = stringSegment;
              } else {
                str += String.fromCharCode(0);
                str += stringSegment;
              }
              decodeStartPtr = currentBytePtr + 1;
            }
          }
        } else {
          var a = new Array(length);
          for (var i2 = 0; i2 < length; ++i2) {
            a[i2] = String.fromCharCode(HEAPU8[value + 4 + i2]);
          }
          str = a.join("");
        }
        _free(value);
        return str;
      }, "toWireType": function(destructors, value) {
        if (value instanceof ArrayBuffer) {
          value = new Uint8Array(value);
        }
        var getLength;
        var valueIsOfTypeString = typeof value === "string";
        if (!(valueIsOfTypeString || value instanceof Uint8Array || value instanceof Uint8ClampedArray || value instanceof Int8Array)) {
          throwBindingError("Cannot pass non-string to std::string");
        }
        if (stdStringIsUTF8 && valueIsOfTypeString) {
          getLength = function() {
            return lengthBytesUTF8(value);
          };
        } else {
          getLength = function() {
            return value.length;
          };
        }
        var length = getLength();
        var ptr = _malloc(4 + length + 1);
        HEAPU32[ptr >> 2] = length;
        if (stdStringIsUTF8 && valueIsOfTypeString) {
          stringToUTF8(value, ptr + 4, length + 1);
        } else {
          if (valueIsOfTypeString) {
            for (var i2 = 0; i2 < length; ++i2) {
              var charCode = value.charCodeAt(i2);
              if (charCode > 255) {
                _free(ptr);
                throwBindingError("String has UTF-16 code units that do not fit in 8 bits");
              }
              HEAPU8[ptr + 4 + i2] = charCode;
            }
          } else {
            for (var i2 = 0; i2 < length; ++i2) {
              HEAPU8[ptr + 4 + i2] = value[i2];
            }
          }
        }
        if (destructors !== null) {
          destructors.push(_free, ptr);
        }
        return ptr;
      }, "argPackAdvance": 8, "readValueFromPointer": simpleReadValueFromPointer, destructorFunction: function(ptr) {
        _free(ptr);
      } });
    }
    function __embind_register_std_wstring(rawType, charSize, name) {
      name = readLatin1String(name);
      var decodeString, encodeString, getHeap, lengthBytesUTF, shift;
      if (charSize === 2) {
        decodeString = UTF16ToString;
        encodeString = stringToUTF16;
        lengthBytesUTF = lengthBytesUTF16;
        getHeap = function() {
          return HEAPU16;
        };
        shift = 1;
      } else if (charSize === 4) {
        decodeString = UTF32ToString;
        encodeString = stringToUTF32;
        lengthBytesUTF = lengthBytesUTF32;
        getHeap = function() {
          return HEAPU32;
        };
        shift = 2;
      }
      registerType(rawType, { name, "fromWireType": function(value) {
        var length = HEAPU32[value >> 2];
        var HEAP = getHeap();
        var str;
        var decodeStartPtr = value + 4;
        for (var i2 = 0; i2 <= length; ++i2) {
          var currentBytePtr = value + 4 + i2 * charSize;
          if (i2 == length || HEAP[currentBytePtr >> shift] == 0) {
            var maxReadBytes = currentBytePtr - decodeStartPtr;
            var stringSegment = decodeString(decodeStartPtr, maxReadBytes);
            if (str === void 0) {
              str = stringSegment;
            } else {
              str += String.fromCharCode(0);
              str += stringSegment;
            }
            decodeStartPtr = currentBytePtr + charSize;
          }
        }
        _free(value);
        return str;
      }, "toWireType": function(destructors, value) {
        if (!(typeof value === "string")) {
          throwBindingError("Cannot pass non-string to C++ string type " + name);
        }
        var length = lengthBytesUTF(value);
        var ptr = _malloc(4 + length + charSize);
        HEAPU32[ptr >> 2] = length >> shift;
        encodeString(value, ptr + 4, length + charSize);
        if (destructors !== null) {
          destructors.push(_free, ptr);
        }
        return ptr;
      }, "argPackAdvance": 8, "readValueFromPointer": simpleReadValueFromPointer, destructorFunction: function(ptr) {
        _free(ptr);
      } });
    }
    function __embind_register_value_object(rawType, name, constructorSignature, rawConstructor, destructorSignature, rawDestructor) {
      structRegistrations[rawType] = { name: readLatin1String(name), rawConstructor: embind__requireFunction(constructorSignature, rawConstructor), rawDestructor: embind__requireFunction(destructorSignature, rawDestructor), fields: [] };
    }
    function __embind_register_value_object_field(structType, fieldName, getterReturnType, getterSignature, getter, getterContext, setterArgumentType, setterSignature, setter, setterContext) {
      structRegistrations[structType].fields.push({ fieldName: readLatin1String(fieldName), getterReturnType, getter: embind__requireFunction(getterSignature, getter), getterContext, setterArgumentType, setter: embind__requireFunction(setterSignature, setter), setterContext });
    }
    function __embind_register_void(rawType, name) {
      name = readLatin1String(name);
      registerType(rawType, { isVoid: true, name, "argPackAdvance": 0, "fromWireType": function() {
        return void 0;
      }, "toWireType": function(destructors, o) {
        return void 0;
      } });
    }
    function __emval_as(handle, returnType, destructorsRef) {
      handle = Emval.toValue(handle);
      returnType = requireRegisteredType(returnType, "emval::as");
      var destructors = [];
      var rd = Emval.toHandle(destructors);
      HEAP32[destructorsRef >> 2] = rd;
      return returnType["toWireType"](destructors, handle);
    }
    function __emval_await(promise) {
      return Asyncify.handleAsync(function() {
        promise = Emval.toValue(promise);
        return promise.then(Emval.toHandle);
      });
    }
    function __emval_lookupTypes(argCount, argTypes) {
      var a = new Array(argCount);
      for (var i2 = 0; i2 < argCount; ++i2) {
        a[i2] = requireRegisteredType(HEAP32[(argTypes >> 2) + i2], "parameter " + i2);
      }
      return a;
    }
    function __emval_call(handle, argCount, argTypes, argv) {
      handle = Emval.toValue(handle);
      var types = __emval_lookupTypes(argCount, argTypes);
      var args = new Array(argCount);
      for (var i2 = 0; i2 < argCount; ++i2) {
        var type = types[i2];
        args[i2] = type["readValueFromPointer"](argv);
        argv += type["argPackAdvance"];
      }
      var rv = handle.apply(void 0, args);
      return Emval.toHandle(rv);
    }
    function __emval_allocateDestructors(destructorsRef) {
      var destructors = [];
      HEAP32[destructorsRef >> 2] = Emval.toHandle(destructors);
      return destructors;
    }
    var emval_symbols = {};
    function getStringOrSymbol(address) {
      var symbol = emval_symbols[address];
      if (symbol === void 0) {
        return readLatin1String(address);
      } else {
        return symbol;
      }
    }
    var emval_methodCallers = [];
    function __emval_call_method(caller, handle, methodName, destructorsRef, args) {
      caller = emval_methodCallers[caller];
      handle = Emval.toValue(handle);
      methodName = getStringOrSymbol(methodName);
      return caller(handle, methodName, __emval_allocateDestructors(destructorsRef), args);
    }
    function __emval_call_void_method(caller, handle, methodName, args) {
      caller = emval_methodCallers[caller];
      handle = Emval.toValue(handle);
      methodName = getStringOrSymbol(methodName);
      caller(handle, methodName, null, args);
    }
    function emval_get_global() {
      if (typeof globalThis === "object") {
        return globalThis;
      }
      return function() {
        return Function;
      }()("return this")();
    }
    function __emval_get_global(name) {
      if (name === 0) {
        return Emval.toHandle(emval_get_global());
      } else {
        name = getStringOrSymbol(name);
        return Emval.toHandle(emval_get_global()[name]);
      }
    }
    function __emval_addMethodCaller(caller) {
      var id = emval_methodCallers.length;
      emval_methodCallers.push(caller);
      return id;
    }
    var emval_registeredMethods = [];
    function __emval_get_method_caller(argCount, argTypes) {
      var types = __emval_lookupTypes(argCount, argTypes);
      var retType = types[0];
      var signatureName = retType.name + "_$" + types.slice(1).map(function(t) {
        return t.name;
      }).join("_") + "$";
      var returnId = emval_registeredMethods[signatureName];
      if (returnId !== void 0) {
        return returnId;
      }
      var params = ["retType"];
      var args = [retType];
      var argsList = "";
      for (var i2 = 0; i2 < argCount - 1; ++i2) {
        argsList += (i2 !== 0 ? ", " : "") + "arg" + i2;
        params.push("argType" + i2);
        args.push(types[1 + i2]);
      }
      var functionName = makeLegalFunctionName("methodCaller_" + signatureName);
      var functionBody = "return function " + functionName + "(handle, name, destructors, args) {\n";
      var offset = 0;
      for (var i2 = 0; i2 < argCount - 1; ++i2) {
        functionBody += "    var arg" + i2 + " = argType" + i2 + ".readValueFromPointer(args" + (offset ? "+" + offset : "") + ");\n";
        offset += types[i2 + 1]["argPackAdvance"];
      }
      functionBody += "    var rv = handle[name](" + argsList + ");\n";
      for (var i2 = 0; i2 < argCount - 1; ++i2) {
        if (types[i2 + 1]["deleteObject"]) {
          functionBody += "    argType" + i2 + ".deleteObject(arg" + i2 + ");\n";
        }
      }
      if (!retType.isVoid) {
        functionBody += "    return retType.toWireType(destructors, rv);\n";
      }
      functionBody += "};\n";
      params.push(functionBody);
      var invokerFunction = new_(Function, params).apply(null, args);
      returnId = __emval_addMethodCaller(invokerFunction);
      emval_registeredMethods[signatureName] = returnId;
      return returnId;
    }
    function __emval_get_module_property(name) {
      name = getStringOrSymbol(name);
      return Emval.toHandle(Module[name]);
    }
    function __emval_incref(handle) {
      if (handle > 4) {
        emval_handle_array[handle].refcount += 1;
      }
    }
    function craftEmvalAllocator(argCount) {
      var argsList = "";
      for (var i2 = 0; i2 < argCount; ++i2) {
        argsList += (i2 !== 0 ? ", " : "") + "arg" + i2;
      }
      var functionBody = "return function emval_allocator_" + argCount + "(constructor, argTypes, args) {\n";
      for (var i2 = 0; i2 < argCount; ++i2) {
        functionBody += "var argType" + i2 + " = requireRegisteredType(Module['HEAP32'][(argTypes >>> 2) + " + i2 + '], "parameter ' + i2 + '");\nvar arg' + i2 + " = argType" + i2 + ".readValueFromPointer(args);\nargs += argType" + i2 + "['argPackAdvance'];\n";
      }
      functionBody += "var obj = new constructor(" + argsList + ");\nreturn valueToHandle(obj);\n}\n";
      return new Function("requireRegisteredType", "Module", "valueToHandle", functionBody)(requireRegisteredType, Module, Emval.toHandle);
    }
    var emval_newers = {};
    function __emval_new(handle, argCount, argTypes, args) {
      handle = Emval.toValue(handle);
      var newer = emval_newers[argCount];
      if (!newer) {
        newer = craftEmvalAllocator(argCount);
        emval_newers[argCount] = newer;
      }
      return newer(handle, argTypes, args);
    }
    function __emval_new_array() {
      return Emval.toHandle([]);
    }
    function __emval_run_destructors(handle) {
      var destructors = Emval.toValue(handle);
      runDestructors(destructors);
      __emval_decref(handle);
    }
    function __emval_take_value(type, argv) {
      type = requireRegisteredType(type, "_emval_take_value");
      var v = type["readValueFromPointer"](argv);
      return Emval.toHandle(v);
    }
    function _abort() {
      abort("");
    }
    var _emscripten_get_now;
    _emscripten_get_now = () => performance.now();
    var _emscripten_get_now_is_monotonic = true;
    function _clock_gettime(clk_id, tp) {
      var now;
      if (clk_id === 0) {
        now = Date.now();
      } else if ((clk_id === 1 || clk_id === 4) && _emscripten_get_now_is_monotonic) {
        now = _emscripten_get_now();
      } else {
        setErrNo(28);
        return -1;
      }
      HEAP32[tp >> 2] = now / 1e3 | 0;
      HEAP32[tp + 4 >> 2] = now % 1e3 * 1e3 * 1e3 | 0;
      return 0;
    }
    var JSEvents = { inEventHandler: 0, removeAllEventListeners: function() {
      for (var i2 = JSEvents.eventHandlers.length - 1; i2 >= 0; --i2) {
        JSEvents._removeHandler(i2);
      }
      JSEvents.eventHandlers = [];
      JSEvents.deferredCalls = [];
    }, registerRemoveEventListeners: function() {
      if (!JSEvents.removeEventListenersRegistered) {
        JSEvents.removeEventListenersRegistered = true;
      }
    }, deferredCalls: [], deferCall: function(targetFunction, precedence, argsList) {
      function arraysHaveEqualContent(arrA, arrB) {
        if (arrA.length != arrB.length)
          return false;
        for (var i3 in arrA) {
          if (arrA[i3] != arrB[i3])
            return false;
        }
        return true;
      }
      for (var i2 in JSEvents.deferredCalls) {
        var call = JSEvents.deferredCalls[i2];
        if (call.targetFunction == targetFunction && arraysHaveEqualContent(call.argsList, argsList)) {
          return;
        }
      }
      JSEvents.deferredCalls.push({ targetFunction, precedence, argsList });
      JSEvents.deferredCalls.sort(function(x, y) {
        return x.precedence < y.precedence;
      });
    }, removeDeferredCalls: function(targetFunction) {
      for (var i2 = 0; i2 < JSEvents.deferredCalls.length; ++i2) {
        if (JSEvents.deferredCalls[i2].targetFunction == targetFunction) {
          JSEvents.deferredCalls.splice(i2, 1);
          --i2;
        }
      }
    }, canPerformEventHandlerRequests: function() {
      return JSEvents.inEventHandler && JSEvents.currentEventHandler.allowsDeferredCalls;
    }, runDeferredCalls: function() {
      if (!JSEvents.canPerformEventHandlerRequests()) {
        return;
      }
      for (var i2 = 0; i2 < JSEvents.deferredCalls.length; ++i2) {
        var call = JSEvents.deferredCalls[i2];
        JSEvents.deferredCalls.splice(i2, 1);
        --i2;
        call.targetFunction.apply(null, call.argsList);
      }
    }, eventHandlers: [], removeAllHandlersOnTarget: function(target, eventTypeString) {
      for (var i2 = 0; i2 < JSEvents.eventHandlers.length; ++i2) {
        if (JSEvents.eventHandlers[i2].target == target && (!eventTypeString || eventTypeString == JSEvents.eventHandlers[i2].eventTypeString)) {
          JSEvents._removeHandler(i2--);
        }
      }
    }, _removeHandler: function(i2) {
      var h = JSEvents.eventHandlers[i2];
      h.target.removeEventListener(h.eventTypeString, h.eventListenerFunc, h.useCapture);
      JSEvents.eventHandlers.splice(i2, 1);
    }, registerOrRemoveHandler: function(eventHandler) {
      var jsEventHandler = function jsEventHandler2(event) {
        ++JSEvents.inEventHandler;
        JSEvents.currentEventHandler = eventHandler;
        JSEvents.runDeferredCalls();
        eventHandler.handlerFunc(event);
        JSEvents.runDeferredCalls();
        --JSEvents.inEventHandler;
      };
      if (eventHandler.callbackfunc) {
        eventHandler.eventListenerFunc = jsEventHandler;
        eventHandler.target.addEventListener(eventHandler.eventTypeString, jsEventHandler, eventHandler.useCapture);
        JSEvents.eventHandlers.push(eventHandler);
        JSEvents.registerRemoveEventListeners();
      } else {
        for (var i2 = 0; i2 < JSEvents.eventHandlers.length; ++i2) {
          if (JSEvents.eventHandlers[i2].target == eventHandler.target && JSEvents.eventHandlers[i2].eventTypeString == eventHandler.eventTypeString) {
            JSEvents._removeHandler(i2--);
          }
        }
      }
    }, getNodeNameForTarget: function(target) {
      if (!target)
        return "";
      if (target == window)
        return "#window";
      if (target == screen)
        return "#screen";
      return target && target.nodeName ? target.nodeName : "";
    }, fullscreenEnabled: function() {
      return document.fullscreenEnabled || document.webkitFullscreenEnabled;
    } };
    function maybeCStringToJsString(cString) {
      return cString > 2 ? UTF8ToString(cString) : cString;
    }
    var specialHTMLTargets = [0, document, window];
    function findEventTarget(target) {
      target = maybeCStringToJsString(target);
      var domElement = specialHTMLTargets[target] || document.querySelector(target);
      return domElement;
    }
    function findCanvasEventTarget(target) {
      return findEventTarget(target);
    }
    function _emscripten_get_canvas_element_size(target, width, height) {
      var canvas = findCanvasEventTarget(target);
      if (!canvas)
        return -4;
      HEAP32[width >> 2] = canvas.width;
      HEAP32[height >> 2] = canvas.height;
    }
    function __webgl_enable_ANGLE_instanced_arrays(ctx) {
      var ext = ctx.getExtension("ANGLE_instanced_arrays");
      if (ext) {
        ctx["vertexAttribDivisor"] = function(index, divisor) {
          ext["vertexAttribDivisorANGLE"](index, divisor);
        };
        ctx["drawArraysInstanced"] = function(mode, first, count, primcount) {
          ext["drawArraysInstancedANGLE"](mode, first, count, primcount);
        };
        ctx["drawElementsInstanced"] = function(mode, count, type, indices, primcount) {
          ext["drawElementsInstancedANGLE"](mode, count, type, indices, primcount);
        };
        return 1;
      }
    }
    function __webgl_enable_OES_vertex_array_object(ctx) {
      var ext = ctx.getExtension("OES_vertex_array_object");
      if (ext) {
        ctx["createVertexArray"] = function() {
          return ext["createVertexArrayOES"]();
        };
        ctx["deleteVertexArray"] = function(vao) {
          ext["deleteVertexArrayOES"](vao);
        };
        ctx["bindVertexArray"] = function(vao) {
          ext["bindVertexArrayOES"](vao);
        };
        ctx["isVertexArray"] = function(vao) {
          return ext["isVertexArrayOES"](vao);
        };
        return 1;
      }
    }
    function __webgl_enable_WEBGL_draw_buffers(ctx) {
      var ext = ctx.getExtension("WEBGL_draw_buffers");
      if (ext) {
        ctx["drawBuffers"] = function(n, bufs) {
          ext["drawBuffersWEBGL"](n, bufs);
        };
        return 1;
      }
    }
    function __webgl_enable_WEBGL_draw_instanced_base_vertex_base_instance(ctx) {
      return !!(ctx.dibvbi = ctx.getExtension("WEBGL_draw_instanced_base_vertex_base_instance"));
    }
    function __webgl_enable_WEBGL_multi_draw_instanced_base_vertex_base_instance(ctx) {
      return !!(ctx.mdibvbi = ctx.getExtension("WEBGL_multi_draw_instanced_base_vertex_base_instance"));
    }
    function __webgl_enable_WEBGL_multi_draw(ctx) {
      return !!(ctx.multiDrawWebgl = ctx.getExtension("WEBGL_multi_draw"));
    }
    var GL = { counter: 1, buffers: [], programs: [], framebuffers: [], renderbuffers: [], textures: [], shaders: [], vaos: [], contexts: [], offscreenCanvases: {}, queries: [], samplers: [], transformFeedbacks: [], syncs: [], stringCache: {}, stringiCache: {}, unpackAlignment: 4, recordError: function recordError(errorCode) {
      if (!GL.lastError) {
        GL.lastError = errorCode;
      }
    }, getNewId: function(table) {
      var ret = GL.counter++;
      for (var i2 = table.length; i2 < ret; i2++) {
        table[i2] = null;
      }
      return ret;
    }, getSource: function(shader, count, string, length) {
      var source = "";
      for (var i2 = 0; i2 < count; ++i2) {
        var len = length ? HEAP32[length + i2 * 4 >> 2] : -1;
        source += UTF8ToString(HEAP32[string + i2 * 4 >> 2], len < 0 ? void 0 : len);
      }
      return source;
    }, createContext: function(canvas, webGLContextAttributes) {
      if (!canvas.getContextSafariWebGL2Fixed) {
        canvas.getContextSafariWebGL2Fixed = canvas.getContext;
        canvas.getContext = function(ver, attrs) {
          var gl = canvas.getContextSafariWebGL2Fixed(ver, attrs);
          return ver == "webgl" == gl instanceof WebGLRenderingContext ? gl : null;
        };
      }
      var ctx = webGLContextAttributes.majorVersion > 1 ? canvas.getContext("webgl2", webGLContextAttributes) : canvas.getContext("webgl", webGLContextAttributes);
      if (!ctx)
        return 0;
      var handle = GL.registerContext(ctx, webGLContextAttributes);
      return handle;
    }, registerContext: function(ctx, webGLContextAttributes) {
      var handle = GL.getNewId(GL.contexts);
      var context = { handle, attributes: webGLContextAttributes, version: webGLContextAttributes.majorVersion, GLctx: ctx };
      if (ctx.canvas)
        ctx.canvas.GLctxObject = context;
      GL.contexts[handle] = context;
      if (typeof webGLContextAttributes.enableExtensionsByDefault === "undefined" || webGLContextAttributes.enableExtensionsByDefault) {
        GL.initExtensions(context);
      }
      return handle;
    }, makeContextCurrent: function(contextHandle) {
      GL.currentContext = GL.contexts[contextHandle];
      Module.ctx = GLctx = GL.currentContext && GL.currentContext.GLctx;
      return !(contextHandle && !GLctx);
    }, getContext: function(contextHandle) {
      return GL.contexts[contextHandle];
    }, deleteContext: function(contextHandle) {
      if (GL.currentContext === GL.contexts[contextHandle])
        GL.currentContext = null;
      if (typeof JSEvents === "object")
        JSEvents.removeAllHandlersOnTarget(GL.contexts[contextHandle].GLctx.canvas);
      if (GL.contexts[contextHandle] && GL.contexts[contextHandle].GLctx.canvas)
        GL.contexts[contextHandle].GLctx.canvas.GLctxObject = void 0;
      GL.contexts[contextHandle] = null;
    }, initExtensions: function(context) {
      if (!context)
        context = GL.currentContext;
      if (context.initExtensionsDone)
        return;
      context.initExtensionsDone = true;
      var GLctx2 = context.GLctx;
      __webgl_enable_ANGLE_instanced_arrays(GLctx2);
      __webgl_enable_OES_vertex_array_object(GLctx2);
      __webgl_enable_WEBGL_draw_buffers(GLctx2);
      __webgl_enable_WEBGL_draw_instanced_base_vertex_base_instance(GLctx2);
      __webgl_enable_WEBGL_multi_draw_instanced_base_vertex_base_instance(GLctx2);
      if (context.version >= 2) {
        GLctx2.disjointTimerQueryExt = GLctx2.getExtension("EXT_disjoint_timer_query_webgl2");
      }
      if (context.version < 2 || !GLctx2.disjointTimerQueryExt) {
        GLctx2.disjointTimerQueryExt = GLctx2.getExtension("EXT_disjoint_timer_query");
      }
      __webgl_enable_WEBGL_multi_draw(GLctx2);
      var exts = GLctx2.getSupportedExtensions() || [];
      exts.forEach(function(ext) {
        if (!ext.includes("lose_context") && !ext.includes("debug")) {
          GLctx2.getExtension(ext);
        }
      });
    } };
    function _emscripten_glActiveTexture(x0) {
      GLctx["activeTexture"](x0);
    }
    function _emscripten_glAttachShader(program, shader) {
      GLctx.attachShader(GL.programs[program], GL.shaders[shader]);
    }
    function _emscripten_glBindAttribLocation(program, index, name) {
      GLctx.bindAttribLocation(GL.programs[program], index, UTF8ToString(name));
    }
    function _emscripten_glBindBuffer(target, buffer2) {
      if (target == 35051) {
        GLctx.currentPixelPackBufferBinding = buffer2;
      } else if (target == 35052) {
        GLctx.currentPixelUnpackBufferBinding = buffer2;
      }
      GLctx.bindBuffer(target, GL.buffers[buffer2]);
    }
    function _emscripten_glBindFramebuffer(target, framebuffer) {
      GLctx.bindFramebuffer(target, GL.framebuffers[framebuffer]);
    }
    function _emscripten_glBindRenderbuffer(target, renderbuffer) {
      GLctx.bindRenderbuffer(target, GL.renderbuffers[renderbuffer]);
    }
    function _emscripten_glBindTexture(target, texture) {
      GLctx.bindTexture(target, GL.textures[texture]);
    }
    function _emscripten_glBindVertexArray(vao) {
      GLctx["bindVertexArray"](GL.vaos[vao]);
    }
    function _emscripten_glBindVertexArrayOES(vao) {
      GLctx["bindVertexArray"](GL.vaos[vao]);
    }
    function _emscripten_glBlendColor(x0, x1, x2, x3) {
      GLctx["blendColor"](x0, x1, x2, x3);
    }
    function _emscripten_glBlendEquation(x0) {
      GLctx["blendEquation"](x0);
    }
    function _emscripten_glBlendEquationSeparate(x0, x1) {
      GLctx["blendEquationSeparate"](x0, x1);
    }
    function _emscripten_glBlendFunc(x0, x1) {
      GLctx["blendFunc"](x0, x1);
    }
    function _emscripten_glBlitFramebuffer(x0, x1, x2, x3, x4, x5, x6, x7, x8, x9) {
      GLctx["blitFramebuffer"](x0, x1, x2, x3, x4, x5, x6, x7, x8, x9);
    }
    function _emscripten_glBufferData(target, size, data, usage) {
      if (GL.currentContext.version >= 2) {
        if (data) {
          GLctx.bufferData(target, HEAPU8, usage, data, size);
        } else {
          GLctx.bufferData(target, size, usage);
        }
      } else {
        GLctx.bufferData(target, data ? HEAPU8.subarray(data, data + size) : size, usage);
      }
    }
    function _emscripten_glCheckFramebufferStatus(x0) {
      return GLctx["checkFramebufferStatus"](x0);
    }
    function _emscripten_glClear(x0) {
      GLctx["clear"](x0);
    }
    function _emscripten_glClearColor(x0, x1, x2, x3) {
      GLctx["clearColor"](x0, x1, x2, x3);
    }
    function _emscripten_glClearStencil(x0) {
      GLctx["clearStencil"](x0);
    }
    function _emscripten_glColorMask(red, green, blue, alpha) {
      GLctx.colorMask(!!red, !!green, !!blue, !!alpha);
    }
    function _emscripten_glCompileShader(shader) {
      GLctx.compileShader(GL.shaders[shader]);
    }
    function _emscripten_glCopyTexSubImage2D(x0, x1, x2, x3, x4, x5, x6, x7) {
      GLctx["copyTexSubImage2D"](x0, x1, x2, x3, x4, x5, x6, x7);
    }
    function _emscripten_glCreateProgram() {
      var id = GL.getNewId(GL.programs);
      var program = GLctx.createProgram();
      program.name = id;
      program.maxUniformLength = program.maxAttributeLength = program.maxUniformBlockNameLength = 0;
      program.uniformIdCounter = 1;
      GL.programs[id] = program;
      return id;
    }
    function _emscripten_glCreateShader(shaderType) {
      var id = GL.getNewId(GL.shaders);
      GL.shaders[id] = GLctx.createShader(shaderType);
      return id;
    }
    function _emscripten_glDeleteBuffers(n, buffers) {
      for (var i2 = 0; i2 < n; i2++) {
        var id = HEAP32[buffers + i2 * 4 >> 2];
        var buffer2 = GL.buffers[id];
        if (!buffer2)
          continue;
        GLctx.deleteBuffer(buffer2);
        buffer2.name = 0;
        GL.buffers[id] = null;
        if (id == GLctx.currentPixelPackBufferBinding)
          GLctx.currentPixelPackBufferBinding = 0;
        if (id == GLctx.currentPixelUnpackBufferBinding)
          GLctx.currentPixelUnpackBufferBinding = 0;
      }
    }
    function _emscripten_glDeleteFramebuffers(n, framebuffers) {
      for (var i2 = 0; i2 < n; ++i2) {
        var id = HEAP32[framebuffers + i2 * 4 >> 2];
        var framebuffer = GL.framebuffers[id];
        if (!framebuffer)
          continue;
        GLctx.deleteFramebuffer(framebuffer);
        framebuffer.name = 0;
        GL.framebuffers[id] = null;
      }
    }
    function _emscripten_glDeleteProgram(id) {
      if (!id)
        return;
      var program = GL.programs[id];
      if (!program) {
        GL.recordError(1281);
        return;
      }
      GLctx.deleteProgram(program);
      program.name = 0;
      GL.programs[id] = null;
    }
    function _emscripten_glDeleteRenderbuffers(n, renderbuffers) {
      for (var i2 = 0; i2 < n; i2++) {
        var id = HEAP32[renderbuffers + i2 * 4 >> 2];
        var renderbuffer = GL.renderbuffers[id];
        if (!renderbuffer)
          continue;
        GLctx.deleteRenderbuffer(renderbuffer);
        renderbuffer.name = 0;
        GL.renderbuffers[id] = null;
      }
    }
    function _emscripten_glDeleteShader(id) {
      if (!id)
        return;
      var shader = GL.shaders[id];
      if (!shader) {
        GL.recordError(1281);
        return;
      }
      GLctx.deleteShader(shader);
      GL.shaders[id] = null;
    }
    function _emscripten_glDeleteSync(id) {
      if (!id)
        return;
      var sync = GL.syncs[id];
      if (!sync) {
        GL.recordError(1281);
        return;
      }
      GLctx.deleteSync(sync);
      sync.name = 0;
      GL.syncs[id] = null;
    }
    function _emscripten_glDeleteTextures(n, textures) {
      for (var i2 = 0; i2 < n; i2++) {
        var id = HEAP32[textures + i2 * 4 >> 2];
        var texture = GL.textures[id];
        if (!texture)
          continue;
        GLctx.deleteTexture(texture);
        texture.name = 0;
        GL.textures[id] = null;
      }
    }
    function _emscripten_glDeleteVertexArrays(n, vaos) {
      for (var i2 = 0; i2 < n; i2++) {
        var id = HEAP32[vaos + i2 * 4 >> 2];
        GLctx["deleteVertexArray"](GL.vaos[id]);
        GL.vaos[id] = null;
      }
    }
    function _emscripten_glDeleteVertexArraysOES(n, vaos) {
      for (var i2 = 0; i2 < n; i2++) {
        var id = HEAP32[vaos + i2 * 4 >> 2];
        GLctx["deleteVertexArray"](GL.vaos[id]);
        GL.vaos[id] = null;
      }
    }
    function _emscripten_glDepthMask(flag) {
      GLctx.depthMask(!!flag);
    }
    function _emscripten_glDisable(x0) {
      GLctx["disable"](x0);
    }
    function _emscripten_glDisableVertexAttribArray(index) {
      GLctx.disableVertexAttribArray(index);
    }
    function _emscripten_glDrawArrays(mode, first, count) {
      GLctx.drawArrays(mode, first, count);
    }
    function _emscripten_glDrawElements(mode, count, type, indices) {
      GLctx.drawElements(mode, count, type, indices);
    }
    function _emscripten_glEnable(x0) {
      GLctx["enable"](x0);
    }
    function _emscripten_glEnableVertexAttribArray(index) {
      GLctx.enableVertexAttribArray(index);
    }
    function _emscripten_glFenceSync(condition, flags) {
      var sync = GLctx.fenceSync(condition, flags);
      if (sync) {
        var id = GL.getNewId(GL.syncs);
        sync.name = id;
        GL.syncs[id] = sync;
        return id;
      } else {
        return 0;
      }
    }
    function _emscripten_glFinish() {
      GLctx["finish"]();
    }
    function _emscripten_glFlush() {
      GLctx["flush"]();
    }
    function _emscripten_glFramebufferRenderbuffer(target, attachment, renderbuffertarget, renderbuffer) {
      GLctx.framebufferRenderbuffer(target, attachment, renderbuffertarget, GL.renderbuffers[renderbuffer]);
    }
    function _emscripten_glFramebufferTexture2D(target, attachment, textarget, texture, level) {
      GLctx.framebufferTexture2D(target, attachment, textarget, GL.textures[texture], level);
    }
    function __glGenObject(n, buffers, createFunction, objectTable) {
      for (var i2 = 0; i2 < n; i2++) {
        var buffer2 = GLctx[createFunction]();
        var id = buffer2 && GL.getNewId(objectTable);
        if (buffer2) {
          buffer2.name = id;
          objectTable[id] = buffer2;
        } else {
          GL.recordError(1282);
        }
        HEAP32[buffers + i2 * 4 >> 2] = id;
      }
    }
    function _emscripten_glGenBuffers(n, buffers) {
      __glGenObject(n, buffers, "createBuffer", GL.buffers);
    }
    function _emscripten_glGenFramebuffers(n, ids) {
      __glGenObject(n, ids, "createFramebuffer", GL.framebuffers);
    }
    function _emscripten_glGenRenderbuffers(n, renderbuffers) {
      __glGenObject(n, renderbuffers, "createRenderbuffer", GL.renderbuffers);
    }
    function _emscripten_glGenTextures(n, textures) {
      __glGenObject(n, textures, "createTexture", GL.textures);
    }
    function _emscripten_glGenVertexArrays(n, arrays) {
      __glGenObject(n, arrays, "createVertexArray", GL.vaos);
    }
    function _emscripten_glGenVertexArraysOES(n, arrays) {
      __glGenObject(n, arrays, "createVertexArray", GL.vaos);
    }
    function _emscripten_glGetAttribLocation(program, name) {
      return GLctx.getAttribLocation(GL.programs[program], UTF8ToString(name));
    }
    function _emscripten_glGetBufferParameteriv(target, value, data) {
      if (!data) {
        GL.recordError(1281);
        return;
      }
      HEAP32[data >> 2] = GLctx.getBufferParameter(target, value);
    }
    function _emscripten_glGetError() {
      var error = GLctx.getError() || GL.lastError;
      GL.lastError = 0;
      return error;
    }
    function _emscripten_glGetFramebufferAttachmentParameteriv(target, attachment, pname, params) {
      var result = GLctx.getFramebufferAttachmentParameter(target, attachment, pname);
      if (result instanceof WebGLRenderbuffer || result instanceof WebGLTexture) {
        result = result.name | 0;
      }
      HEAP32[params >> 2] = result;
    }
    function writeI53ToI64(ptr, num) {
      HEAPU32[ptr >> 2] = num;
      HEAPU32[ptr + 4 >> 2] = (num - HEAPU32[ptr >> 2]) / 4294967296;
    }
    function emscriptenWebGLGet(name_, p, type) {
      if (!p) {
        GL.recordError(1281);
        return;
      }
      var ret = void 0;
      switch (name_) {
        case 36346:
          ret = 1;
          break;
        case 36344:
          if (type != 0 && type != 1) {
            GL.recordError(1280);
          }
          return;
        case 34814:
        case 36345:
          ret = 0;
          break;
        case 34466:
          var formats = GLctx.getParameter(34467);
          ret = formats ? formats.length : 0;
          break;
        case 33309:
          if (GL.currentContext.version < 2) {
            GL.recordError(1282);
            return;
          }
          var exts = GLctx.getSupportedExtensions() || [];
          ret = 2 * exts.length;
          break;
        case 33307:
        case 33308:
          if (GL.currentContext.version < 2) {
            GL.recordError(1280);
            return;
          }
          ret = name_ == 33307 ? 3 : 0;
          break;
      }
      if (ret === void 0) {
        var result = GLctx.getParameter(name_);
        switch (typeof result) {
          case "number":
            ret = result;
            break;
          case "boolean":
            ret = result ? 1 : 0;
            break;
          case "string":
            GL.recordError(1280);
            return;
          case "object":
            if (result === null) {
              switch (name_) {
                case 34964:
                case 35725:
                case 34965:
                case 36006:
                case 36007:
                case 32873:
                case 34229:
                case 36662:
                case 36663:
                case 35053:
                case 35055:
                case 36010:
                case 35097:
                case 35869:
                case 32874:
                case 36389:
                case 35983:
                case 35368:
                case 34068: {
                  ret = 0;
                  break;
                }
                default: {
                  GL.recordError(1280);
                  return;
                }
              }
            } else if (result instanceof Float32Array || result instanceof Uint32Array || result instanceof Int32Array || result instanceof Array) {
              for (var i2 = 0; i2 < result.length; ++i2) {
                switch (type) {
                  case 0:
                    HEAP32[p + i2 * 4 >> 2] = result[i2];
                    break;
                  case 2:
                    HEAPF32[p + i2 * 4 >> 2] = result[i2];
                    break;
                  case 4:
                    HEAP8[p + i2 >> 0] = result[i2] ? 1 : 0;
                    break;
                }
              }
              return;
            } else {
              try {
                ret = result.name | 0;
              } catch (e) {
                GL.recordError(1280);
                err("GL_INVALID_ENUM in glGet" + type + "v: Unknown object returned from WebGL getParameter(" + name_ + ")! (error: " + e + ")");
                return;
              }
            }
            break;
          default:
            GL.recordError(1280);
            err("GL_INVALID_ENUM in glGet" + type + "v: Native code calling glGet" + type + "v(" + name_ + ") and it returns " + result + " of type " + typeof result + "!");
            return;
        }
      }
      switch (type) {
        case 1:
          writeI53ToI64(p, ret);
          break;
        case 0:
          HEAP32[p >> 2] = ret;
          break;
        case 2:
          HEAPF32[p >> 2] = ret;
          break;
        case 4:
          HEAP8[p >> 0] = ret ? 1 : 0;
          break;
      }
    }
    function _emscripten_glGetIntegerv(name_, p) {
      emscriptenWebGLGet(name_, p, 0);
    }
    function _emscripten_glGetProgramInfoLog(program, maxLength, length, infoLog) {
      var log = GLctx.getProgramInfoLog(GL.programs[program]);
      if (log === null)
        log = "(unknown error)";
      var numBytesWrittenExclNull = maxLength > 0 && infoLog ? stringToUTF8(log, infoLog, maxLength) : 0;
      if (length)
        HEAP32[length >> 2] = numBytesWrittenExclNull;
    }
    function _emscripten_glGetProgramiv(program, pname, p) {
      if (!p) {
        GL.recordError(1281);
        return;
      }
      if (program >= GL.counter) {
        GL.recordError(1281);
        return;
      }
      program = GL.programs[program];
      if (pname == 35716) {
        var log = GLctx.getProgramInfoLog(program);
        if (log === null)
          log = "(unknown error)";
        HEAP32[p >> 2] = log.length + 1;
      } else if (pname == 35719) {
        if (!program.maxUniformLength) {
          for (var i2 = 0; i2 < GLctx.getProgramParameter(program, 35718); ++i2) {
            program.maxUniformLength = Math.max(program.maxUniformLength, GLctx.getActiveUniform(program, i2).name.length + 1);
          }
        }
        HEAP32[p >> 2] = program.maxUniformLength;
      } else if (pname == 35722) {
        if (!program.maxAttributeLength) {
          for (var i2 = 0; i2 < GLctx.getProgramParameter(program, 35721); ++i2) {
            program.maxAttributeLength = Math.max(program.maxAttributeLength, GLctx.getActiveAttrib(program, i2).name.length + 1);
          }
        }
        HEAP32[p >> 2] = program.maxAttributeLength;
      } else if (pname == 35381) {
        if (!program.maxUniformBlockNameLength) {
          for (var i2 = 0; i2 < GLctx.getProgramParameter(program, 35382); ++i2) {
            program.maxUniformBlockNameLength = Math.max(program.maxUniformBlockNameLength, GLctx.getActiveUniformBlockName(program, i2).length + 1);
          }
        }
        HEAP32[p >> 2] = program.maxUniformBlockNameLength;
      } else {
        HEAP32[p >> 2] = GLctx.getProgramParameter(program, pname);
      }
    }
    function _emscripten_glGetRenderbufferParameteriv(target, pname, params) {
      if (!params) {
        GL.recordError(1281);
        return;
      }
      HEAP32[params >> 2] = GLctx.getRenderbufferParameter(target, pname);
    }
    function _emscripten_glGetShaderInfoLog(shader, maxLength, length, infoLog) {
      var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
      if (log === null)
        log = "(unknown error)";
      var numBytesWrittenExclNull = maxLength > 0 && infoLog ? stringToUTF8(log, infoLog, maxLength) : 0;
      if (length)
        HEAP32[length >> 2] = numBytesWrittenExclNull;
    }
    function _emscripten_glGetShaderPrecisionFormat(shaderType, precisionType, range, precision) {
      var result = GLctx.getShaderPrecisionFormat(shaderType, precisionType);
      HEAP32[range >> 2] = result.rangeMin;
      HEAP32[range + 4 >> 2] = result.rangeMax;
      HEAP32[precision >> 2] = result.precision;
    }
    function _emscripten_glGetShaderiv(shader, pname, p) {
      if (!p) {
        GL.recordError(1281);
        return;
      }
      if (pname == 35716) {
        var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
        if (log === null)
          log = "(unknown error)";
        var logLength = log ? log.length + 1 : 0;
        HEAP32[p >> 2] = logLength;
      } else if (pname == 35720) {
        var source = GLctx.getShaderSource(GL.shaders[shader]);
        var sourceLength = source ? source.length + 1 : 0;
        HEAP32[p >> 2] = sourceLength;
      } else {
        HEAP32[p >> 2] = GLctx.getShaderParameter(GL.shaders[shader], pname);
      }
    }
    function stringToNewUTF8(jsString) {
      var length = lengthBytesUTF8(jsString) + 1;
      var cString = _malloc(length);
      stringToUTF8(jsString, cString, length);
      return cString;
    }
    function _emscripten_glGetString(name_) {
      var ret = GL.stringCache[name_];
      if (!ret) {
        switch (name_) {
          case 7939:
            var exts = GLctx.getSupportedExtensions() || [];
            exts = exts.concat(exts.map(function(e) {
              return "GL_" + e;
            }));
            ret = stringToNewUTF8(exts.join(" "));
            break;
          case 7936:
          case 7937:
          case 37445:
          case 37446:
            var s = GLctx.getParameter(name_);
            if (!s) {
              GL.recordError(1280);
            }
            ret = s && stringToNewUTF8(s);
            break;
          case 7938:
            var glVersion = GLctx.getParameter(7938);
            if (GL.currentContext.version >= 2)
              glVersion = "OpenGL ES 3.0 (" + glVersion + ")";
            else {
              glVersion = "OpenGL ES 2.0 (" + glVersion + ")";
            }
            ret = stringToNewUTF8(glVersion);
            break;
          case 35724:
            var glslVersion = GLctx.getParameter(35724);
            var ver_re = /^WebGL GLSL ES ([0-9]\.[0-9][0-9]?)(?:$| .*)/;
            var ver_num = glslVersion.match(ver_re);
            if (ver_num !== null) {
              if (ver_num[1].length == 3)
                ver_num[1] = ver_num[1] + "0";
              glslVersion = "OpenGL ES GLSL ES " + ver_num[1] + " (" + glslVersion + ")";
            }
            ret = stringToNewUTF8(glslVersion);
            break;
          default:
            GL.recordError(1280);
        }
        GL.stringCache[name_] = ret;
      }
      return ret;
    }
    function _emscripten_glGetStringi(name, index) {
      if (GL.currentContext.version < 2) {
        GL.recordError(1282);
        return 0;
      }
      var stringiCache = GL.stringiCache[name];
      if (stringiCache) {
        if (index < 0 || index >= stringiCache.length) {
          GL.recordError(1281);
          return 0;
        }
        return stringiCache[index];
      }
      switch (name) {
        case 7939:
          var exts = GLctx.getSupportedExtensions() || [];
          exts = exts.concat(exts.map(function(e) {
            return "GL_" + e;
          }));
          exts = exts.map(function(e) {
            return stringToNewUTF8(e);
          });
          stringiCache = GL.stringiCache[name] = exts;
          if (index < 0 || index >= stringiCache.length) {
            GL.recordError(1281);
            return 0;
          }
          return stringiCache[index];
        default:
          GL.recordError(1280);
          return 0;
      }
    }
    function jstoi_q(str) {
      return parseInt(str);
    }
    function webglGetLeftBracePos(name) {
      return name.slice(-1) == "]" && name.lastIndexOf("[");
    }
    function webglPrepareUniformLocationsBeforeFirstUse(program) {
      var uniformLocsById = program.uniformLocsById, uniformSizeAndIdsByName = program.uniformSizeAndIdsByName, i2, j;
      if (!uniformLocsById) {
        program.uniformLocsById = uniformLocsById = {};
        program.uniformArrayNamesById = {};
        for (i2 = 0; i2 < GLctx.getProgramParameter(program, 35718); ++i2) {
          var u = GLctx.getActiveUniform(program, i2);
          var nm = u.name;
          var sz = u.size;
          var lb = webglGetLeftBracePos(nm);
          var arrayName = lb > 0 ? nm.slice(0, lb) : nm;
          var id = program.uniformIdCounter;
          program.uniformIdCounter += sz;
          uniformSizeAndIdsByName[arrayName] = [sz, id];
          for (j = 0; j < sz; ++j) {
            uniformLocsById[id] = j;
            program.uniformArrayNamesById[id++] = arrayName;
          }
        }
      }
    }
    function _emscripten_glGetUniformLocation(program, name) {
      name = UTF8ToString(name);
      if (program = GL.programs[program]) {
        webglPrepareUniformLocationsBeforeFirstUse(program);
        var uniformLocsById = program.uniformLocsById;
        var arrayIndex = 0;
        var uniformBaseName = name;
        var leftBrace = webglGetLeftBracePos(name);
        if (leftBrace > 0) {
          arrayIndex = jstoi_q(name.slice(leftBrace + 1)) >>> 0;
          uniformBaseName = name.slice(0, leftBrace);
        }
        var sizeAndId = program.uniformSizeAndIdsByName[uniformBaseName];
        if (sizeAndId && arrayIndex < sizeAndId[0]) {
          arrayIndex += sizeAndId[1];
          if (uniformLocsById[arrayIndex] = uniformLocsById[arrayIndex] || GLctx.getUniformLocation(program, name)) {
            return arrayIndex;
          }
        }
      } else {
        GL.recordError(1281);
      }
      return -1;
    }
    function _emscripten_glIsEnabled(x0) {
      return GLctx["isEnabled"](x0);
    }
    function _emscripten_glIsTexture(id) {
      var texture = GL.textures[id];
      if (!texture)
        return 0;
      return GLctx.isTexture(texture);
    }
    function _emscripten_glLineWidth(x0) {
      GLctx["lineWidth"](x0);
    }
    function _emscripten_glLinkProgram(program) {
      program = GL.programs[program];
      GLctx.linkProgram(program);
      program.uniformLocsById = 0;
      program.uniformSizeAndIdsByName = {};
    }
    function _emscripten_glPixelStorei(pname, param) {
      if (pname == 3317) {
        GL.unpackAlignment = param;
      }
      GLctx.pixelStorei(pname, param);
    }
    function computeUnpackAlignedImageSize(width, height, sizePerPixel, alignment) {
      function roundedToNextMultipleOf(x, y) {
        return x + y - 1 & -y;
      }
      var plainRowSize = width * sizePerPixel;
      var alignedRowSize = roundedToNextMultipleOf(plainRowSize, alignment);
      return height * alignedRowSize;
    }
    function __colorChannelsInGlTextureFormat(format) {
      var colorChannels = { 5: 3, 6: 4, 8: 2, 29502: 3, 29504: 4, 26917: 2, 26918: 2, 29846: 3, 29847: 4 };
      return colorChannels[format - 6402] || 1;
    }
    function heapObjectForWebGLType(type) {
      type -= 5120;
      if (type == 0)
        return HEAP8;
      if (type == 1)
        return HEAPU8;
      if (type == 2)
        return HEAP16;
      if (type == 4)
        return HEAP32;
      if (type == 6)
        return HEAPF32;
      if (type == 5 || type == 28922 || type == 28520 || type == 30779 || type == 30782)
        return HEAPU32;
      return HEAPU16;
    }
    function heapAccessShiftForWebGLHeap(heap) {
      return 31 - Math.clz32(heap.BYTES_PER_ELEMENT);
    }
    function emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, internalFormat) {
      var heap = heapObjectForWebGLType(type);
      var shift = heapAccessShiftForWebGLHeap(heap);
      var byteSize = 1 << shift;
      var sizePerPixel = __colorChannelsInGlTextureFormat(format) * byteSize;
      var bytes = computeUnpackAlignedImageSize(width, height, sizePerPixel, GL.unpackAlignment);
      return heap.subarray(pixels >> shift, pixels + bytes >> shift);
    }
    function _emscripten_glReadPixels(x, y, width, height, format, type, pixels) {
      if (GL.currentContext.version >= 2) {
        if (GLctx.currentPixelPackBufferBinding) {
          GLctx.readPixels(x, y, width, height, format, type, pixels);
        } else {
          var heap = heapObjectForWebGLType(type);
          GLctx.readPixels(x, y, width, height, format, type, heap, pixels >> heapAccessShiftForWebGLHeap(heap));
        }
        return;
      }
      var pixelData = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels);
      if (!pixelData) {
        GL.recordError(1280);
        return;
      }
      GLctx.readPixels(x, y, width, height, format, type, pixelData);
    }
    function _emscripten_glRenderbufferStorage(x0, x1, x2, x3) {
      GLctx["renderbufferStorage"](x0, x1, x2, x3);
    }
    function _emscripten_glRenderbufferStorageMultisample(x0, x1, x2, x3, x4) {
      GLctx["renderbufferStorageMultisample"](x0, x1, x2, x3, x4);
    }
    function _emscripten_glScissor(x0, x1, x2, x3) {
      GLctx["scissor"](x0, x1, x2, x3);
    }
    function _emscripten_glShaderSource(shader, count, string, length) {
      var source = GL.getSource(shader, count, string, length);
      GLctx.shaderSource(GL.shaders[shader], source);
    }
    function _emscripten_glTexImage2D(target, level, internalFormat, width, height, border, format, type, pixels) {
      if (GL.currentContext.version >= 2) {
        if (GLctx.currentPixelUnpackBufferBinding) {
          GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, pixels);
        } else if (pixels) {
          var heap = heapObjectForWebGLType(type);
          GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, heap, pixels >> heapAccessShiftForWebGLHeap(heap));
        } else {
          GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, null);
        }
        return;
      }
      GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, pixels ? emscriptenWebGLGetTexPixelData(type, format, width, height, pixels) : null);
    }
    function _emscripten_glTexParameterf(x0, x1, x2) {
      GLctx["texParameterf"](x0, x1, x2);
    }
    function _emscripten_glTexParameterfv(target, pname, params) {
      var param = HEAPF32[params >> 2];
      GLctx.texParameterf(target, pname, param);
    }
    function _emscripten_glTexParameteri(x0, x1, x2) {
      GLctx["texParameteri"](x0, x1, x2);
    }
    function _emscripten_glTexParameteriv(target, pname, params) {
      var param = HEAP32[params >> 2];
      GLctx.texParameteri(target, pname, param);
    }
    function _emscripten_glTexSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixels) {
      if (GL.currentContext.version >= 2) {
        if (GLctx.currentPixelUnpackBufferBinding) {
          GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixels);
        } else if (pixels) {
          var heap = heapObjectForWebGLType(type);
          GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, heap, pixels >> heapAccessShiftForWebGLHeap(heap));
        } else {
          GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, null);
        }
        return;
      }
      var pixelData = null;
      if (pixels)
        pixelData = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels);
      GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixelData);
    }
    function webglGetUniformLocation(location) {
      var p = GLctx.currentProgram;
      if (p) {
        var webglLoc = p.uniformLocsById[location];
        if (typeof webglLoc === "number") {
          p.uniformLocsById[location] = webglLoc = GLctx.getUniformLocation(p, p.uniformArrayNamesById[location] + (webglLoc > 0 ? "[" + webglLoc + "]" : ""));
        }
        return webglLoc;
      } else {
        GL.recordError(1282);
      }
    }
    function _emscripten_glUniform1f(location, v0) {
      GLctx.uniform1f(webglGetUniformLocation(location), v0);
    }
    var miniTempWebGLFloatBuffers = [];
    function _emscripten_glUniform1fv(location, count, value) {
      if (GL.currentContext.version >= 2) {
        GLctx.uniform1fv(webglGetUniformLocation(location), HEAPF32, value >> 2, count);
        return;
      }
      if (count <= 288) {
        var view = miniTempWebGLFloatBuffers[count - 1];
        for (var i2 = 0; i2 < count; ++i2) {
          view[i2] = HEAPF32[value + 4 * i2 >> 2];
        }
      } else {
        var view = HEAPF32.subarray(value >> 2, value + count * 4 >> 2);
      }
      GLctx.uniform1fv(webglGetUniformLocation(location), view);
    }
    function _emscripten_glUniform1i(location, v0) {
      GLctx.uniform1i(webglGetUniformLocation(location), v0);
    }
    var __miniTempWebGLIntBuffers = [];
    function _emscripten_glUniform1iv(location, count, value) {
      if (GL.currentContext.version >= 2) {
        GLctx.uniform1iv(webglGetUniformLocation(location), HEAP32, value >> 2, count);
        return;
      }
      if (count <= 288) {
        var view = __miniTempWebGLIntBuffers[count - 1];
        for (var i2 = 0; i2 < count; ++i2) {
          view[i2] = HEAP32[value + 4 * i2 >> 2];
        }
      } else {
        var view = HEAP32.subarray(value >> 2, value + count * 4 >> 2);
      }
      GLctx.uniform1iv(webglGetUniformLocation(location), view);
    }
    function _emscripten_glUniform2f(location, v0, v1) {
      GLctx.uniform2f(webglGetUniformLocation(location), v0, v1);
    }
    function _emscripten_glUniform2fv(location, count, value) {
      if (GL.currentContext.version >= 2) {
        GLctx.uniform2fv(webglGetUniformLocation(location), HEAPF32, value >> 2, count * 2);
        return;
      }
      if (count <= 144) {
        var view = miniTempWebGLFloatBuffers[2 * count - 1];
        for (var i2 = 0; i2 < 2 * count; i2 += 2) {
          view[i2] = HEAPF32[value + 4 * i2 >> 2];
          view[i2 + 1] = HEAPF32[value + (4 * i2 + 4) >> 2];
        }
      } else {
        var view = HEAPF32.subarray(value >> 2, value + count * 8 >> 2);
      }
      GLctx.uniform2fv(webglGetUniformLocation(location), view);
    }
    function _emscripten_glUniform2i(location, v0, v1) {
      GLctx.uniform2i(webglGetUniformLocation(location), v0, v1);
    }
    function _emscripten_glUniform2iv(location, count, value) {
      if (GL.currentContext.version >= 2) {
        GLctx.uniform2iv(webglGetUniformLocation(location), HEAP32, value >> 2, count * 2);
        return;
      }
      if (count <= 144) {
        var view = __miniTempWebGLIntBuffers[2 * count - 1];
        for (var i2 = 0; i2 < 2 * count; i2 += 2) {
          view[i2] = HEAP32[value + 4 * i2 >> 2];
          view[i2 + 1] = HEAP32[value + (4 * i2 + 4) >> 2];
        }
      } else {
        var view = HEAP32.subarray(value >> 2, value + count * 8 >> 2);
      }
      GLctx.uniform2iv(webglGetUniformLocation(location), view);
    }
    function _emscripten_glUniform3f(location, v0, v1, v2) {
      GLctx.uniform3f(webglGetUniformLocation(location), v0, v1, v2);
    }
    function _emscripten_glUniform3fv(location, count, value) {
      if (GL.currentContext.version >= 2) {
        GLctx.uniform3fv(webglGetUniformLocation(location), HEAPF32, value >> 2, count * 3);
        return;
      }
      if (count <= 96) {
        var view = miniTempWebGLFloatBuffers[3 * count - 1];
        for (var i2 = 0; i2 < 3 * count; i2 += 3) {
          view[i2] = HEAPF32[value + 4 * i2 >> 2];
          view[i2 + 1] = HEAPF32[value + (4 * i2 + 4) >> 2];
          view[i2 + 2] = HEAPF32[value + (4 * i2 + 8) >> 2];
        }
      } else {
        var view = HEAPF32.subarray(value >> 2, value + count * 12 >> 2);
      }
      GLctx.uniform3fv(webglGetUniformLocation(location), view);
    }
    function _emscripten_glUniform3i(location, v0, v1, v2) {
      GLctx.uniform3i(webglGetUniformLocation(location), v0, v1, v2);
    }
    function _emscripten_glUniform3iv(location, count, value) {
      if (GL.currentContext.version >= 2) {
        GLctx.uniform3iv(webglGetUniformLocation(location), HEAP32, value >> 2, count * 3);
        return;
      }
      if (count <= 96) {
        var view = __miniTempWebGLIntBuffers[3 * count - 1];
        for (var i2 = 0; i2 < 3 * count; i2 += 3) {
          view[i2] = HEAP32[value + 4 * i2 >> 2];
          view[i2 + 1] = HEAP32[value + (4 * i2 + 4) >> 2];
          view[i2 + 2] = HEAP32[value + (4 * i2 + 8) >> 2];
        }
      } else {
        var view = HEAP32.subarray(value >> 2, value + count * 12 >> 2);
      }
      GLctx.uniform3iv(webglGetUniformLocation(location), view);
    }
    function _emscripten_glUniform4f(location, v0, v1, v2, v3) {
      GLctx.uniform4f(webglGetUniformLocation(location), v0, v1, v2, v3);
    }
    function _emscripten_glUniform4fv(location, count, value) {
      if (GL.currentContext.version >= 2) {
        GLctx.uniform4fv(webglGetUniformLocation(location), HEAPF32, value >> 2, count * 4);
        return;
      }
      if (count <= 72) {
        var view = miniTempWebGLFloatBuffers[4 * count - 1];
        var heap = HEAPF32;
        value >>= 2;
        for (var i2 = 0; i2 < 4 * count; i2 += 4) {
          var dst = value + i2;
          view[i2] = heap[dst];
          view[i2 + 1] = heap[dst + 1];
          view[i2 + 2] = heap[dst + 2];
          view[i2 + 3] = heap[dst + 3];
        }
      } else {
        var view = HEAPF32.subarray(value >> 2, value + count * 16 >> 2);
      }
      GLctx.uniform4fv(webglGetUniformLocation(location), view);
    }
    function _emscripten_glUniform4i(location, v0, v1, v2, v3) {
      GLctx.uniform4i(webglGetUniformLocation(location), v0, v1, v2, v3);
    }
    function _emscripten_glUniform4iv(location, count, value) {
      if (GL.currentContext.version >= 2) {
        GLctx.uniform4iv(webglGetUniformLocation(location), HEAP32, value >> 2, count * 4);
        return;
      }
      if (count <= 72) {
        var view = __miniTempWebGLIntBuffers[4 * count - 1];
        for (var i2 = 0; i2 < 4 * count; i2 += 4) {
          view[i2] = HEAP32[value + 4 * i2 >> 2];
          view[i2 + 1] = HEAP32[value + (4 * i2 + 4) >> 2];
          view[i2 + 2] = HEAP32[value + (4 * i2 + 8) >> 2];
          view[i2 + 3] = HEAP32[value + (4 * i2 + 12) >> 2];
        }
      } else {
        var view = HEAP32.subarray(value >> 2, value + count * 16 >> 2);
      }
      GLctx.uniform4iv(webglGetUniformLocation(location), view);
    }
    function _emscripten_glUniformMatrix2fv(location, count, transpose, value) {
      if (GL.currentContext.version >= 2) {
        GLctx.uniformMatrix2fv(webglGetUniformLocation(location), !!transpose, HEAPF32, value >> 2, count * 4);
        return;
      }
      if (count <= 72) {
        var view = miniTempWebGLFloatBuffers[4 * count - 1];
        for (var i2 = 0; i2 < 4 * count; i2 += 4) {
          view[i2] = HEAPF32[value + 4 * i2 >> 2];
          view[i2 + 1] = HEAPF32[value + (4 * i2 + 4) >> 2];
          view[i2 + 2] = HEAPF32[value + (4 * i2 + 8) >> 2];
          view[i2 + 3] = HEAPF32[value + (4 * i2 + 12) >> 2];
        }
      } else {
        var view = HEAPF32.subarray(value >> 2, value + count * 16 >> 2);
      }
      GLctx.uniformMatrix2fv(webglGetUniformLocation(location), !!transpose, view);
    }
    function _emscripten_glUniformMatrix3fv(location, count, transpose, value) {
      if (GL.currentContext.version >= 2) {
        GLctx.uniformMatrix3fv(webglGetUniformLocation(location), !!transpose, HEAPF32, value >> 2, count * 9);
        return;
      }
      if (count <= 32) {
        var view = miniTempWebGLFloatBuffers[9 * count - 1];
        for (var i2 = 0; i2 < 9 * count; i2 += 9) {
          view[i2] = HEAPF32[value + 4 * i2 >> 2];
          view[i2 + 1] = HEAPF32[value + (4 * i2 + 4) >> 2];
          view[i2 + 2] = HEAPF32[value + (4 * i2 + 8) >> 2];
          view[i2 + 3] = HEAPF32[value + (4 * i2 + 12) >> 2];
          view[i2 + 4] = HEAPF32[value + (4 * i2 + 16) >> 2];
          view[i2 + 5] = HEAPF32[value + (4 * i2 + 20) >> 2];
          view[i2 + 6] = HEAPF32[value + (4 * i2 + 24) >> 2];
          view[i2 + 7] = HEAPF32[value + (4 * i2 + 28) >> 2];
          view[i2 + 8] = HEAPF32[value + (4 * i2 + 32) >> 2];
        }
      } else {
        var view = HEAPF32.subarray(value >> 2, value + count * 36 >> 2);
      }
      GLctx.uniformMatrix3fv(webglGetUniformLocation(location), !!transpose, view);
    }
    function _emscripten_glUniformMatrix4fv(location, count, transpose, value) {
      if (GL.currentContext.version >= 2) {
        GLctx.uniformMatrix4fv(webglGetUniformLocation(location), !!transpose, HEAPF32, value >> 2, count * 16);
        return;
      }
      if (count <= 18) {
        var view = miniTempWebGLFloatBuffers[16 * count - 1];
        var heap = HEAPF32;
        value >>= 2;
        for (var i2 = 0; i2 < 16 * count; i2 += 16) {
          var dst = value + i2;
          view[i2] = heap[dst];
          view[i2 + 1] = heap[dst + 1];
          view[i2 + 2] = heap[dst + 2];
          view[i2 + 3] = heap[dst + 3];
          view[i2 + 4] = heap[dst + 4];
          view[i2 + 5] = heap[dst + 5];
          view[i2 + 6] = heap[dst + 6];
          view[i2 + 7] = heap[dst + 7];
          view[i2 + 8] = heap[dst + 8];
          view[i2 + 9] = heap[dst + 9];
          view[i2 + 10] = heap[dst + 10];
          view[i2 + 11] = heap[dst + 11];
          view[i2 + 12] = heap[dst + 12];
          view[i2 + 13] = heap[dst + 13];
          view[i2 + 14] = heap[dst + 14];
          view[i2 + 15] = heap[dst + 15];
        }
      } else {
        var view = HEAPF32.subarray(value >> 2, value + count * 64 >> 2);
      }
      GLctx.uniformMatrix4fv(webglGetUniformLocation(location), !!transpose, view);
    }
    function _emscripten_glUseProgram(program) {
      program = GL.programs[program];
      GLctx.useProgram(program);
      GLctx.currentProgram = program;
    }
    function _emscripten_glVertexAttrib1f(x0, x1) {
      GLctx["vertexAttrib1f"](x0, x1);
    }
    function _emscripten_glVertexAttrib2fv(index, v) {
      GLctx.vertexAttrib2f(index, HEAPF32[v >> 2], HEAPF32[v + 4 >> 2]);
    }
    function _emscripten_glVertexAttrib3fv(index, v) {
      GLctx.vertexAttrib3f(index, HEAPF32[v >> 2], HEAPF32[v + 4 >> 2], HEAPF32[v + 8 >> 2]);
    }
    function _emscripten_glVertexAttrib4fv(index, v) {
      GLctx.vertexAttrib4f(index, HEAPF32[v >> 2], HEAPF32[v + 4 >> 2], HEAPF32[v + 8 >> 2], HEAPF32[v + 12 >> 2]);
    }
    function _emscripten_glVertexAttribPointer(index, size, type, normalized, stride, ptr) {
      GLctx.vertexAttribPointer(index, size, type, !!normalized, stride, ptr);
    }
    function _emscripten_glViewport(x0, x1, x2, x3) {
      GLctx["viewport"](x0, x1, x2, x3);
    }
    function convertI32PairToI53(lo, hi) {
      return (lo >>> 0) + hi * 4294967296;
    }
    function _emscripten_glWaitSync(sync, flags, timeoutLo, timeoutHi) {
      GLctx.waitSync(GL.syncs[sync], flags, convertI32PairToI53(timeoutLo, timeoutHi));
    }
    function emscripten_realloc_buffer(size) {
      try {
        wasmMemory.grow(size - buffer.byteLength + 65535 >>> 16);
        updateGlobalBufferAndViews(wasmMemory.buffer);
        return 1;
      } catch (e) {
      }
    }
    function _emscripten_resize_heap(requestedSize) {
      var oldSize = HEAPU8.length;
      requestedSize = requestedSize >>> 0;
      var maxHeapSize = 2147483648;
      if (requestedSize > maxHeapSize) {
        return false;
      }
      for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
        var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
        overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
        var newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536));
        var replacement = emscripten_realloc_buffer(newSize);
        if (replacement) {
          return true;
        }
      }
      return false;
    }
    var __emscripten_webgl_power_preferences = ["default", "low-power", "high-performance"];
    function _emscripten_webgl_do_create_context(target, attributes) {
      var a = attributes >> 2;
      var powerPreference = HEAP32[a + (24 >> 2)];
      var contextAttributes = { "alpha": !!HEAP32[a + (0 >> 2)], "depth": !!HEAP32[a + (4 >> 2)], "stencil": !!HEAP32[a + (8 >> 2)], "antialias": !!HEAP32[a + (12 >> 2)], "premultipliedAlpha": !!HEAP32[a + (16 >> 2)], "preserveDrawingBuffer": !!HEAP32[a + (20 >> 2)], "powerPreference": __emscripten_webgl_power_preferences[powerPreference], "failIfMajorPerformanceCaveat": !!HEAP32[a + (28 >> 2)], majorVersion: HEAP32[a + (32 >> 2)], minorVersion: HEAP32[a + (36 >> 2)], enableExtensionsByDefault: HEAP32[a + (40 >> 2)], explicitSwapControl: HEAP32[a + (44 >> 2)], proxyContextToMainThread: HEAP32[a + (48 >> 2)], renderViaOffscreenBackBuffer: HEAP32[a + (52 >> 2)] };
      var canvas = findCanvasEventTarget(target);
      if (!canvas) {
        return 0;
      }
      if (contextAttributes.explicitSwapControl) {
        return 0;
      }
      var contextHandle = GL.createContext(canvas, contextAttributes);
      return contextHandle;
    }
    function _emscripten_webgl_create_context(a0, a1) {
      return _emscripten_webgl_do_create_context(a0, a1);
    }
    function _emscripten_webgl_destroy_context(contextHandle) {
      if (GL.currentContext == contextHandle)
        GL.currentContext = 0;
      GL.deleteContext(contextHandle);
    }
    function _emscripten_webgl_do_get_current_context() {
      return GL.currentContext ? GL.currentContext.handle : 0;
    }
    function _emscripten_webgl_get_current_context() {
      return _emscripten_webgl_do_get_current_context();
    }
    function _emscripten_webgl_init_context_attributes(attributes) {
      var a = attributes >> 2;
      for (var i2 = 0; i2 < 56 >> 2; ++i2) {
        HEAP32[a + i2] = 0;
      }
      HEAP32[a + (0 >> 2)] = HEAP32[a + (4 >> 2)] = HEAP32[a + (12 >> 2)] = HEAP32[a + (16 >> 2)] = HEAP32[a + (32 >> 2)] = HEAP32[a + (40 >> 2)] = 1;
    }
    function _emscripten_webgl_make_context_current(contextHandle) {
      var success = GL.makeContextCurrent(contextHandle);
      return success ? 0 : -5;
    }
    function _fd_close(fd) {
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        FS.close(stream);
        return 0;
      } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
          throw e;
        return e.errno;
      }
    }
    function _fd_read(fd, iov, iovcnt, pnum) {
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        var num = SYSCALLS.doReadv(stream, iov, iovcnt);
        HEAP32[pnum >> 2] = num;
        return 0;
      } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
          throw e;
        return e.errno;
      }
    }
    function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        var HIGH_OFFSET = 4294967296;
        var offset = offset_high * HIGH_OFFSET + (offset_low >>> 0);
        var DOUBLE_LIMIT = 9007199254740992;
        if (offset <= -DOUBLE_LIMIT || offset >= DOUBLE_LIMIT) {
          return -61;
        }
        FS.llseek(stream, offset, whence);
        tempI64 = [stream.position >>> 0, (tempDouble = stream.position, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[newOffset >> 2] = tempI64[0], HEAP32[newOffset + 4 >> 2] = tempI64[1];
        if (stream.getdents && offset === 0 && whence === 0)
          stream.getdents = null;
        return 0;
      } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
          throw e;
        return e.errno;
      }
    }
    function _fd_write(fd, iov, iovcnt, pnum) {
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        var num = SYSCALLS.doWritev(stream, iov, iovcnt);
        HEAP32[pnum >> 2] = num;
        return 0;
      } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
          throw e;
        return e.errno;
      }
    }
    function _setTempRet0(val) {
    }
    var FSNode = function(parent, name, mode, rdev) {
      if (!parent) {
        parent = this;
      }
      this.parent = parent;
      this.mount = parent.mount;
      this.mounted = null;
      this.id = FS.nextInode++;
      this.name = name;
      this.mode = mode;
      this.node_ops = {};
      this.stream_ops = {};
      this.rdev = rdev;
    };
    var readMode = 292 | 73;
    var writeMode = 146;
    Object.defineProperties(FSNode.prototype, { read: { get: function() {
      return (this.mode & readMode) === readMode;
    }, set: function(val) {
      val ? this.mode |= readMode : this.mode &= ~readMode;
    } }, write: { get: function() {
      return (this.mode & writeMode) === writeMode;
    }, set: function(val) {
      val ? this.mode |= writeMode : this.mode &= ~writeMode;
    } }, isFolder: { get: function() {
      return FS.isDir(this.mode);
    } }, isDevice: { get: function() {
      return FS.isChrdev(this.mode);
    } } });
    FS.FSNode = FSNode;
    FS.staticInit();
    InternalError = Module["InternalError"] = extendError(Error, "InternalError");
    embind_init_charCodes();
    BindingError = Module["BindingError"] = extendError(Error, "BindingError");
    init_ClassHandle();
    init_RegisteredPointer();
    init_embind();
    UnboundTypeError = Module["UnboundTypeError"] = extendError(Error, "UnboundTypeError");
    init_emval();
    var GLctx;
    var miniTempWebGLFloatBuffersStorage = new Float32Array(288);
    for (var i = 0; i < 288; ++i) {
      miniTempWebGLFloatBuffers[i] = miniTempWebGLFloatBuffersStorage.subarray(0, i + 1);
    }
    var __miniTempWebGLIntBuffersStorage = new Int32Array(288);
    for (var i = 0; i < 288; ++i) {
      __miniTempWebGLIntBuffers[i] = __miniTempWebGLIntBuffersStorage.subarray(0, i + 1);
    }
    function intArrayFromString(stringy, dontAddNull, length) {
      var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
      var u8array = new Array(len);
      var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
      if (dontAddNull)
        u8array.length = numBytesWritten;
      return u8array;
    }
    var asmLibraryArg = { "c": ___assert_fail, "x": ___cxa_allocate_exception, "w": ___cxa_throw, "F": ___syscall_fcntl64, "fb": ___syscall_ioctl, "gb": ___syscall_open, "o": __embind_finalize_value_object, "bb": __embind_register_bigint, "ib": __embind_register_bool, "g": __embind_register_class, "n": __embind_register_class_class_function, "t": __embind_register_class_constructor, "a": __embind_register_class_function, "b": __embind_register_class_property, "hb": __embind_register_emval, "v": __embind_register_enum, "u": __embind_register_enum_value, "H": __embind_register_float, "ac": __embind_register_function, "i": __embind_register_integer, "e": __embind_register_memory_view, "k": __embind_register_smart_ptr, "G": __embind_register_std_string, "y": __embind_register_std_wstring, "p": __embind_register_value_object, "l": __embind_register_value_object_field, "jb": __embind_register_void, "_a": __emval_as, "Za": __emval_await, "nb": __emval_call, "h": __emval_call_method, "j": __emval_call_void_method, "A": __emval_decref, "kb": __emval_get_global, "d": __emval_get_method_caller, "$a": __emval_get_module_property, "z": __emval_incref, "Wa": __emval_new, "Xa": __emval_new_array, "Ya": __emval_run_destructors, "s": __emval_take_value, "m": _abort, "db": _clock_gettime, "C": _emscripten_get_canvas_element_size, "Ta": _emscripten_glActiveTexture, "Sa": _emscripten_glAttachShader, "Qa": _emscripten_glBindAttribLocation, "Pa": _emscripten_glBindBuffer, "Oa": _emscripten_glBindFramebuffer, "Na": _emscripten_glBindRenderbuffer, "Ma": _emscripten_glBindTexture, "wb": _emscripten_glBindVertexArray, "tb": _emscripten_glBindVertexArrayOES, "La": _emscripten_glBlendColor, "Ka": _emscripten_glBlendEquation, "xb": _emscripten_glBlendEquationSeparate, "Ja": _emscripten_glBlendFunc, "ob": _emscripten_glBlitFramebuffer, "Ia": _emscripten_glBufferData, "Ha": _emscripten_glCheckFramebufferStatus, "Ga": _emscripten_glClear, "Fa": _emscripten_glClearColor, "Ea": _emscripten_glClearStencil, "Da": _emscripten_glColorMask, "Ca": _emscripten_glCompileShader, "Ba": _emscripten_glCopyTexSubImage2D, "Aa": _emscripten_glCreateProgram, "za": _emscripten_glCreateShader, "ya": _emscripten_glDeleteBuffers, "xa": _emscripten_glDeleteFramebuffers, "wa": _emscripten_glDeleteProgram, "va": _emscripten_glDeleteRenderbuffers, "ua": _emscripten_glDeleteShader, "pb": _emscripten_glDeleteSync, "ta": _emscripten_glDeleteTextures, "vb": _emscripten_glDeleteVertexArrays, "sb": _emscripten_glDeleteVertexArraysOES, "sa": _emscripten_glDepthMask, "ra": _emscripten_glDisable, "qa": _emscripten_glDisableVertexAttribArray, "pa": _emscripten_glDrawArrays, "oa": _emscripten_glDrawElements, "na": _emscripten_glEnable, "ma": _emscripten_glEnableVertexAttribArray, "qb": _emscripten_glFenceSync, "la": _emscripten_glFinish, "ka": _emscripten_glFlush, "ja": _emscripten_glFramebufferRenderbuffer, "ia": _emscripten_glFramebufferTexture2D, "ha": _emscripten_glGenBuffers, "ga": _emscripten_glGenFramebuffers, "fa": _emscripten_glGenRenderbuffers, "ea": _emscripten_glGenTextures, "ub": _emscripten_glGenVertexArrays, "rb": _emscripten_glGenVertexArraysOES, "yb": _emscripten_glGetAttribLocation, "da": _emscripten_glGetBufferParameteriv, "ca": _emscripten_glGetError, "ba": _emscripten_glGetFramebufferAttachmentParameteriv, "aa": _emscripten_glGetIntegerv, "$": _emscripten_glGetProgramInfoLog, "_": _emscripten_glGetProgramiv, "Z": _emscripten_glGetRenderbufferParameteriv, "Y": _emscripten_glGetShaderInfoLog, "X": _emscripten_glGetShaderPrecisionFormat, "W": _emscripten_glGetShaderiv, "V": _emscripten_glGetString, "U": _emscripten_glGetStringi, "T": _emscripten_glGetUniformLocation, "Ra": _emscripten_glIsEnabled, "S": _emscripten_glIsTexture, "R": _emscripten_glLineWidth, "Q": _emscripten_glLinkProgram, "P": _emscripten_glPixelStorei, "O": _emscripten_glReadPixels, "N": _emscripten_glRenderbufferStorage, "mb": _emscripten_glRenderbufferStorageMultisample, "M": _emscripten_glScissor, "L": _emscripten_glShaderSource, "K": _emscripten_glTexImage2D, "J": _emscripten_glTexParameterf, "I": _emscripten_glTexParameterfv, "$b": _emscripten_glTexParameteri, "_b": _emscripten_glTexParameteriv, "Zb": _emscripten_glTexSubImage2D, "Yb": _emscripten_glUniform1f, "Xb": _emscripten_glUniform1fv, "Wb": _emscripten_glUniform1i, "Vb": _emscripten_glUniform1iv, "Ub": _emscripten_glUniform2f, "Tb": _emscripten_glUniform2fv, "Sb": _emscripten_glUniform2i, "Rb": _emscripten_glUniform2iv, "Qb": _emscripten_glUniform3f, "Pb": _emscripten_glUniform3fv, "Ob": _emscripten_glUniform3i, "Nb": _emscripten_glUniform3iv, "Mb": _emscripten_glUniform4f, "Lb": _emscripten_glUniform4fv, "Kb": _emscripten_glUniform4i, "Jb": _emscripten_glUniform4iv, "Ib": _emscripten_glUniformMatrix2fv, "Hb": _emscripten_glUniformMatrix3fv, "Gb": _emscripten_glUniformMatrix4fv, "Fb": _emscripten_glUseProgram, "Eb": _emscripten_glVertexAttrib1f, "Db": _emscripten_glVertexAttrib2fv, "Cb": _emscripten_glVertexAttrib3fv, "Bb": _emscripten_glVertexAttrib4fv, "Ab": _emscripten_glVertexAttribPointer, "zb": _emscripten_glViewport, "lb": _emscripten_glWaitSync, "cb": _emscripten_resize_heap, "Ua": _emscripten_webgl_create_context, "B": _emscripten_webgl_destroy_context, "q": _emscripten_webgl_get_current_context, "Va": _emscripten_webgl_init_context_attributes, "f": _emscripten_webgl_make_context_current, "D": _fd_close, "eb": _fd_read, "ab": _fd_seek, "E": _fd_write, "r": _setTempRet0 };
    createWasm();
    Module["___wasm_call_ctors"] = function() {
      return (Module["___wasm_call_ctors"] = Module["asm"]["cc"]).apply(null, arguments);
    };
    var _malloc = Module["_malloc"] = function() {
      return (_malloc = Module["_malloc"] = Module["asm"]["dc"]).apply(null, arguments);
    };
    var _free = Module["_free"] = function() {
      return (_free = Module["_free"] = Module["asm"]["fc"]).apply(null, arguments);
    };
    var ___getTypeName = Module["___getTypeName"] = function() {
      return (___getTypeName = Module["___getTypeName"] = Module["asm"]["gc"]).apply(null, arguments);
    };
    Module["___embind_register_native_and_builtin_types"] = function() {
      return (Module["___embind_register_native_and_builtin_types"] = Module["asm"]["hc"]).apply(null, arguments);
    };
    var ___errno_location = Module["___errno_location"] = function() {
      return (___errno_location = Module["___errno_location"] = Module["asm"]["ic"]).apply(null, arguments);
    };
    Module["dynCall_ii"] = function() {
      return (Module["dynCall_ii"] = Module["asm"]["jc"]).apply(null, arguments);
    };
    var dynCall_vi = Module["dynCall_vi"] = function() {
      return (dynCall_vi = Module["dynCall_vi"] = Module["asm"]["kc"]).apply(null, arguments);
    };
    Module["dynCall_i"] = function() {
      return (Module["dynCall_i"] = Module["asm"]["lc"]).apply(null, arguments);
    };
    Module["dynCall_iii"] = function() {
      return (Module["dynCall_iii"] = Module["asm"]["mc"]).apply(null, arguments);
    };
    Module["dynCall_vii"] = function() {
      return (Module["dynCall_vii"] = Module["asm"]["nc"]).apply(null, arguments);
    };
    Module["dynCall_fi"] = function() {
      return (Module["dynCall_fi"] = Module["asm"]["oc"]).apply(null, arguments);
    };
    Module["dynCall_iiii"] = function() {
      return (Module["dynCall_iiii"] = Module["asm"]["pc"]).apply(null, arguments);
    };
    Module["dynCall_viii"] = function() {
      return (Module["dynCall_viii"] = Module["asm"]["qc"]).apply(null, arguments);
    };
    Module["dynCall_viiii"] = function() {
      return (Module["dynCall_viiii"] = Module["asm"]["rc"]).apply(null, arguments);
    };
    Module["dynCall_iiiiii"] = function() {
      return (Module["dynCall_iiiiii"] = Module["asm"]["sc"]).apply(null, arguments);
    };
    Module["dynCall_viiiii"] = function() {
      return (Module["dynCall_viiiii"] = Module["asm"]["tc"]).apply(null, arguments);
    };
    Module["dynCall_vid"] = function() {
      return (Module["dynCall_vid"] = Module["asm"]["uc"]).apply(null, arguments);
    };
    Module["dynCall_di"] = function() {
      return (Module["dynCall_di"] = Module["asm"]["vc"]).apply(null, arguments);
    };
    Module["dynCall_vif"] = function() {
      return (Module["dynCall_vif"] = Module["asm"]["wc"]).apply(null, arguments);
    };
    Module["dynCall_fii"] = function() {
      return (Module["dynCall_fii"] = Module["asm"]["xc"]).apply(null, arguments);
    };
    Module["dynCall_viif"] = function() {
      return (Module["dynCall_viif"] = Module["asm"]["yc"]).apply(null, arguments);
    };
    Module["dynCall_iiiii"] = function() {
      return (Module["dynCall_iiiii"] = Module["asm"]["zc"]).apply(null, arguments);
    };
    Module["dynCall_viid"] = function() {
      return (Module["dynCall_viid"] = Module["asm"]["Ac"]).apply(null, arguments);
    };
    Module["dynCall_dii"] = function() {
      return (Module["dynCall_dii"] = Module["asm"]["Bc"]).apply(null, arguments);
    };
    Module["dynCall_vij"] = function() {
      return (Module["dynCall_vij"] = Module["asm"]["Cc"]).apply(null, arguments);
    };
    var dynCall_v = Module["dynCall_v"] = function() {
      return (dynCall_v = Module["dynCall_v"] = Module["asm"]["Dc"]).apply(null, arguments);
    };
    Module["dynCall_iiiiiii"] = function() {
      return (Module["dynCall_iiiiiii"] = Module["asm"]["Ec"]).apply(null, arguments);
    };
    Module["dynCall_viiff"] = function() {
      return (Module["dynCall_viiff"] = Module["asm"]["Fc"]).apply(null, arguments);
    };
    Module["dynCall_iiifii"] = function() {
      return (Module["dynCall_iiifii"] = Module["asm"]["Gc"]).apply(null, arguments);
    };
    Module["dynCall_iiiiiiii"] = function() {
      return (Module["dynCall_iiiiiiii"] = Module["asm"]["Hc"]).apply(null, arguments);
    };
    Module["dynCall_viiiiii"] = function() {
      return (Module["dynCall_viiiiii"] = Module["asm"]["Ic"]).apply(null, arguments);
    };
    Module["dynCall_iiiff"] = function() {
      return (Module["dynCall_iiiff"] = Module["asm"]["Jc"]).apply(null, arguments);
    };
    Module["dynCall_viij"] = function() {
      return (Module["dynCall_viij"] = Module["asm"]["Kc"]).apply(null, arguments);
    };
    Module["dynCall_fij"] = function() {
      return (Module["dynCall_fij"] = Module["asm"]["Lc"]).apply(null, arguments);
    };
    Module["dynCall_iij"] = function() {
      return (Module["dynCall_iij"] = Module["asm"]["Mc"]).apply(null, arguments);
    };
    Module["dynCall_vijiii"] = function() {
      return (Module["dynCall_vijiii"] = Module["asm"]["Nc"]).apply(null, arguments);
    };
    Module["dynCall_ji"] = function() {
      return (Module["dynCall_ji"] = Module["asm"]["Oc"]).apply(null, arguments);
    };
    Module["dynCall_fif"] = function() {
      return (Module["dynCall_fif"] = Module["asm"]["Pc"]).apply(null, arguments);
    };
    Module["dynCall_jijf"] = function() {
      return (Module["dynCall_jijf"] = Module["asm"]["Qc"]).apply(null, arguments);
    };
    Module["dynCall_viddi"] = function() {
      return (Module["dynCall_viddi"] = Module["asm"]["Rc"]).apply(null, arguments);
    };
    Module["dynCall_vifii"] = function() {
      return (Module["dynCall_vifii"] = Module["asm"]["Sc"]).apply(null, arguments);
    };
    Module["dynCall_viifd"] = function() {
      return (Module["dynCall_viifd"] = Module["asm"]["Tc"]).apply(null, arguments);
    };
    Module["dynCall_iiffi"] = function() {
      return (Module["dynCall_iiffi"] = Module["asm"]["Uc"]).apply(null, arguments);
    };
    Module["dynCall_viiiiiffii"] = function() {
      return (Module["dynCall_viiiiiffii"] = Module["asm"]["Vc"]).apply(null, arguments);
    };
    Module["dynCall_iiif"] = function() {
      return (Module["dynCall_iiif"] = Module["asm"]["Wc"]).apply(null, arguments);
    };
    Module["dynCall_iiij"] = function() {
      return (Module["dynCall_iiij"] = Module["asm"]["Xc"]).apply(null, arguments);
    };
    Module["dynCall_viiji"] = function() {
      return (Module["dynCall_viiji"] = Module["asm"]["Yc"]).apply(null, arguments);
    };
    Module["dynCall_viiij"] = function() {
      return (Module["dynCall_viiij"] = Module["asm"]["Zc"]).apply(null, arguments);
    };
    Module["dynCall_iiiiij"] = function() {
      return (Module["dynCall_iiiiij"] = Module["asm"]["_c"]).apply(null, arguments);
    };
    Module["dynCall_fiii"] = function() {
      return (Module["dynCall_fiii"] = Module["asm"]["$c"]).apply(null, arguments);
    };
    Module["dynCall_jij"] = function() {
      return (Module["dynCall_jij"] = Module["asm"]["ad"]).apply(null, arguments);
    };
    Module["dynCall_viiiiiiiiiii"] = function() {
      return (Module["dynCall_viiiiiiiiiii"] = Module["asm"]["bd"]).apply(null, arguments);
    };
    Module["dynCall_viiiiiii"] = function() {
      return (Module["dynCall_viiiiiii"] = Module["asm"]["cd"]).apply(null, arguments);
    };
    Module["dynCall_viffff"] = function() {
      return (Module["dynCall_viffff"] = Module["asm"]["dd"]).apply(null, arguments);
    };
    Module["dynCall_viiiiiiiii"] = function() {
      return (Module["dynCall_viiiiiiiii"] = Module["asm"]["ed"]).apply(null, arguments);
    };
    Module["dynCall_viiiiiiii"] = function() {
      return (Module["dynCall_viiiiiiii"] = Module["asm"]["fd"]).apply(null, arguments);
    };
    Module["dynCall_viiiiiiiiii"] = function() {
      return (Module["dynCall_viiiiiiiiii"] = Module["asm"]["gd"]).apply(null, arguments);
    };
    Module["dynCall_viifff"] = function() {
      return (Module["dynCall_viifff"] = Module["asm"]["hd"]).apply(null, arguments);
    };
    Module["dynCall_vffff"] = function() {
      return (Module["dynCall_vffff"] = Module["asm"]["id"]).apply(null, arguments);
    };
    Module["dynCall_vf"] = function() {
      return (Module["dynCall_vf"] = Module["asm"]["jd"]).apply(null, arguments);
    };
    Module["dynCall_viff"] = function() {
      return (Module["dynCall_viff"] = Module["asm"]["kd"]).apply(null, arguments);
    };
    Module["dynCall_vifff"] = function() {
      return (Module["dynCall_vifff"] = Module["asm"]["ld"]).apply(null, arguments);
    };
    Module["dynCall_viifi"] = function() {
      return (Module["dynCall_viifi"] = Module["asm"]["md"]).apply(null, arguments);
    };
    Module["dynCall_viiifii"] = function() {
      return (Module["dynCall_viiifii"] = Module["asm"]["nd"]).apply(null, arguments);
    };
    Module["dynCall_fiifiii"] = function() {
      return (Module["dynCall_fiifiii"] = Module["asm"]["od"]).apply(null, arguments);
    };
    Module["dynCall_iiifiii"] = function() {
      return (Module["dynCall_iiifiii"] = Module["asm"]["pd"]).apply(null, arguments);
    };
    Module["dynCall_viiifiii"] = function() {
      return (Module["dynCall_viiifiii"] = Module["asm"]["qd"]).apply(null, arguments);
    };
    Module["dynCall_jiiii"] = function() {
      return (Module["dynCall_jiiii"] = Module["asm"]["rd"]).apply(null, arguments);
    };
    Module["dynCall_jiji"] = function() {
      return (Module["dynCall_jiji"] = Module["asm"]["sd"]).apply(null, arguments);
    };
    Module["dynCall_iidiiii"] = function() {
      return (Module["dynCall_iidiiii"] = Module["asm"]["td"]).apply(null, arguments);
    };
    Module["_asyncify_start_unwind"] = function() {
      return (Module["_asyncify_start_unwind"] = Module["asm"]["ud"]).apply(null, arguments);
    };
    Module["_asyncify_stop_unwind"] = function() {
      return (Module["_asyncify_stop_unwind"] = Module["asm"]["vd"]).apply(null, arguments);
    };
    Module["_asyncify_start_rewind"] = function() {
      return (Module["_asyncify_start_rewind"] = Module["asm"]["wd"]).apply(null, arguments);
    };
    Module["_asyncify_stop_rewind"] = function() {
      return (Module["_asyncify_stop_rewind"] = Module["asm"]["xd"]).apply(null, arguments);
    };
    Module["GL"] = GL;
    var calledRun;
    function ExitStatus(status) {
      this.name = "ExitStatus";
      this.message = "Program terminated with exit(" + status + ")";
      this.status = status;
    }
    dependenciesFulfilled = function runCaller() {
      if (!calledRun)
        run();
      if (!calledRun)
        dependenciesFulfilled = runCaller;
    };
    function run(args) {
      if (runDependencies > 0) {
        return;
      }
      preRun();
      if (runDependencies > 0) {
        return;
      }
      function doRun() {
        if (calledRun)
          return;
        calledRun = true;
        Module["calledRun"] = true;
        if (ABORT)
          return;
        initRuntime();
        readyPromiseResolve(Module);
        if (Module["onRuntimeInitialized"])
          Module["onRuntimeInitialized"]();
        postRun();
      }
      if (Module["setStatus"]) {
        Module["setStatus"]("Running...");
        setTimeout(function() {
          setTimeout(function() {
            Module["setStatus"]("");
          }, 1);
          doRun();
        }, 1);
      } else {
        doRun();
      }
    }
    Module["run"] = run;
    if (Module["preInit"]) {
      if (typeof Module["preInit"] == "function")
        Module["preInit"] = [Module["preInit"]];
      while (Module["preInit"].length > 0) {
        Module["preInit"].pop()();
      }
    }
    run();
    return PAGInit2.ready;
  };
})();

class WebAssemblyQueue {
  constructor() {
    this.executing = false;
    this.queue = [];
  }
  exec(fn, scope, ...args) {
    return new Promise((resolve) => {
      const copyFn = async () => {
        if (!fn) {
          resolve(null);
          return;
        }
        const res = await fn.call(scope, ...args);
        resolve(res);
      };
      this.queue.push({
        fn: copyFn
      });
    });
  }
  start() {
    setInterval(() => {
      if (this.executing)
        return;
      this.execNextTask();
    }, 1);
  }
  execNextTask() {
    if (this.queue.length < 1) {
      this.executing = false;
      return;
    }
    this.executing = true;
    const task = this.queue.shift();
    task.fn().finally(() => {
      this.execNextTask();
    });
  }
}

const PAGInit = (moduleOption) => PAGInit$1(moduleOption).then((module) => {
  module.webAssemblyQueue = new WebAssemblyQueue();
  module.webAssemblyQueue.start();
  binding(module);
  PAGFont.registerFallbackFontNames();
  return module;
});

let pagView = null;
let pagFile = null;
let cacheEnabled;
let videoEnabled;
let globalCacheScale;
let videoEl = null;
let PAG;
let canvasElementSize = 640;
let isMobile = false;
window.onload = async () => {
  var _a;
  PAG = await PAGInit();
  isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);
  if (isMobile) {
    (_a = document.querySelector('meta[name="viewport"]')) == null ? void 0 : _a.setAttribute("content", "viewport-fit=cover, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no");
    await loadScript("https://unpkg.com/vconsole@latest/dist/vconsole.min.js");
    new window.VConsole();
    canvasElementSize = 320;
    const canvas = document.getElementById("pag");
    canvas.width = canvasElementSize;
    canvas.height = canvasElementSize;
    const tablecloth = document.getElementById("tablecloth");
    tablecloth.style.width = `${canvasElementSize}px`;
    tablecloth.style.height = `${canvasElementSize}px`;
  }
  console.log("wasm loaded!", PAG);
  document.getElementById("waiting").style.display = "none";
  document.getElementById("container").style.display = isMobile ? "block" : "";
  document.getElementById("btn-upload-font").addEventListener("click", () => {
    document.getElementById("upload-font").click();
  });
  document.getElementById("upload-font").addEventListener("change", (event) => {
    const file = event.target.files[0];
    document.getElementById("upload-font-text").innerText = `\u5DF2\u52A0\u8F7D${file.name}`;
  });
  document.getElementById("btn-test-font").addEventListener("click", () => {
    const url = "./assets/SourceHanSansSC-Normal.otf";
    fetch(url).then((response) => response.blob()).then(async (blob) => {
      const file = new window.File([blob], url.replace(/(.*\/)*([^.]+)/i, "$2"));
      document.getElementById("upload-font-text").innerText = `\u5DF2\u52A0\u8F7D${file.name}`;
      await PAG.PAGFont.registerFont("SourceHanSansSC", file);
    });
  });
  document.getElementById("btn-upload-pag").addEventListener("click", () => {
    document.getElementById("upload-pag").click();
  });
  document.getElementById("upload-pag").addEventListener("change", (event) => {
    createPAGView(event.target.files[0]);
  });
  document.getElementById("btn-test-vector-pag").addEventListener("click", () => {
    const url = "./assets/like.pag";
    fetch(url).then((response) => response.blob()).then((blob) => {
      const file = new window.File([blob], url.replace(/(.*\/)*([^.]+)/i, "$2"));
      createPAGView(file);
    });
  });
  document.getElementById("btn-test-video-pag").addEventListener("click", () => {
    const url = "./assets/particle_video.pag";
    fetch(url).then((response) => response.blob()).then((blob) => {
      const file = new window.File([blob], url.replace(/(.*\/)*([^.]+)/i, "$2"));
      createPAGView(file);
    });
  });
  document.getElementById("btn-test-text-pag").addEventListener("click", async () => {
    const url = "./assets/test2.pag";
    const response = await fetch(url);
    const blob = await response.blob();
    const file = new window.File([blob], url.replace(/(.*\/)*([^.]+)/i, "$2"));
    await createPAGView(file);
    const textDoc = await pagFile.getTextData(0);
    console.log(textDoc);
    textDoc.text = "\u66FF\u6362\u540E\u7684\u6587\u5B57";
    textDoc.fillColor = { red: 255, green: 255, blue: 255 };
    textDoc.applyFill = true;
    textDoc.backgroundAlpha = 100;
    textDoc.backgroundColor = { red: 255, green: 0, blue: 0 };
    textDoc.baselineShift = 200;
    textDoc.fauxBold = true;
    textDoc.fauxItalic = false;
    textDoc.fontFamily = "PingFang SC";
    textDoc.fontSize = 100;
    textDoc.justification = ParagraphJustification.CenterJustify;
    textDoc.strokeWidth = 20;
    textDoc.strokeColor = { red: 0, green: 0, blue: 0 };
    textDoc.applyStroke = true;
    textDoc.strokeOverFill = true;
    textDoc.tracking = 600;
    pagFile.replaceText(0, textDoc);
    pagView.play();
  });
  document.getElementById("btn-pagfile-get-duration").addEventListener("click", async () => {
    const duration = await pagFile.duration();
    console.log(`PAGFile duration ${duration}`);
  });
  document.getElementById("btn-pagfile-set-duration").addEventListener("click", async () => {
    const duration = Number(document.getElementById("input-pagfile-duration").value);
    await pagFile.setDuration(duration);
    console.log(`Set PAGFile duration ${duration} `);
  });
  document.getElementById("btn-pagfile-time-stretch-mode").addEventListener("click", async () => {
    const timeStretchMode = await pagFile.timeStretchMode();
    console.log(`PAGFile timeStretchMode ${timeStretchMode} `);
  });
  document.getElementById("btn-pagfile-set-time-stretch-mode").addEventListener("click", () => {
    const mode = Number(document.getElementById("select-time-stretch-mode").value);
    pagFile.setTimeStretchMode(mode);
    console.log(`Set PAGFile timeStretchMode ${mode}`);
  });
  document.getElementById("btn-play").addEventListener("click", () => {
    pagView.play();
    console.log("\u5F00\u59CB");
  });
  document.getElementById("btn-pause").addEventListener("click", () => {
    pagView.pause();
    console.log("\u6682\u505C");
  });
  document.getElementById("btn-stop").addEventListener("click", () => {
    pagView.stop();
    console.log("\u505C\u6B62");
  });
  document.getElementById("btn-destroy").addEventListener("click", function() {
    pagView.destroy();
    console.log("\u9500\u6BC1");
  });
  document.getElementById("btn-getProgress").addEventListener("click", async () => {
    console.log(`\u5F53\u524D\u8FDB\u5EA6\uFF1A${await pagView.getProgress()}`);
  });
  document.getElementById("setProgress").addEventListener("click", async () => {
    let progress = Number(document.getElementById("progress").value);
    if (!(progress >= 0 && progress <= 1)) {
      alert("\u8BF7\u8F93\u51650\uFF5E1\u4E4B\u95F4");
    }
    await pagView.setProgress(progress);
    console.log(`\u5DF2\u8BBE\u7F6E\u8FDB\u5EA6\uFF1A${progress}`);
  });
  document.getElementById("setRepeatCount").addEventListener("click", () => {
    let repeatCount = Number(document.getElementById("repeatCount").value);
    pagView.setRepeatCount(repeatCount);
    console.log(`\u5DF2\u8BBE\u7F6E\u5FAA\u73AF\u6B21\u6570\uFF1A${repeatCount}`);
  });
  document.getElementById("btn-maxFrameRate").addEventListener("click", async () => {
    console.log(`maxFrameRate: ${await pagView.maxFrameRate()}`);
  });
  document.getElementById("setMaxFrameRate").addEventListener("click", () => {
    let maxFrameRate = Number(document.getElementById("maxFrameRate").value);
    pagView.setMaxFrameRate(maxFrameRate);
  });
  document.getElementById("btn-scaleMode").addEventListener("click", async () => {
    console.log(`scaleMode: ${await pagView.scaleMode()}`);
  });
  document.getElementById("setScaleMode").addEventListener("click", () => {
    let scaleMode = Number(document.getElementById("scaleMode").value);
    pagView.setScaleMode(scaleMode);
  });
  videoEnabled = true;
  document.getElementById("btn-videoEnabled").addEventListener("click", async () => {
    videoEnabled = await pagView.videoEnabled();
    console.log(`videoEnabled status: ${videoEnabled}`);
  });
  document.getElementById("btn-setVideoEnabled").addEventListener("click", () => {
    pagView.setVideoEnabled(!videoEnabled);
  });
  cacheEnabled = true;
  document.getElementById("btn-cacheEnabled").addEventListener("click", async () => {
    cacheEnabled = await pagView.cacheEnabled();
    console.log(`cacheEnabled status: ${cacheEnabled}`);
  });
  document.getElementById("btn-setCacheEnabled").addEventListener("click", () => {
    pagView.setCacheEnabled(!cacheEnabled);
  });
  document.getElementById("btn-freeCache").addEventListener("click", () => {
    pagView.freeCache();
  });
  globalCacheScale = true;
  document.getElementById("btn-cacheScale").addEventListener("click", async () => {
    globalCacheScale = await pagView.cacheScale();
    console.log(`cacheScale status: ${globalCacheScale}`);
  });
  document.getElementById("btn-setCacheScale").addEventListener("click", () => {
    let cacheScale = Number(document.getElementById("cacheScale").value);
    if (!(cacheScale >= 0 && cacheScale <= 1)) {
      alert("\u8BF7\u8F93\u51650\uFF5E1\u4E4B\u95F4");
    }
    pagView.setCacheScale(cacheScale);
  });
};
const createPAGView = async (file) => {
  if (pagFile)
    pagFile.destroy();
  if (pagView)
    pagView.destroy();
  pagFile = await PAG.PAGFile.load(file);
  const pagCanvas = document.getElementById("pag");
  pagCanvas.width = canvasElementSize;
  pagCanvas.height = canvasElementSize;
  pagView = await PAG.PAGView.init(pagFile, pagCanvas);
  pagView.setRepeatCount(0);
  pagView.addListener("onAnimationStart", (event) => {
    console.log("onAnimationStart", event);
  });
  pagView.addListener("onAnimationEnd", (event) => {
    console.log("onAnimationEnd", event);
  });
  pagView.addListener("onAnimationCancel", (event) => {
    console.log("onAnimationCancel", event);
  });
  pagView.addListener("onAnimationRepeat", (event) => {
    console.log("onAnimationRepeat", event);
  });
  document.getElementById("control").style.display = "";
  const editableLayers = await getEditableLayer(PAG, pagFile);
  console.log(editableLayers);
  renderEditableLayer(editableLayers);
  console.log(`\u5DF2\u52A0\u8F7D ${file.name}`);
  return pagView;
};
const loadVideoReady = (el, src) => {
  return new Promise((resolve) => {
    const listener = () => {
      el.removeEventListener("canplay", listener);
      console.log("canplay");
      resolve(true);
    };
    el.addEventListener("canplay", listener);
    el.src = src;
  });
};
const setVideoTime = (el, time) => {
  return new Promise((resolve) => {
    const listener = () => {
      el.removeEventListener("timeupdate", listener);
      console.log("timeupdate");
      resolve(true);
    };
    el.addEventListener("timeupdate", listener);
    el.currentTime = time;
  });
};
const getEditableLayer = async (PAG2, pagFile2) => {
  const editableImageCount = await pagFile2.numImages();
  let res = [];
  for (let i = 0; i < editableImageCount; i++) {
    const vectorPagLayer = await pagFile2.getLayersByEditableIndex(i, PAG2.LayerType.Image);
    for (let j = 0; j < vectorPagLayer.size(); j++) {
      const pagLayerWasm = vectorPagLayer.get(j);
      const pagLayer = new PAG2.PAGLayer(pagLayerWasm);
      const uniqueID = await pagLayer.uniqueID();
      const layerType = await pagLayer.layerType();
      const layerName = await pagLayer.layerName();
      const opacity = await pagLayer.opacity();
      const visible = await pagLayer.visible();
      const editableIndex = await pagLayer.editableIndex();
      const duration = await pagLayer.duration();
      const frameRate = await pagLayer.frameRate();
      const localStartTime = await pagLayer.startTime();
      const startTime = await pagLayer.localTimeToGlobal(localStartTime);
      res.push({ uniqueID, layerType, layerName, opacity, visible, editableIndex, frameRate, startTime, duration });
    }
  }
  return res;
};
const renderEditableLayer = (editableLayers) => {
  const box = document.createElement("div");
  box.className = "mt-24";
  box.innerText = "\u56FE\u5C42\u7F16\u8F91\uFF1A";
  editableLayers.forEach((layer) => {
    const item = document.createElement("div");
    item.className = "mt-24";
    item.innerText = `editableIndex: ${layer.editableIndex} startTime: ${layer.startTime} duration: ${layer.duration}`;
    const replaceImageBtn = document.createElement("button");
    replaceImageBtn.addEventListener("click", () => {
      replaceImage(item, layer.editableIndex);
    });
    replaceImageBtn.style.marginLeft = "12px";
    replaceImageBtn.innerText = "\u66FF\u6362\u56FE\u7247";
    item.appendChild(replaceImageBtn);
    const replaceVideoBtn = document.createElement("button");
    replaceVideoBtn.addEventListener("click", () => {
      replaceVideo(item, layer.editableIndex);
    });
    replaceVideoBtn.style.marginLeft = "12px";
    replaceVideoBtn.innerText = "\u66FF\u6362\u89C6\u9891";
    item.appendChild(replaceVideoBtn);
    box.appendChild(item);
  });
  document.body.appendChild(box);
};
const replaceImage = (element, index) => {
  const inputEl = document.createElement("input");
  inputEl.type = "file";
  inputEl.style.display = "none";
  element.appendChild(inputEl);
  inputEl.addEventListener("change", async (event) => {
    const pagImage = await PAG.PAGImage.fromFile(event.target.files[0]);
    const pagFile2 = await pagView.getComposition();
    await pagFile2.replaceImage(index, pagImage);
    await pagView.flush();
    await pagImage.destroy();
  });
  inputEl.click();
  element.removeChild(inputEl);
};
const replaceVideo = (element, index) => {
  const inputEl = document.createElement("input");
  inputEl.type = "file";
  inputEl.style.display = "none";
  element.appendChild(inputEl);
  inputEl.addEventListener("change", async (event) => {
    if (!videoEl)
      videoEl = document.createElement("video");
    await loadVideoReady(videoEl, URL.createObjectURL(event.target.files[0]));
    await setVideoTime(videoEl, 0.05);
    const pagImage = await PAG.PAGImage.fromSource(videoEl);
    const pagFile2 = await pagView.getComposition();
    await pagFile2.replaceImage(index, pagImage);
    await pagView.flush();
    await pagImage.destroy();
  });
  inputEl.click();
  element.removeChild(inputEl);
};
const loadScript = (url) => {
  return new Promise((resolve, reject) => {
    const scriptEl = document.createElement("script");
    scriptEl.type = "text/javascript";
    scriptEl.onload = () => {
      resolve(true);
    };
    scriptEl.onerror = () => {
      reject(false);
    };
    scriptEl.src = url;
    document.body.appendChild(scriptEl);
  });
};
//# sourceMappingURL=index.js.map
