import { animateBattle, initBattle } from './battleScene.js';

import { Boundary, Sprite } from './classes.js';
import { audio, battle, battleZones as battleZonesData, collisions, keys, offset } from './data.js';

const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

const collisionsMap = [];
for (let i = 0; i < collisions.length; i += 70) {
	collisionsMap.push(collisions.slice(i, 70 + i));
}

const boundaries = [];
collisionsMap.forEach((row, i) => {
	row.forEach((symbol, j) => {
		if (symbol === 1025) {
			boundaries.push(
				new Boundary({
					position: {
						x: j * Boundary.width + offset.x,
						y: i * Boundary.height + offset.y,
					},
				})
			);
		}
	});
});

const battleZonesMap = [];
for (let i = 0; i < battleZonesData.length; i += 70) {
	battleZonesMap.push(battleZonesData.slice(i, 70 + i));
}

const battleZones = [];
battleZonesMap.forEach((row, i) => {
	row.forEach((symbol, j) => {
		if (symbol === 1025) {
			battleZones.push(
				new Boundary({
					position: {
						x: j * Boundary.width + offset.x,
						y: i * Boundary.height + offset.y,
					},
				})
			);
		}
	});
});

const playerUpImage = new Image();
playerUpImage.src = './assets/images/playerUp.png';
const playerLeftImage = new Image();
playerLeftImage.src = './assets/images/playerLeft.png';
const playerDownImage = new Image();
playerDownImage.src = './assets/images/playerDown.png';
const playerRightImage = new Image();
playerRightImage.src = './assets/images/playerRight.png';
const player = new Sprite({
	position: {
		x: canvas.width / 2 - 192 / 4 / 2,
		y: canvas.height / 2 - 68 / 2,
	},
	image: playerDownImage,
	frames: {
		max: 4,
		hold: 10,
	},
	sprites: {
		up: playerUpImage,
		left: playerLeftImage,
		down: playerDownImage,
		right: playerRightImage,
	},
});

const background = new Sprite({
	position: {
		x: offset.x,
		y: offset.y,
	},
	image: {
		src: './assets/images/pelletTown.png',
	},
});

const foreground = new Sprite({
	position: {
		x: -303,
		y: -505,
	},
	image: {
		src: './assets/images/foreground.png',
	},
});

const movables = [background, ...boundaries, foreground, ...battleZones];

const rectangularCollision = ({ rectangle1, rectangle2 }) => {
	return (
		rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
		rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
		rectangle1.position.y <= rectangle2.position.y + rectangle2.height &&
		rectangle1.position.y + rectangle1.height >= rectangle2.position.y
	);
};

export const animate = () => {
	const animationId = requestAnimationFrame(animate);
	background.draw();
	boundaries.forEach((boundary) => boundary.draw());
	battleZones.forEach((battleZone) => battleZone.draw());
	player.draw();
	foreground.draw();

	let moving = true;
	player.animate = false;

	if (battle.initiated) return;

	if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
		for (let i = 0; i < battleZones.length; i++) {
			const battleZone = battleZones[i];
			const overlappingArea =
				(Math.min(player.position.x + player.width, battleZone.position.x + battleZone.width) - Math.max(player.position.x, battleZone.position.x)) *
				(Math.min(player.position.y + player.height, battleZone.position.y + battleZone.height) - Math.max(player.position.y, battleZone.position.y));

			if (
				rectangularCollision({
					rectangle1: player,
					rectangle2: battleZone,
				}) &&
				overlappingArea > (player.width * player.height) / 2 &&
				Math.random() < 0.01
			) {
				cancelAnimationFrame(animationId);
				audio.map.stop();
				audio.initBattle.play();
				audio.battle.play();
				battle.initiated = true;

				gsap.to('#overlapElement', {
					opacity: 1,
					yoyo: true,
					repeat: 3,
					duration: 0.4,
					onComplete() {
						gsap.to('#overlapElement', {
							opacity: 1,
							duration: 0.4,
							onComplete() {
								initBattle();
								animateBattle();

								document.querySelector('#overlapElement').removeAttribute('style');
							},
						});
					},
				});
				break;
			}
		}
	}

	if (keys.w.pressed && lastKey === 'w') {
		player.animate = true;
		player.image = player.sprites.up;

		for (let i = 0; i < boundaries.length; i++) {
			const boundary = boundaries[i];

			if (
				rectangularCollision({
					rectangle1: player,
					rectangle2: {
						...boundary,
						position: {
							x: boundary.position.x,
							y: boundary.position.y + 3,
						},
					},
				})
			) {
				moving = false;
				break;
			}
		}

		if (moving) {
			movables.forEach((movable) => (movable.position.y += 3));
		}
	} else if (keys.a.pressed && lastKey === 'a') {
		player.animate = true;
		player.image = player.sprites.left;

		for (let i = 0; i < boundaries.length; i++) {
			const boundary = boundaries[i];

			if (
				rectangularCollision({
					rectangle1: player,
					rectangle2: {
						...boundary,
						position: {
							x: boundary.position.x + 3,
							y: boundary.position.y,
						},
					},
				})
			) {
				moving = false;
				break;
			}
		}

		if (moving) {
			movables.forEach((movable) => (movable.position.x += 3));
		}
	} else if (keys.s.pressed && lastKey === 's') {
		player.animate = true;
		player.image = player.sprites.down;

		for (let i = 0; i < boundaries.length; i++) {
			const boundary = boundaries[i];

			if (
				rectangularCollision({
					rectangle1: player,
					rectangle2: {
						...boundary,
						position: {
							x: boundary.position.x,
							y: boundary.position.y - 3,
						},
					},
				})
			) {
				moving = false;
				break;
			}
		}

		if (moving) {
			movables.forEach((movable) => (movable.position.y -= 3));
		}
	} else if (keys.d.pressed && lastKey === 'd') {
		player.animate = true;
		player.image = player.sprites.right;

		for (let i = 0; i < boundaries.length; i++) {
			const boundary = boundaries[i];

			if (
				rectangularCollision({
					rectangle1: player,
					rectangle2: {
						...boundary,
						position: {
							x: boundary.position.x - 3,
							y: boundary.position.y,
						},
					},
				})
			) {
				moving = false;
				break;
			}
		}

		if (moving) {
			movables.forEach((movable) => (movable.position.x -= 3));
		}
	}
};

let lastKey = '';
let clicked = false;
addEventListener('keydown', (e) => {
	if (!clicked) {
		audio.map.play();
		clicked = true;
	}

	switch (e.key) {
		case 'w':
			keys.w.pressed = true;
			lastKey = 'w';
			break;

		case 'a':
			keys.a.pressed = true;
			lastKey = 'a';
			break;

		case 's':
			keys.s.pressed = true;
			lastKey = 's';
			break;

		case 'd':
			keys.d.pressed = true;
			lastKey = 'd';
			break;
	}
});

addEventListener('keyup', (e) => {
	switch (e.key) {
		case 'w':
			keys.w.pressed = false;
			break;

		case 'a':
			keys.a.pressed = false;
			break;

		case 's':
			keys.s.pressed = false;
			break;

		case 'd':
			keys.d.pressed = false;
			break;
	}
});
