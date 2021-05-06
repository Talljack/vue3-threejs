import * as THREE from "three";
export function makeTextSprite(message:string, parameters = {}) {

  if ( parameters === undefined ) parameters = {};

  let fontface = parameters.hasOwnProperty("fontface") ?
      parameters["fontface"] : "Arial";

  let canvasWidth = parameters.hasOwnProperty("canvasWidth") ?
      parameters["canvasWidth"] : 100;

  let canvasHeight = parameters.hasOwnProperty("canvasHeight") ?
  parameters["canvasHeight"] : 50;

  let canvasX = parameters.hasOwnProperty("canvasX") ?
      parameters["canvasX"] : 20;

  let scaleSize = parameters.hasOwnProperty("scaleSize") ?
  parameters["scaleSize"] : 50;

  let ArcR = parameters.hasOwnProperty("ArcR") ?
      parameters["ArcR"] : 20;
  
  let canvasY = parameters.hasOwnProperty("canvasY") ?
  parameters["canvasY"] : 20;

  /* 字体大小 */
  let fontsize = parameters.hasOwnProperty("fontsize") ?
      parameters["fontsize"] : 18;
  
  let fontColor = parameters.hasOwnProperty("fontColor") ?
  parameters["fontColor"] : "#fff";

  /* 边框厚度 */
  let borderThickness = parameters.hasOwnProperty("borderThickness") ?
      parameters["borderThickness"] : 4;

  /* 边框颜色 */
  let borderColor = parameters.hasOwnProperty("borderColor") ?
      parameters["borderColor"] : "#fff";

  /* 背景颜色 */
  let backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
      parameters["backgroundColor"] : "blue";

  /* 创建画布 */
  let canvas:HTMLCanvasElement = document.createElement('canvas');

  const res = canvas.getContext('2d');
  if (!res || !(res instanceof CanvasRenderingContext2D)) {
      throw new Error('Failed to get 2D context');
  }
  const context: CanvasRenderingContext2D = res;

  /* 获取文字的大小数据，高度取决于文字的大小 */
  let metrics = context.measureText( message );
  let textWidth = metrics.width;
  drawUsingArc(canvasX, canvasY, canvasWidth, canvasHeight, ArcR, context, backgroundColor);

    /* 字体加粗 */
  context.font = "Bold " + fontsize + "px " + fontface;

  /* 字体颜色 */
  context.fillStyle = fontColor;
  context.fillText(message, canvasX + (canvasWidth/2) - textWidth, canvasY + canvasHeight/2)

    /* 边框的颜色 */
  context.strokeStyle = borderColor
  context.lineWidth = borderThickness;

  /* 画布内容用于纹理贴图 */
  let texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  let spriteMaterial = new THREE.SpriteMaterial({ map: texture } );
  let sprite = new THREE.Sprite( spriteMaterial );

  /* 缩放比例 */
  const HWproportion = canvasWidth/canvasHeight
  sprite.scale.set(HWproportion*scaleSize,scaleSize,1);

  return sprite;
};

function drawUsingArc(x, y, w, h, r, ctx,backgroundColor) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.arc(x + w, y + r, r, (Math.PI / 180) * 270, Math.PI / 180 * 0);
  ctx.arc(x + w, y + r, r, (Math.PI / 180) * 0, Math.PI / 180 * 90);
  ctx.lineTo(x - r, y + 2 * r);
  ctx.lineTo(x - r, y + r);
  ctx.arc(x, y + r, r, (Math.PI / 180) * 180, Math.PI / 180 * 270);
  ctx.fillStyle = backgroundColor;
  ctx.fill();
  ctx.stroke();
}


