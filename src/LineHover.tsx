import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as Stats from 'three/examples/js/libs/stats.min.js'
import { defineComponent, ref } from 'vue';



export default defineComponent({
	setup(props){


		let scene, camera, renderer,selectObject,stats,controls;



//相机
function initCamera() {
	//与视点坐标系联动
	camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10000);
	camera.position.set(0, 400, 600);
	camera.lookAt(new THREE.Vector3(0, 0, 0));
}

//场景
function initScene() {
	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xa0a0a0 );
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
		// const canvas = canvasContent()
		// renderer = new THREE.WebGLRenderer({
		// 		canvas,
		// 		antialias: true //抗锯齿
		// });
		// renderer.setSize(window.innerWidth, window.innerHeight);
		// renderer.setClearColor(0x050505);
}

function initContent() {

	//平面ground的样式这里是grid
	const grid = new THREE.GridHelper( 2000, 20, 0x000000, 0x000000 );
	grid.material.opacity = 0.2;
	grid.material.transparent = true;
	scene.add( grid );

	var box = new THREE.BoxGeometry(30, 30, 30);
	var boxMaterial = new THREE.MeshPhongMaterial({
		color: 0xffffff,
		wireframe: true
	});

	// 立方体网格模型
	var boxMesh = new THREE.Mesh(box, boxMaterial);

	// 立方体几何体box作为EdgesGeometry参数创建一个新的几何体
	var edges = new THREE.EdgesGeometry(box);
	// edges.position.z = 30
	// 立方体线框，不显示中间的斜线
	var edgesMaterial = new THREE.LineBasicMaterial({
		color: 0xffff00
	})
	var line = new THREE.LineSegments(edges,edgesMaterial);
	// 网格模型和网格模型对应的轮廓线框插入到场景中
	scene.add(edges,line);


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
      let light = new THREE.SpotLight(0xffffff);
        light.position.set(-300, 600, -400);
        light.castShadow = true;

        scene.add(light);
        scene.add(new THREE.AmbientLight(0x5C5C5C));
    }

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
        update();
    }

    //更新控件
    function update(){
        stats.update();
    }

		function init(){
			initScene();
			initCamera();
			initRenderer();
			initContent();
			addEventListener('click', onMouseDblclick, false);
			addEventListener('resize', onWindowResize, false);
			addEventListener('keydown', onKeyDown, false);
		}

		init()
		animate()


	return {

	}
},
  render() {
    return (
			<div>
				
			</div>
		)
  }
})
