import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'three/examples/js/libs/dat.gui.min.js'
import * as Stats from 'three/examples/js/libs/stats.min.js'
    // import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'


    //stats有啥用？
    let stats = initStats();
    let scene, camera, renderer, controls, light, selectObject;

    //场景
    function initScene() {
        scene = new THREE.Scene();
    }

    //相机
    function initCamera() {
        //与视点坐标系联动
        camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10000);
        camera.position.set(0, 400, 600);
        camera.lookAt(new THREE.Vector3(0, 0, 0));
    }

    //渲染器
    function initRenderer() {
        const canvas = document.querySelector('#display');
        renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true //抗锯齿
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x050505);
    }

    //初始化模型
    function initContent() {
        let helper = new THREE.GridHelper(1200, 50, 0xCD3700, 0x4A4A4A);
        scene.add(helper);

        //?
        let cubeGeometry = new THREE.BoxGeometry(100, 100, 100);
        let cubeMaterial = new THREE.MeshLambertMaterial({color: 0x9370DB});
        //?
        let cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.y = 50;
        cube.name = "cube";
        scene.add(cube);

        let sphereGeometry = new THREE.SphereGeometry(50, 50, 50, 50);
        let sphereMaterial = new THREE.MeshLambertMaterial({color: 0x3CB371});
        let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.x = 200;
        sphere.position.y = 50;
        sphere.name = "sphere";
        scene.add(sphere);

        let cylinderGeometry = new THREE.CylinderGeometry(50, 50, 100, 100);
        let cylinderMaterial = new THREE.MeshLambertMaterial({color: 0xCD7054});
        let cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
        cylinder.position.x = -200;
        cylinder.position.y = 50;
        cylinder.name = "cylinder";
        scene.add(cylinder);
    }

    //鼠标双击触发的方法
    function onMouseDblclick(event) {
        //获取raycaster和所有模型相交的数组，其中的元素按照距离排序，越近的越靠前
        let intersects = getIntersects(event);

        //获取选中最近的Mesh对象
        if (intersects.length !== 0 && intersects[0].object instanceof THREE.Mesh) {
            selectObject = intersects[0].object;
            changeMaterial(selectObject);
        } else {
            alert('未选中 Mesh!');
        }
    }

    //获取与射线相交的对象数组
    function getIntersects(event){
        event.preventDefault();// 阻止默认的点击事件执行, https://developer.mozilla.org/zh-CN/docs/Web/API/Event/preventDefault
        console.log("event.clientX:" + event.clientX);
        console.log("event.clientX:" + event.clientY);

        //声明 rayCaster 和 mouse 变量
        let rayCaster = new THREE.Raycaster();
        let mouse = new THREE.Vector2();

        //通过鼠标点击位置，计算出raycaster所需点的位置，以屏幕为中心点，范围-1到1
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1; //这里为什么是-号，没有就无法点中

        //通过鼠标点击的位置(二维坐标)和当前相机的矩阵计算出射线位置
        rayCaster.setFromCamera(mouse, camera);

        //获取与射线相交的对象数组， 其中的元素按照距离排序，越近的越靠前。
        let intersects = rayCaster.intersectObjects(scene.children);

        //返回选中的对象
        return intersects;
    }

    // 窗口变动触发的方法
    function onWindowResize(){
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    //键盘按下触发的方法
    function onKeyDown(event){
      switch (event.keyCode){
        case 13:
        initCamera();
        initControls();
        break;
      }
    }

    //改变对象材质属性
    function changeMaterial(object){
        let materia = new THREE.MeshLambertMaterial({
            color: 0xffffff * Math.random(),
            transparent: object.material.transparent ? false : true,
            opacity: 0.8
        });
        object.material = materia;
    }

    //初始化轨道控制器
    function initControls(){
        controls = new THREE.TrackballControls(camera, renderer.domElement);
        //controls.enableDamping = true;
    }

    // 初始化灯光
    function initLight(){
        light = new THREE.SpotLight(0xffffff);
        light.position.set(-300, 600, -400);
        light.castShadow = true;

        scene.add(light);
        scene.add(new THREE.AmbientLight(0x5C5C5C));
    }

    //初始化 dat.GUI
    function initGui(){
        //保存需要修改相关数据的对象
        let gui = new function(){

        }

        //属性添加到控件
        let guiControls = new dat.GUI();
    }

    //初始化性能插件
    function initStats(){
        let stats = new Stats();

        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';

        document.body.appendChild(stats.domElement);
        return stats;
    }

    // 更新div的位置
    function renderDiv(object){
        //获取窗口的一半高度和宽度
        let halfWidth = window.innerWidth / 2;
        let halfHeight = window.innerHeight / 2;

        //逆转相机求出二维坐标
        let vector = object.position.clone().project(camera);

        //修改div的位置
        // $("#label").css({
        //     left: vector.x * halfWidth + halfWidth,
        //     top: -vector.y * halfHeight + halfHeight - object.position.y
        // });

        // //显示模型信息
        // $("#label").text("name:" + object.name);
    }

    //更新控件
    function update(){
        stats.update();
        controls.update();
    }

    //初始化
    function init(){
        initScene();
        initCamera();
        initRenderer();
        initContent();
        initLight();
        initControls();
        initGui();
        addEventListener('click', onMouseDblclick, false);
        addEventListener('resize', onWindowResize, false);
        addEventListener('keydown', onKeyDown, false);
    }

    function animate(){
        if (selectObject != undefined && selectObject != null){
            renderDiv(selectObject);
        }
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
        update();
    }

    init();
    animate();

    const bodyStyle = {
      margin: 0,
      overflow: 'hidden',
    }
     const label  = {
            'position': 'absolute',
            'padding': '10px',
            'background': 'rgba(255, 255, 255, 0.6)',
            'line-height': 1,
            'border-radius': '5px'
        }


export default {
  
  render() {
    return (
      <>
        <div id="WebGL-output"></div>
        <div id="Stats-output"></div>
        <div class={label} id="label"></div>
        <div>
            <canvas id="display"></canvas>
        </div>
      </>
    )
  }
}
