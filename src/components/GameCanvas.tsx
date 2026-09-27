import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Keybindings, Settings, AttractionData } from '../types';
import { speakJeffLine } from '../utils/speech';

interface GameCanvasProps {
  isPlaying: boolean;
  keybindings: Keybindings;
  settings: Settings;
  activeMiniGame: string | null;
  onPause: () => void;
  onOpenNote: () => void;
  onOpenBalloonPop: () => void;
  onUpdateTickets: (delta: number) => void;
  onPickupItem: (itemName: string) => void;
  onShowPrompt: (prompt: string | null) => void;
  onShowNotification: (msg: string) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  isPlaying,
  keybindings,
  settings,
  activeMiniGame,
  onPause,
  onOpenNote,
  onOpenBalloonPop,
  onUpdateTickets,
  onPickupItem,
  onShowPrompt,
  onShowNotification,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // States & Refs for Three.js World
  const isHammerPickedUpRef = useRef(false);
  const isForkHeadActiveRef = useRef(false);
  const isForkHeadVanishedRef = useRef(false);
  const isRidingFerrisWheelRef = useRef(false);

  const [strikerActive, setStrikerActive] = useState(false);
  const strikerMeterRef = useRef(0);
  const strikerDirRef = useRef(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // --- Renderer & Camera ---
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030508);
    scene.fog = new THREE.FogExp2(0x030508, 0.035);

    const camera = new THREE.PerspectiveCamera(
      settings.fov,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    // --- Flashlight Spotlight ---
    const flashlight = new THREE.SpotLight(0xfff5e6, 4.5, 35, Math.PI / 5, 0.35, 1.2);
    flashlight.castShadow = true;
    flashlight.position.set(0, 0, 0.1);
    const flashlightTarget = new THREE.Object3D();
    flashlightTarget.position.set(0, 0, -5);
    camera.add(flashlight);
    camera.add(flashlightTarget);
    flashlight.target = flashlightTarget;
    scene.add(camera);

    const ambientLight = new THREE.AmbientLight(0x08101e, 0.15);
    scene.add(ambientLight);

    // --- World Objects ---
    let ferrisWheelRingGroup: THREE.Group;
    const ferrisWheelCartMeshes: THREE.Group[] = [];
    let coasterCurve: THREE.CatmullRomCurve3;
    let coasterCart: THREE.Mesh;
    let coasterProgress = 0;
    let coasterSpeedMult = 1;

    let hammerMesh: THREE.Group;
    let forkHeadMesh: THREE.Group;

    // --- Build Amusement Park ---
    const buildPark = () => {
      // Park Floor
      const groundGeo = new THREE.PlaneGeometry(120, 120);
      const groundMat = new THREE.MeshStandardMaterial({ color: 0x0a0d14, roughness: 0.95 });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      scene.add(ground);

      const grid = new THREE.GridHelper(120, 40, 0xe60039, 0x111c2e);
      grid.position.y = 0.02;
      scene.add(grid);

      // Entrance Hallway Walls
      const wallMat = new THREE.MeshStandardMaterial({ color: 0x151b28, roughness: 0.8 });

      const leftWall = new THREE.Mesh(new THREE.BoxGeometry(1, 8, 30), wallMat);
      leftWall.position.set(-5.5, 4, 35);
      scene.add(leftWall);

      const rightWall = new THREE.Mesh(new THREE.BoxGeometry(1, 8, 30), wallMat);
      rightWall.position.set(5.5, 4, 35);
      scene.add(rightWall);

      const roof = new THREE.Mesh(new THREE.BoxGeometry(12, 1, 30), wallMat);
      roof.position.set(0, 8, 35);
      scene.add(roof);

      // Wooden Crate for Toy Hammer
      const crate = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 1.5, 1.5),
        new THREE.MeshStandardMaterial({ color: 0x2e2015, roughness: 0.9 })
      );
      crate.position.set(-3, 0.75, 38);
      scene.add(crate);

