<template>
  <div>
    <div id="WebGL-output"></div>
    <div id="Stats-output"></div>
    <div id="label"></div>
    <!-- <div>
        <canvas ref="canvasEle"  id="display"></canvas>
    </div> -->
  </div>
</template>

<script lang="ts">

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as Stats from 'three/examples/js/libs/stats.min.js'
import { defineComponent, ref } from 'vue';
import { defineComponent } from 'vue'
import {PLYLoader} from 'three/examples/jsm/loaders/PLYLoader.js';

export default defineComponent({
  setup(){
    let scene, camera, renderer,selectObject,stats,controls;
    let rayCaster = new THREE.Raycaster();
    let mouse = new THREE.Vector3();
    let INTERSECTED;

    //相机
    function initCamera() {
      //与视点坐标系联动
      camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10000);
      camera.position.set(0, 400, 600);
      scene = new THREE.Scene();
      scene.background = new THREE.Color( 0xa0a0a0 );
      //聚焦
      // camera.lookAt(new THREE.Vector3(0, 0, 0));
    }

    //场景
    function initScene() {
      
      //定义线性fog
      // scene.fog = new THREE.Fog( 0xa0a0a0, 200, 1000 );

      //高亮
      const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
      hemiLight.position.set( 0, 200, 0 );
      scene.add( hemiLight );

      //定义光方向
      const directionalLight = new THREE.DirectionalLight( 0xffffff );
      directionalLight.position.set( 0, 200, 100 );
      directionalLight.castShadow = false;
      directionalLight.shadow.camera.top = 180;
      directionalLight.shadow.camera.bottom = - 100;
      directionalLight.shadow.camera.left = - 120;
      directionalLight.shadow.camera.right = 120;
      scene.add( directionalLight );

      // 平面ground颜色
      const ground = new THREE.Mesh( new THREE.PlaneGeometry( 3000, 3000 ), new THREE.MeshPhongMaterial( { color: 0x999999} ) );
      ground.rotation.x = - Math.PI / 2;
      ground.receiveShadow = true;
      ground.position.y = -0.001
      scene.add( ground );
    }

    //渲染器
    function initRenderer() {
        // renderer = new THREE.WebGLRenderer({
        // 		antialias: true //抗锯齿
        // });
        // renderer.setSize(window.innerWidth, window.innerHeight);
        // renderer.setClearColor(0x050505);
          renderer = new THREE.WebGLRenderer( { antialias: true } );
      renderer.setPixelRatio( window.devicePixelRatio );
      renderer.setSize( window.innerWidth, window.innerHeight );
      renderer.shadowMap.enabled = true;
      document.body.appendChild( renderer.domElement );

        const controls = new OrbitControls( camera, renderer.domElement );
        controls.target.set( 0, 25, 0 );
        controls.update();
         window.onresize = () => {
          renderer.setSize(window.innerWidth, window.innerHeight);
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
        }
    }

    function initContent() {

      //平面ground的样式这里是grid
      const grid = new THREE.GridHelper( 2000, 20, 0x000000, 0x000000 );
      grid.material.opacity = 0.2;
      grid.material.transparent = true;
      scene.add( grid );


//  const geometry = new THREE.BufferGeometry();
// // create a simple square shape. We duplicate the top left and bottom right
// // vertices because each vertex needs to appear once per triangle.
// const vertices = new Float32Array( [
// 0 ,0, 0,
// 25, 0, 0,
// 0, 25, 0,

// 0, 0, 25,
// 25, 25, 0,
// 25, 0, 25,

// 0, 25, 25, 
// 25, 25, 25,
// ] );

// // itemSize = 3 because there are 3 values (components) per vertex
// geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
// const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
// const mesh1 = new THREE.Mesh( geometry, material );
// scene.add(mesh1);



	// ply格式
	const PLYloader = new PLYLoader();
	PLYloader.load("../public/box3.ply", function (geometry) {
		//更新顶点的法向量
		geometry.computeVertexNormals();

    var edges = new THREE.EdgesGeometry(geometry);
    // edges.position.z = 30
    // 立方体线框，不显示中间的斜线
    var edgesMaterial = new THREE.LineBasicMaterial({
      color: 0xffff00,
      linewidth: 2
    })
    var line = new THREE.LineSegments(edges,edgesMaterial);
    line.position.y = 100;
    line.name = 'test'
    // 网格模型和网格模型对应的轮廓线框插入到场景中
    scene.add(line);

	});
      

      // var box = new THREE.BoxGeometry(200, 200, 200);
      // // var boxMaterial = new THREE.MeshPhongMaterial({
      // //   color: 0xffffff,
      // //   wireframe: true,
      // //   wireframeLinewidth:10,
      // // });
      // // box.name = ''


      // // // 立方体网格模型
      // // var boxMesh = new THREE.Mesh(box, boxMaterial);
      
      // // 立方体几何体box作为EdgesGeometry参数创建一个新的几何体
      // var edges = new THREE.EdgesGeometry(box);
      // // edges.position.z = 30
      // // 立方体线框，不显示中间的斜线
      // var edgesMaterial = new THREE.LineBasicMaterial({
      //   color: 0xffff00,
      //   linewidth: 10
      // })
      // var line = new THREE.LineSegments(edges,edgesMaterial);
      // line.position.y = 100;
      // line.name = 'test'
      // // 网格模型和网格模型对应的轮廓线框插入到场景中
      // scene.add(line);


      let cubeGeometry = new THREE.BoxGeometry(100, 100, 100);
      let cubeMaterial = new THREE.MeshLambertMaterial({color: 0x9370DB});
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


      // let cylinderGeometrytest = new THREE.CylinderGeometry(10, 10, 20, 20);
      // let cylinderMaterialtest = new THREE.MeshLambertMaterial({color: 0xCD7054});
      // let cylinder = new THREE.Mesh(cylinderGeometrytest, cylinderMaterialtest);
      // cylinder.position.y = 150;
      // cylinder.name = "cylinder";
      // scene.add(cylinder);

    }



    //鼠标双击触发的方法
    // function onMouseDblclick(event) {
    //     //获取raycaster和所有模型相交的数组，其中的元素按照距离排序，越近的越靠前
    //     let intersects = getIntersects(event);
    //     //获取选中最近的Mesh对象
    //     changeMaterial(intersects);
        
    // }
    function onPointerMove( event ) {
      event.preventDefault();
      let intersects = getIntersects(event);
      if (intersects.length !== 0) {
            if(intersects.name === 'dfa'){
              console.log(123)
            }
        } 
			}

    //获取与射线相交的对象数组
    function getIntersects(event){
        event.preventDefault();
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
    function changeMaterial(intersects){
      if ( intersects.length > 0 && intersects[0].object.name!=='' ) {
					if ( INTERSECTED != intersects[ 0 ].object ) {
						if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
						INTERSECTED = intersects[ 0 ].object;
						INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
						INTERSECTED.material.color.setHex( 0xff0000 );

					}

				} else {

					if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
					INTERSECTED = null;

				}


      // let edgesMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 })
      // let materia = new THREE.MeshLambertMaterial({
      //     color: 0xffffff * Math.random(),
      //     transparent: object.material.transparent ? false : true,
      //     opacity: 0.8
      // });
      // object.material = edgesMaterial;
      
        
    }

    //初始化轨道控制器
    // function initControls(){
    //     controls = new THREE.TrackballControls(camera, renderer.domElement);
    //     //controls.enableDamping = true;
    // }

    // // 初始化灯光
    // function initLight(){
    //   let light = new THREE.SpotLight(0xffffff);
    //     light.position.set(-300, 600, -400);
    //     light.castShadow = true;

    //     scene.add(light);
    //     scene.add(new THREE.AmbientLight(0x5C5C5C));
    // }

    // //初始化 dat.GUI
    // function initGui(){
    //     //保存需要修改相关数据的对象
    //     let gui = new function(){

    //     }

    //     //属性添加到控件
    //     let guiControls = new dat.GUI();
    // }

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

    function animate(){
        if (selectObject != undefined && selectObject != null){
            renderDiv(selectObject);
        }
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
        // update();
    }

    function onMouseMove( event ) {
      let intersects = getIntersects(event);
      changeMaterial(intersects);
    }

    


    //更新控件
    function update(){
        stats.update();
    }

		function init(){
      initCamera();
			initScene();
			
			initRenderer();
			initContent();
			// addEventListener('click', onMouseDblclick, false);
			addEventListener('resize', onWindowResize, false);
			// addEventListener('keydown', onKeyDown, false);
      // addEventListener( 'pointermove', onPointerMove, false );
      addEventListener( 'mousemove', onMouseMove, false );
		}

		init()
		animate()
  }
})
</script>

<style scoped>

</style>