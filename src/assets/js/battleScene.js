import { Monster, Sprite } from './classes.js';
import { attacks, audio, battle, monsters } from './data.js';
import { animate } from './map.js';

const battleBackground = new Sprite({
	position: {
		x: 0,
		y: 0,
	},
	image: {
		src: './assets/images/battleBackground.png',
	},
});

let draggle;
let emby;
let renderedSprites;
let queue;
export const initBattle = () => {
	document.querySelector('#userInterface').classList.remove('hidden');
	document.querySelector('#dialogueBox').classList.add('hidden');
	document.querySelector('#enemyHealthBar').classList.remove('w-0');
	document.querySelector('#playerHealthBar').classList.remove('w-0');
	document.querySelector('#attacksBox').replaceChildren();

	draggle = new Monster(monsters.Draggle);
	emby = new Monster(monsters.Emby);
	renderedSprites = [draggle, emby];
	queue = [];

	emby.attacks.forEach((attack) => {
		const button = document.createElement('button');
		button.classList.add('hover:bg-gray-300');
		button.innerHTML = attack.name;
		document.querySelector('#attacksBox').append(button);
	});

	document.querySelectorAll('button').forEach((button) => {
		button.addEventListener('click', (e) => {
			const selectedAttack = attacks[e.currentTarget.innerHTML];

			emby.attack({
				attack: selectedAttack,
				recipient: draggle,
				renderedSprites,
			});

			if (draggle.health <= 0) {
				queue.push(() => draggle.faint());

				queue.push(() => {
					gsap.to('#overlapElement', {
						opacity: 1,
						onComplete: () => {
							cancelAnimationFrame(battleAnimationId);
							animate();

							gsap.to('#overlapElement', {
								opacity: 0,
							});

							document.querySelector('#overlapElement').removeAttribute('style');
							document.querySelector('#enemyHealthBar').removeAttribute('style');
							document.querySelector('#playerHealthBar').removeAttribute('style');
							document.querySelector('#userInterface').classList.add('hidden');
							document.querySelector('#enemyHealthBar').classList.add('w-0');
							document.querySelector('#playerHealthBar').classList.add('w-0');
							document.querySelector('#attackType').classList.remove('text-red-500');
							document.querySelector('#attackType').innerHTML = 'Choose Your<br />Attack Type';
							battle.initiated = false;
							audio.map.play();
						},
					});
				});
			}

			const randomAttack = draggle.attacks[Math.floor(Math.random() * draggle.attacks.length)];

			queue.push(() => {
				draggle.attack({
					attack: randomAttack,
					recipient: emby,
					renderedSprites,
				});

				if (emby.health <= 0) {
					queue.push(() => emby.faint());

					queue.push(() => {
						gsap.to('#overlapElement', {
							opacity: 1,
							onComplete: () => {
								cancelAnimationFrame(battleAnimationId);
								animate();

								gsap.to('#overlapElement', {
									opacity: 0,
								});

								document.querySelector('#overlapElement').removeAttribute('style');
								document.querySelector('#enemyHealthBar').removeAttribute('style');
								document.querySelector('#playerHealthBar').removeAttribute('style');
								document.querySelector('#userInterface').classList.add('hidden');
								document.querySelector('#enemyHealthBar').classList.add('w-0');
								document.querySelector('#playerHealthBar').classList.add('w-0');
								document.querySelector('#attackType').classList.remove('text-red-500');
								document.querySelector('#attackType').innerHTML = 'Choose Your<br />Attack Type';
								battle.initiated = false;
								audio.map.play();
							},
						});
					});
				}
			});
		});

		button.addEventListener('mouseenter', (e) => {
			const selectedAttack = attacks[e.currentTarget.innerHTML];

			document.querySelector('#attackType').innerHTML = selectedAttack.type;

			if (selectedAttack.type === 'Fire') {
				document.querySelector('#attackType').classList.add('text-red-500');
			} else if (selectedAttack.type === 'Normal') {
				document.querySelector('#attackType').classList.remove('text-red-500');
			}
		});

		button.addEventListener('mouseleave', () => {
			document.querySelector('#attackType').classList.remove('text-red-500');
			document.querySelector('#attackType').innerHTML = 'Choose Your<br />Attack Type';
		});
	});
};

let battleAnimationId;
export const animateBattle = () => {
	battleAnimationId = requestAnimationFrame(animateBattle);
	battleBackground.draw();

	renderedSprites.forEach((sprite) => sprite.draw());
};

document.querySelector('#dialogueBox').addEventListener('click', (e) => {
	if (queue.length > 0) {
		queue[0]();
		queue.shift();
	} else {
		e.currentTarget.classList.add('hidden');
	}
});
