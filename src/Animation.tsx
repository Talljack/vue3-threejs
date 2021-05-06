import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { computed, CSSProperties, defineComponent, onMounted, onUnmounted } from "vue";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { ObjectLoader } from 'three/src/loaders/ObjectLoader';
import { PCDLoader } from 'three/examples/jsm/loaders/PCDLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { makeTextSprite } from './makeTextSprite'

export default defineComponent({
  name:'animation',
  setup(){

    let scene, camera, renderer, selectObject, stats, controls, stop;
    let rayCaster = new THREE.Raycaster();
    let mouse = new THREE.Vector3();
    let INTERSECTED;
    let currentFrame = 0;
    let windowSize = {
      width: 1200,
      height: 500,
    };
    const scenes = [
      // {
      //   ply: "../public/reg_pc1.ply",
      //   obj: "",
      //   json: "",
      //   pcd: ""
      // },
      {
        ply: "../public/reg_pc1.ply",
        obj: "../public/obj1.obj",
        json: "../public/json1.json",
        pcd: "../public/pcd1.pcd"
      },
      {
        ply: "../public/box.ply",
        obj: "../public/obj1.obj",
        json: "../public/json1.json",
        pcd: "../public/pcd2.pcd"
      },
      {
        ply: "../public/box2.ply",
        obj: "../public/obj1.obj",
        json: "../public/json1.json",
         pcd: "../public/pcd1.pcd"
      },
      {
        ply: "../public/box.ply",
        obj: "../public/obj1.obj",
        json: "../public/json1.json",
        pcd: "../public/pcd2.pcd"
      },
      {
        ply: "../public/box2.ply",
        obj: "../public/obj1.obj",
        json: "../public/json1.json",
         pcd: "../public/pcd1.pcd"
      },
      {
        ply: "../public/box.ply",
        obj: "../public/obj1.obj",
        json: "../public/json1.json",
        pcd: "../public/pcd2.pcd"
      },
      {
        ply: "../public/box2.ply",
        obj: "../public/obj1.obj",
        json: "../public/json1.json",
         pcd: "../public/pcd1.pcd"
      },
    ];
    let currentScenesMesh:number[] = [];

    const initCamera = () => {
      //与视点坐标系联动
      camera = new THREE.PerspectiveCamera(
        50,
        windowSize.width / windowSize.height,
        0.1,
        10000
      );
      camera.position.set(0, 400, 600);
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0xa0a0a0);
      //聚焦
      camera.lookAt(new THREE.Vector3(0, 0, 0));
    };

    const initScene = () => {
      const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
      hemiLight.position.set(0, 200, 0);
      scene.add(hemiLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff);
      directionalLight.position.set(0, 200, 100);
      directionalLight.castShadow = false;
      directionalLight.shadow.camera.top = 180;
      directionalLight.shadow.camera.bottom = -100;
      directionalLight.shadow.camera.left = -120;
      directionalLight.shadow.camera.right = 120;
      scene.add(directionalLight);

      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(3000, 3000),
        new THREE.MeshPhongMaterial({ color: 0x999999 })
      );
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      ground.position.y = -0.001;
      scene.add(ground);
    };

    const initRenderer = () => {
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(windowSize.width, windowSize.height);
      renderer.shadowMap.enabled = true;
    };

    const initControl = () => {
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.target.set(0, 25, 0);
      controls.update();
      window.onresize = () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
      }
    };

    const initGround = () => {
      const grid = new THREE.GridHelper(2000, 20, 0x000000, 0x000000);
      grid.material.opacity = 0.2;
      grid.material.transparent = true;
      scene.add(grid);
    };
    const animate = () => {
      if (selectObject != undefined && selectObject != null) {

      }
      stop = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    const getIntersects = (event) => {
      event.preventDefault();
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1; //这里为什么是-号，没有就无法点中
      rayCaster.setFromCamera(mouse, camera);
      let intersects = rayCaster.intersectObjects(scene.children);
      return intersects;
    };

    const changeMaterial = (intersects) => {
      console.log(intersects)
      if (intersects.length > 0 && intersects[0].object.name !== "") {
        if (INTERSECTED != intersects[0].object) {
          if (INTERSECTED)
            INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
          INTERSECTED = intersects[0].object;
          INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
          INTERSECTED.material.color.setHex(0xff0000);
        }
      } else {
        if (INTERSECTED)
          INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
        INTERSECTED = null;
      }
    };

    const init = () => {
      initCamera();
      initScene();
      initRenderer();
      initControl();
      initGround();
      renderContent();
      addEventListener("mousemove", onMouseMove, false);
    };
    const onMouseMove = (event) => {
      let intersects = getIntersects(event);
      changeMaterial(intersects);
    };

    const addPly = (path) => {
      const PLYloader = new PLYLoader();
      PLYloader.load(path, function (geometry) {
        geometry.computeVertexNormals();
        const edges = new THREE.EdgesGeometry(geometry);
        const edgesMaterial = new THREE.LineBasicMaterial({
          color: 0xffff00,
          linewidth: 3,
        });
        const box = new THREE.LineSegments(edges, edgesMaterial);
        box.position.y = 100;
        box.name = "box";

        // 网格模型和网格模型对应的轮廓线框插入到场景中
        scene.add(box);
        currentScenesMesh.push(box);
      });
    };

    const addImage = paht => {
      let img = new THREE.MeshBasicMaterial({ 
        map:THREE.ImageUtils.loadTexture('../public/ecos.png')
      });
      img.map.needsUpdate = true; //ADDED

      // plane
      let plane = new THREE.Mesh(new THREE.PlaneGeometry(200, 200),img);
      plane.overdraw = true;
      scene.add(plane);
    }


    const createSpriteShape = (geometry) => {
       /*1、创建一个画布，记得设置画布的宽高，否则将使用默认宽高，有可能会导致图像显示变形*/
        let canvas = document.createElement("canvas");
        canvas.width = 20;
        canvas.height = 20;
        /*2、创建图形，这部分可以去看w3c canvas教程*/
        let ctx:any = canvas.getContext("2d")
        ctx.fillStyle = "blue"
        // ctx.roundRect(0, 0, 20, 20, input.value * 1 || 0);
        ctx?.arc(16,16,50,0,2*Math.PI);
        ctx?.fill();

        /*3、将canvas作为纹理，创建Sprite*/
        let texture = new THREE.Texture(canvas);
        texture.needsUpdate = true; //注意这句不能少
        let material = new THREE.SpriteMaterial({map:texture});
        let mesh = new THREE.Sprite(material);
        /*4、放大图片，每个精灵有自己的大小，默认情况下都是很小的，如果你不放大，基本是看不到的*/
        mesh.scale.set(1,1,1);
        geometry.add(mesh)
        return mesh;
    }

    const addDraco = () => {
      let dracoLoader = new DRACOLoader()
      dracoLoader.setDecoderPath( '/node_modules/three/examples/js/libs/draco/' );
      dracoLoader.preload();
      dracoLoader.load( '../public/bunny.drc', function ( geometry ) {

				geometry.computeVertexNormals();

				const material = new THREE.MeshStandardMaterial( { color: 0x606060 } );
				const mesh = new THREE.Mesh( geometry, material );
        mesh.scale.set(100, 100, 100);
				scene.add( mesh );

				dracoLoader.dispose();

			} );
    }

    interface IParameters {
      fontface?:string
      canvasWidth?:number
      canvasHeight?:number
      fontsize?:number
      borderThickness?:number
      borderColor?:string
      backgroundColor?:string
      fontColor?:string
      canvasX?:number
      canvasY?:number
      scaleSize?:number
      ArcR?:number
    }

    const addObj = (path) => {
      const OBJloader = new OBJLoader();
      OBJloader.load(path, function (obj) {
        const children = obj.children;
        obj.children[0].material.color.set(0xff0000);
        
        scene.add(obj)
        obj.scale.set(100, 100, 100);
        obj.position.y = 10;
        obj.name = "obj";
        console.log(obj)
        const parameters:IParameters = {
          backgroundColor:'blue'
        }
        const sprite = makeTextSprite('test', parameters)
        sprite.center = new THREE.Vector2(0, 0);
        scene.add(sprite)
        console.log(obj)
        sprite.position.set(obj.position.x, 0, obj.position.z);
        console.log(obj.position)
        currentScenesMesh.push(obj);
      });
    };

    const addJson = (path) => {
      const objectLoader = new ObjectLoader();
      objectLoader.load(path,function ( obj ) {
        obj.scale.set(10, 10, 10);
        scene.add(obj);
      }
      );
    };

    const addPcd = path => {
      const pcdLoader = new PCDLoader();
      pcdLoader.load(path, function (geometry) {
        scene.add( geometry );
        geometry.scale.set(20, 20, 20);
      });
    }

    const renderContent = (currentFrame = 0) => {
      addPly(scenes[currentFrame].ply)
      addObj(scenes[currentFrame].obj)
      addJson(scenes[currentFrame].json)
      addPcd(scenes[currentFrame].pcd)
    };

    init();
    animate();

    const removeScenesMesh = () => {
      scene.remove(...currentScenesMesh);
    };

    const preStep = () => {
      removeScenesMesh();
      if (currentFrame > 0) {
        --currentFrame;
        renderContent();
      }
    };

    const nextStep = () => {
      removeScenesMesh();
      ++currentFrame;
      renderContent();
    };
    
    const play = () => {
      console.log(scenes.length)
      let playRaf = window.setInterval(()=>{
        console.log(currentFrame)
        nextStep()
        if(currentFrame>=scenes.length){
        clearInterval(playRaf) 
      }
      },1500)
    }
    
    onMounted(() => {
      document.getElementById("canvas")?.appendChild(renderer.domElement);
    });

    onUnmounted(() => {
      window.cancelAnimationFrame(stop);
    });
    return { 
      preStep, 
      nextStep,
      play,
      contentStyle: computed<CSSProperties>(() => {
        return {
          background: 'rgb(192, 189, 189)'
        }
      }),
      mainStyle: computed<CSSProperties>(() => {
        return {
          height: '500px',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative'
        }
      }),
      canvasStyle: computed<CSSProperties>(() => {
        return {
          height: '500px',
          width: '1200px',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }
      })
    
    };
  },
  render(){
    const { preStep, nextStep,contentStyle,mainStyle,canvasStyle,play } = this
    return (
        <div style={contentStyle}>
          <div style={mainStyle}>
            <div style={canvasStyle} id="canvas">
          </div>
          </div>
          <button onClick={ preStep }>上一帧</button>
          <button onClick={ nextStep }>下一帧</button>
          <button onClick={ play }>播放</button>
        </div>
    )
  }
})