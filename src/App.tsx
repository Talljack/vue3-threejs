import * as THREE from 'three'
import { PLYExporter } from 'three/examples/jsm/exporters/PLYExporter.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {PLYLoader} from 'three/examples/jsm/loaders/PLYLoader.js';
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader';
import {PCDLoader} from 'three/examples/jsm/loaders/PCDLoader';
import {ObjectLoader} from 'three/src/loaders/ObjectLoader';

let scene, camera, renderer, exporter, mesh;

init();
animate();

function init() {

	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.set( 200, 100, 200 );

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xa0a0a0 );
	scene.fog = new THREE.Fog( 0xa0a0a0, 200, 1000 );

	exporter = new PLYExporter();

	//

	const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
	hemiLight.position.set( 0, 200, 0 );
	scene.add( hemiLight );

	const directionalLight = new THREE.DirectionalLight( 0xffffff );
	directionalLight.position.set( 0, 200, 100 );
	directionalLight.castShadow = false;
	// directionalLight.shadow.camera.top = 180;
	// directionalLight.shadow.camera.bottom = - 100;
	// directionalLight.shadow.camera.left = - 120;
	// directionalLight.shadow.camera.right = 120;
	scene.add( directionalLight );

	// ground
	const ground = new THREE.Mesh( new THREE.PlaneGeometry( 3000, 3000 ), new THREE.MeshPhongMaterial( { color: 0x999999} ) );
	ground.rotation.x = - Math.PI / 2;
	ground.receiveShadow = true;
	ground.position.y = -0.001
	scene.add( ground );

	const grid = new THREE.GridHelper( 2000, 20, 0x000000, 0x000000 );
	grid.material.opacity = 0.2;
	grid.material.transparent = true;
	scene.add( grid );

	//ply格式
	const PLYloader = new PLYLoader();
	PLYloader.load("../public/box.ply", function (geometry) {
		//更新顶点的法向量
		geometry.computeVertexNormals();
		//创建纹理，并将模型添加到场景道中
		const material = new THREE.MeshStandardMaterial( { color: 0x0055ff, flatShading: true,transparent: true,
		opacity: 0.1, } );
		const mesh = new THREE.Mesh( geometry, material );
		mesh.rotation.y = Math.PI;
		mesh.position.x = 300;
		// 	mesh.position.x = - 0.2;
		// mesh.position.y = - 0.02;
		// mesh.position.z = - 0.2;
		// mesh.scale.multiplyScalar( 0.0006 );

		// mesh.castShadow = true;
		// mesh.receiveShadow = true;
		//   mesh.scale.set(1, 1, 1);
		scene.add( mesh );
	});


	//pcd格式
	const pcdLoader = new PCDLoader();
	
	pcdLoader.load("../public/pcd1.pcd", function (geometry) {
	  scene.add( geometry );
	});
	


	//obj格式
	const OBJloader = new OBJLoader();
	OBJloader.load('../public/12.obj',function ( obj ) {
		var children = obj.children;
			for (var i = 0; i < children.length; i++) {
					//添加阴影
					children[i].castShadow= true;
			}
			scene.add(obj);
			obj.scale.set(1,1,1);
			// obj.children[0].material.color.set(0xff0000);
	},
	function ( xhr ) {
		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
	},
	function ( error ) {
		console.log( 'An error happened' );
	})

	//json格式

	const objectLoader = new ObjectLoader();
	objectLoader.load('../public/json1.json',function ( obj ) {
			scene.add(obj);
		}
	);
	
	


	

	

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.shadowMap.enabled = true;
	document.body.appendChild( renderer.domElement );


	const controls = new OrbitControls( camera, renderer.domElement );
	controls.target.set( 0, 25, 0 );
	controls.update();

	//相关事件

	// window.addEventListener( 'resize', onWindowResize );

	// const buttonExportASCII = document.getElementById( 'exportASCII' );
	// (buttonExportASCII as any).addEventListener( 'click', exportASCII );

	// const buttonExportBinaryBE = document.getElementById( 'exportBinaryBigEndian' );
	// (buttonExportBinaryBE as any).addEventListener( 'click', exportBinaryBigEndian );

	// const buttonExportBinaryLE = document.getElementById( 'exportBinaryLittleEndian' );
	// (buttonExportBinaryLE as any).addEventListener( 'click', exportBinaryLittleEndian );

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

	requestAnimationFrame( animate );
	renderer.render( scene, camera );

}

function exportASCII() {

	exporter.parse( mesh, function ( result ) {

		saveString( result, 'box.ply' );

	} );

}

function exportBinaryBigEndian() {

	exporter.parse( mesh, function ( result ) {

		saveArrayBuffer( result, '../public/test.ply' );

	}, { binary: true } );

}

function exportBinaryLittleEndian() {

	exporter.parse( mesh, function ( result ) {

		saveArrayBuffer( result, '../public/test.ply' );

	}, { binary: true, littleEndian: true } );

}

const link = document.createElement( 'a' );
link.style.display = 'none';
document.body.appendChild( link );

function save( blob, filename ) {

	link.href = URL.createObjectURL( blob );
	link.download = filename;
	link.click();

}

function saveString( text, filename ) {

	save( new Blob( [ text ], { type: 'text/plain' } ), filename );

}

function saveArrayBuffer( buffer, filename ) {

	save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );

}
export default {
  render() {
    return (
      <div id="info">
        <a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - exporter - ply<br/><br/>
        <button id="exportASCII">export ASCII</button> <button id="exportBinaryBigEndian">export binary (Big Endian)</button> <button id="exportBinaryLittleEndian">export binary (Little Endian)</button>
      </div>
    )
  }
}