      // Toy Hammer Item
      hammerMesh = new THREE.Group();
      const handle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 1.2),
        new THREE.MeshStandardMaterial({ color: 0xff0055 })
      );
      const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.4, 0.4),
        new THREE.MeshStandardMaterial({ color: 0xffe600 })
      );
      head.position.y = 0.6;
      hammerMesh.add(handle, head);
      hammerMesh.position.set(-3, 1.7, 38);
      hammerMesh.rotation.z = Math.PI / 4;
      scene.add(hammerMesh);

      // Table with Bloody Note
      const tableGroup = new THREE.Group();
      tableGroup.position.set(3, 0, 38);

      const tableTop = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 0.2, 1.8),
        new THREE.MeshStandardMaterial({ color: 0x2b1d0c, roughness: 0.9 })
      );
      tableTop.position.y = 1;
      tableGroup.add(tableTop);

      const paper = new THREE.Mesh(
        new THREE.PlaneGeometry(0.8, 1),
        new THREE.MeshStandardMaterial({ color: 0xff3333, emissive: 0x660000, side: THREE.DoubleSide })
      );
      paper.rotation.x = -Math.PI / 2;
      paper.rotation.z = 0.2;
      paper.position.set(0, 1.11, 0);
      tableGroup.add(paper);
      scene.add(tableGroup);

      // Peeking Teal Fork Head (Silent Jump Anomaly)
      forkHeadMesh = new THREE.Group();
      const tealMat = new THREE.MeshStandardMaterial({
        color: 0x00a8a8,
        roughness: 0.25, // Smooth shiny skin, NO FUR
        metalness: 0.1,
      });

      const forkBase = new THREE.Mesh(new THREE.BoxGeometry(2, 1.5, 0.8), tealMat);

      for (let i = -0.9; i <= 0.9; i += 0.6) {
        const tine = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.5), tealMat);
        tine.position.set(i, 1.8, 0);
        forkHeadMesh.add(tine);
      }

      const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffe600 });
      const eye1 = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 10), eyeMat);
      eye1.position.set(-0.5, 0.2, 0.45);
      const eye2 = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 10), eyeMat);
      eye2.position.set(0.5, 0.2, 0.45);
      forkHeadMesh.add(eye1, eye2);

      forkHeadMesh.add(forkBase);
      forkHeadMesh.position.set(-4.8, 2.8, 24);
      forkHeadMesh.rotation.y = Math.PI / 3;
      forkHeadMesh.visible = false;
      scene.add(forkHeadMesh);

      // --- Tall Huggy Wuggy Style Teal Fork Mascot ("Forky Gordon") ---
      const mascotGroup = new THREE.Group();
      mascotGroup.position.set(-2, 0, -12);

      const yellowAccentMat = new THREE.MeshStandardMaterial({ color: 0xffe600, roughness: 0.3 });

      // Long Slender Legs
      const legGeo = new THREE.CylinderGeometry(0.25, 0.25, 8, 12);
      const leftLeg = new THREE.Mesh(legGeo, tealMat);
      leftLeg.position.set(-0.9, 4, 0);
      const rightLeg = new THREE.Mesh(legGeo, tealMat);
      rightLeg.position.set(0.9, 4, 0);
      mascotGroup.add(leftLeg, rightLeg);

      // Yellow Feet
      const footGeo = new THREE.BoxGeometry(0.9, 0.5, 1.6);
      const leftFoot = new THREE.Mesh(footGeo, yellowAccentMat);
      leftFoot.position.set(-0.9, 0.25, 0.4);
      const rightFoot = new THREE.Mesh(footGeo, yellowAccentMat);
      rightFoot.position.set(0.9, 0.25, 0.4);
      mascotGroup.add(leftFoot, rightFoot);

      // Elongated Torso
      const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 6, 12), tealMat);
      torso.position.y = 11;
      mascotGroup.add(torso);

      // Very Long Slender Arms
      const armGeo = new THREE.CylinderGeometry(0.18, 0.18, 9, 12);
      const leftArm = new THREE.Mesh(armGeo, tealMat);
      leftArm.position.set(-1.6, 10, 0);
      leftArm.rotation.z = 0.15;
      const rightArm = new THREE.Mesh(armGeo, tealMat);
      rightArm.position.set(1.6, 10, 0);
      rightArm.rotation.z = -0.15;
      mascotGroup.add(leftArm, rightArm);

      // Yellow Hands
      const handGeo = new THREE.SphereGeometry(0.6, 12, 12);
      const leftHand = new THREE.Mesh(handGeo, yellowAccentMat);
      leftHand.position.set(-2.2, 5.5, 0);
      const rightHand = new THREE.Mesh(handGeo, yellowAccentMat);
      rightHand.position.set(2.2, 5.5, 0);
      mascotGroup.add(leftHand, rightHand);

      // Fork Head
      const mHead = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.8, 0.9), tealMat);
      mHead.position.y = 14.8;
      mascotGroup.add(mHead);

      for (let i = -1.2; i <= 1.2; i += 0.8) {
        const tine = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3.5, 12), tealMat);
        tine.position.set(i, 17.2, 0);
        mascotGroup.add(tine);
      }

      const mEye1 = new THREE.Mesh(new THREE.SphereGeometry(0.38, 12, 12), eyeMat);
      mEye1.position.set(-0.7, 15, 0.5);
      const mEye2 = new THREE.Mesh(new THREE.SphereGeometry(0.38, 12, 12), eyeMat);
      mEye2.position.set(0.7, 15, 0.5);
      mascotGroup.add(mEye1, mEye2);

      const mouth = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.6, 0.2), new THREE.MeshBasicMaterial({ color: 0x8b0000 }));
      mouth.position.set(0, 14.1, 0.5);
      mascotGroup.add(mouth);

      scene.add(mascotGroup);

      // --- Ferris Wheel ---
      const ferrisWheelGroup = new THREE.Group();
      ferrisWheelGroup.position.set(-32, 0, -25);

      const wheelCenterY = 18;
      const wheelRadius = 13;

      const legSupportGeo = new THREE.CylinderGeometry(0.3, 0.6, 22);
      const legSupportMat = new THREE.MeshStandardMaterial({ color: 0x1a2233, metalness: 0.8 });
      const fLeg1 = new THREE.Mesh(legSupportGeo, legSupportMat);
      fLeg1.position.set(-3, 10, 0);
      fLeg1.rotation.z = -0.25;
      const fLeg2 = new THREE.Mesh(legSupportGeo, legSupportMat);
      fLeg2.position.set(3, 10, 0);
      fLeg2.rotation.z = 0.25;
      ferrisWheelGroup.add(fLeg1, fLeg2);

      ferrisWheelRingGroup = new THREE.Group();
      ferrisWheelRingGroup.position.set(0, wheelCenterY, 0);

      const ringGeo = new THREE.TorusGeometry(wheelRadius, 0.4, 12, 32);
      const ringMat = new THREE.MeshStandardMaterial({ color: 0xe60039, emissive: 0x440011 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ferrisWheelRingGroup.add(ring);

      const numCarts = 8;
      const cartColors = [0x00d9ff, 0xffe600, 0xe60039, 0x00ff66];

      for (let i = 0; i < numCarts; i++) {
        const angle = (i / numCarts) * Math.PI * 2;

        const spokeGeo = new THREE.CylinderGeometry(0.08, 0.08, wheelRadius * 2);
        const spokeMat = new THREE.MeshBasicMaterial({ color: 0x334466 });
        const spoke = new THREE.Mesh(spokeGeo, spokeMat);
        spoke.rotation.z = angle;
        ferrisWheelRingGroup.add(spoke);

        const cartGroup = new THREE.Group();
        cartGroup.position.set(Math.cos(angle) * wheelRadius, Math.sin(angle) * wheelRadius, 0);

        const cart = new THREE.Mesh(
          new THREE.BoxGeometry(2, 2, 2),
          new THREE.MeshStandardMaterial({ color: cartColors[i % cartColors.length] })
        );
        cartGroup.add(cart);

        ferrisWheelRingGroup.add(cartGroup);
        ferrisWheelCartMeshes.push(cartGroup);
      }

      ferrisWheelGroup.add(ferrisWheelRingGroup);
      scene.add(ferrisWheelGroup);

      // --- Roller Coaster ---
      coasterCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(15, 6, -35),
        new THREE.Vector3(35, 18, -20),
        new THREE.Vector3(30, 8, 10),
        new THREE.Vector3(15, 22, 30),
        new THREE.Vector3(35, 10, 35),
        new THREE.Vector3(40, 26, 0),
      ], true);

      const track = new THREE.Mesh(
        new THREE.TubeGeometry(coasterCurve, 120, 0.4, 8, true),
        new THREE.MeshStandardMaterial({ color: 0x00d9ff, metalness: 0.8, roughness: 0.2 })
      );
      scene.add(track);

      coasterCart = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 1.2, 3.5),
        new THREE.MeshStandardMaterial({ color: 0xe60039, emissive: 0x880022 })
      );
      scene.add(coasterCart);

      // --- High Striker ---
      const strikerGroup = new THREE.Group();
      strikerGroup.position.set(-15, 0, 20);

      const sTower = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.5, 10),
        new THREE.MeshStandardMaterial({ color: 0x101826 })
      );
      sTower.position.y = 5;
      strikerGroup.add(sTower);

      const sBell = new THREE.Mesh(
        new THREE.SphereGeometry(0.8, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0xffe600 })
      );
      sBell.position.y = 10;
      strikerGroup.add(sBell);

      scene.add(strikerGroup);

      // --- Toy Booths / Stations ---
      const createBooth = (x: number, z: number, color: number) => {
        const boothGroup = new THREE.Group();
        boothGroup.position.set(x, 0, z);

        const bBase = new THREE.Mesh(
          new THREE.BoxGeometry(6, 3, 5),
          new THREE.MeshStandardMaterial({ color: 0x101522 })
        );
        bBase.position.y = 1.5;
        boothGroup.add(bBase);

        const bRoof = new THREE.Mesh(
          new THREE.ConeGeometry(4.5, 3, 4),
          new THREE.MeshStandardMaterial({ color: color })
        );
        bRoof.position.y = 4.5;
        bRoof.rotation.y = Math.PI / 4;
        boothGroup.add(bRoof);

        scene.add(boothGroup);
      };

      createBooth(18, -15, 0x00d9ff);
      createBooth(-18, -5, 0xe60039);
    };

    buildPark();

    // --- Interactive Attractions Registry ---
    const attractionsList: AttractionData[] = [
      {
        id: 'toy_hammer',
        name: 'Toy Hammer',
        pos: { x: -3, y: 1, z: 38 },
        radius: 3.5,
        actionText: 'Pick Up Toy Hammer',
      },
      {
        id: 'bloody_note',
        name: 'Bloody Note',
        pos: { x: 3, y: 1, z: 38 },
        radius: 3.5,
        actionText: 'Read Bloody Note',
      },
      {
        id: 'ferris_wheel',
        name: 'Ferris Wheel',
        pos: { x: -32, y: 0, z: -25 },
        radius: 12,
        actionText: 'Ride Ferris Wheel',
      },
      {
        id: 'balloon_pop',
        name: 'Balloon Pop Booth',
        pos: { x: 18, y: 0, z: -15 },
        radius: 6,
        actionText: 'Play Balloon Pop',
      },
      {
        id: 'high_striker',
        name: 'High Striker',
        pos: { x: -15, y: 0, z: 20 },
        radius: 6,
        actionText: 'Test Strength',
      },
      {
        id: 'roller_coaster',
        name: 'Mega Coaster',
        pos: { x: 25, y: 0, z: 10 },
        radius: 12,
        actionText: 'Boost Roller Coaster',
      },
    ];

    // --- Player Physics & Control Engine ---
    let pitch = 0;
    let yaw = 0;
    const velocity = new THREE.Vector3();
    let isGrounded = false;
    let isFlashlightOn = true;

    const playerHeight = 1.6;
    const gravity = 25.0;
    const moveSpeed = 12.0;
    const jumpForce = 9.0;

    const keysPressed: Record<string, boolean> = {};

    camera.position.set(0, playerHeight, 44); // Spawn in entrance hallway

    // Event Handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed[e.code] = true;

      if (e.code === 'Escape' && isPlaying) {
        onPause();
      }

      // Flashlight Toggle
      if (e.code === keybindings.flashlight.code && isPlaying) {
        isFlashlightOn = !isFlashlightOn;
        flashlight.visible = isFlashlightOn;
        onShowNotification(isFlashlightOn ? '🔦 Flashlight ON' : '🔦 Flashlight OFF');
      }

      // Interact Key
      if (e.code === keybindings.interact.code && isPlaying && !activeMiniGame) {
        if (strikerActive) {
          // Swing High Striker Hammer
          if (strikerMeterRef.current > 80) {
            onUpdateTickets(25);
            speakJeffLine('I-I rang the bell! Got some tickets...', 'scared');
            onShowNotification('🔔 DING DING DING! WON +25 TICKETS!');
          } else {
            speakJeffLine('N-No... not enough power...', 'scared');
            onShowNotification(`🔨 Score: ${Math.floor(strikerMeterRef.current)}! Try again.`);
          }
          setStrikerActive(false);
          return;
        }

        // Find nearby attraction
        const nearby = attractionsList.find((att) => {
          if (att.id === 'toy_hammer' && isHammerPickedUpRef.current) return false;
          const posVec = new THREE.Vector3(att.pos.x, att.pos.y, att.pos.z);
          return camera.position.distanceTo(posVec) < att.radius;
        });

        if (nearby) {
          if (nearby.id === 'toy_hammer') {
            isHammerPickedUpRef.current = true;
            hammerMesh.visible = false;
            onPickupItem('Toy Hammer 🔨');
            onShowNotification('🎒 Picked up Toy Hammer!');
            speakJeffLine('A-A toy hammer...? O-Okay... better than nothing, I guess...', 'scared');

            // Trigger silent teal fork head event on corner
            setTimeout(() => {
              isForkHeadActiveRef.current = true;
              forkHeadMesh.visible = true;
            }, 2000);
          } else if (nearby.id === 'bloody_note') {
            onOpenNote();
            speakJeffLine("A n-note written in blood?! 'Tall teal fork guy'...? Oh God... this is real...", 'scared');
          } else if (nearby.id === 'ferris_wheel') {
            isRidingFerrisWheelRef.current = !isRidingFerrisWheelRef.current;
            if (isRidingFerrisWheelRef.current) {
              speakJeffLine('O-Oh man... I can see the whole creep-y park from up here...', 'scared');
            } else {
              camera.position.set(-32, playerHeight, -10);
            }
          } else if (nearby.id === 'balloon_pop') {
            onOpenBalloonPop();
          } else if (nearby.id === 'high_striker') {
            setStrikerActive(true);
            strikerMeterRef.current = 0;
            strikerDirRef.current = 1;
            onShowNotification(`Press [${keybindings.interact.code.replace('Key', '')}] at top of meter!`);
          } else if (nearby.id === 'roller_coaster') {
            coasterSpeedMult = 3.5;
            onUpdateTickets(5);
            speakJeffLine('J-Jesus! That coaster is moving so fast!', 'scared');
            onShowNotification('🎢 Coaster Boosted! +5 Bonus Tickets!');
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed[e.code] = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement === canvas && isPlaying && !activeMiniGame) {
        const mouseSens = settings.sensitivity * 0.001;
        yaw -= e.movementX * mouseSens;
        pitch -= e.movementY * mouseSens;
        pitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, pitch));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // --- Main Game Render Loop ---
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = () => {
      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Rotate Ferris Wheel
      if (ferrisWheelRingGroup) {
        ferrisWheelRingGroup.rotation.z += delta * 0.3;
        ferrisWheelCartMeshes.forEach((cartGroup) => {
          cartGroup.rotation.z = -ferrisWheelRingGroup.rotation.z;
        });
      }

      // Animate Roller Coaster Cart
      if (coasterCurve && coasterCart) {
        coasterSpeedMult = Math.max(1, coasterSpeedMult - delta * 0.8);
        coasterProgress = (coasterProgress + delta * 0.08 * coasterSpeedMult) % 1;
        const pt = coasterCurve.getPointAt(coasterProgress);
        const tangent = coasterCurve.getTangentAt(coasterProgress);
        coasterCart.position.copy(pt);
        coasterCart.lookAt(pt.clone().add(tangent));
      }

      // High Striker Meter Oscillate
      if (strikerActive) {
        strikerMeterRef.current += strikerDirRef.current * delta * 140;
        if (strikerMeterRef.current >= 100) {
          strikerMeterRef.current = 100;
          strikerDirRef.current = -1;
        } else if (strikerMeterRef.current <= 0) {
          strikerMeterRef.current = 0;
          strikerDirRef.current = 1;
        }
      }

      // Check Proximity to Peeking Teal Fork Head Event
      if (isForkHeadActiveRef.current && !isForkHeadVanishedRef.current) {
        const distToForkHead = camera.position.distanceTo(forkHeadMesh.position);
        if (distToForkHead < 6.5) {
          isForkHeadVanishedRef.current = true;
          forkHeadMesh.visible = false;

          // Light Flicker Effect
          flashlight.intensity = 0.2;
          setTimeout(() => { flashlight.intensity = 4.5; }, 150);
          setTimeout(() => { flashlight.intensity = 0.1; }, 300);
          setTimeout(() => { flashlight.intensity = 4.5; }, 500);

          // Jeff's Terrified Speech
          speakJeffLine("I-It... it vanished! Oh God, that note wasn't lying... it's real!", 'terrified', 4800);
        }
      }

      if (isPlaying && !activeMiniGame) {
        if (isRidingFerrisWheelRef.current && ferrisWheelCartMeshes.length > 0) {
          const firstCart = ferrisWheelCartMeshes[0];
          const cartWorldPos = new THREE.Vector3();
          firstCart.getWorldPosition(cartWorldPos);
          camera.position.copy(cartWorldPos);
        } else {
          camera.rotation.set(0, 0, 0);
          camera.rotation.y = yaw;
          camera.rotation.x = pitch;
          camera.rotation.order = 'YXZ';

          const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
          const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);

          const moveDir = new THREE.Vector3();

          if (keysPressed[keybindings.moveForward.code]) moveDir.add(forward);
          if (keysPressed[keybindings.moveBackward.code]) moveDir.sub(forward);
          if (keysPressed[keybindings.moveLeft.code]) moveDir.sub(right);
          if (keysPressed[keybindings.moveRight.code]) moveDir.add(right);

          moveDir.normalize();

          velocity.x = moveDir.x * moveSpeed;
          velocity.z = moveDir.z * moveSpeed;

          if (keysPressed[keybindings.jump.code] && isGrounded) {
            velocity.y = jumpForce;
            isGrounded = false;
          }

          velocity.y -= gravity * delta;

          camera.position.x += velocity.x * delta;
          camera.position.z += velocity.z * delta;
          camera.position.y += velocity.y * delta;

          if (camera.position.y <= playerHeight) {
            camera.position.y = playerHeight;
            velocity.y = 0;
            isGrounded = true;
          }

          camera.position.x = Math.max(-50, Math.min(50, camera.position.x));
          camera.position.z = Math.max(-50, Math.min(48, camera.position.z));
        }

        // Interaction Proximity Prompt Check
        if (isRidingFerrisWheelRef.current) {
          const keyName = keybindings.interact.code.replace('Key', '');
          onShowPrompt(`Press [${keyName}] to Exit Ride`);
        } else {
          const nearby = attractionsList.find((att) => {
            if (att.id === 'toy_hammer' && isHammerPickedUpRef.current) return false;
            const posVec = new THREE.Vector3(att.pos.x, att.pos.y, att.pos.z);
            return camera.position.distanceTo(posVec) < att.radius;
          });

          if (nearby) {
            const keyName = keybindings.interact.code.replace('Key', '');
            onShowPrompt(`Press [${keyName}] to ${nearby.actionText}`);
          } else {
            onShowPrompt(null);
          }
        }
      } else {
        // Cinematic background camera rotation when in menus
        yaw += delta * 0.08;
        camera.position.set(0, 12, 0);
        camera.rotation.set(-0.2, yaw, 0, 'YXZ');
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [isPlaying, keybindings, settings, activeMiniGame, onPause, onOpenNote, onOpenBalloonPop, onUpdateTickets, onPickupItem, onShowPrompt, onShowNotification, strikerActive]);

  // Request pointer lock when active and not in mini-game
  useEffect(() => {
    if (isPlaying && !activeMiniGame && canvasRef.current) {
      canvasRef.current.requestPointerLock();
    } else if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, [isPlaying, activeMiniGame]);

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
