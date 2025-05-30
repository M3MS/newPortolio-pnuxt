<script>
import gsap from 'gsap';

// Linear interpolation
const lerp = (a, b, n) => (1 - n) * a + n * b;

// Gets the mouse position
const getMousePos = e => {
    return { 
        x : e.clientX, 
        y : e.clientY 
    };
};

// Track the mouse position
let mouse = {x: 0, y: 0};

class Cursor {
    constructor(el) {
        this.DOM = {el: el};
        this.DOM.el.style.opacity = 0;
        
        this.bounds = this.DOM.el.getBoundingClientRect();
        
        this.renderedStyles = {
            tx: {previous: 0, current: 0, amt: 0.15},
            ty: {previous: 0, current: 0, amt: 0.15},
            scale: {previous: 1, current: 1, amt: 0.15},
            opacity: {previous: 1, current: 1, amt: 0.1}
        };

        this.onMouseMoveEv = () => {
            this.renderedStyles.tx.previous = this.renderedStyles.tx.current = mouse.x - this.bounds.width/2;
            this.renderedStyles.ty.previous = this.renderedStyles.ty.previous = mouse.y - this.bounds.height/2;
            gsap.to(this.DOM.el, {duration: 0.9, ease: 'Power3.easeOut', opacity: 1});
            requestAnimationFrame(() => this.render());
            window.removeEventListener('mousemove', this.onMouseMoveEv);
        };
        window.addEventListener('mousemove', this.onMouseMoveEv);
    }
    enter() {
        this.renderedStyles['scale'].current = 1.8;
        this.renderedStyles['opacity'].current = 0.8;
    }
    leave() {
        this.renderedStyles['scale'].current = 1;
        this.renderedStyles['opacity'].current = 1;
    }
    render() {
        this.renderedStyles['tx'].current = mouse.x - this.bounds.width/2;
        this.renderedStyles['ty'].current = mouse.y - this.bounds.height/2;

        for (const key in this.renderedStyles ) {
            this.renderedStyles[key].previous = lerp(this.renderedStyles[key].previous, this.renderedStyles[key].current, this.renderedStyles[key].amt);
        }
                    
        this.DOM.el.style.transform = `translateX(${(this.renderedStyles['tx'].previous)}px) translateY(${this.renderedStyles['ty'].previous}px) scale(${this.renderedStyles['scale'].previous})`;
        this.DOM.el.style.opacity = this.renderedStyles['opacity'].previous;

        requestAnimationFrame(() => this.render());
    }
}

export default {

    methods: {
        init() {
            const cursor = new Cursor(document.querySelector('.cursor'));
            
            window.addEventListener('mousemove', ev => mouse = getMousePos(ev));

            [...document.querySelectorAll('a')].forEach(link => {
                link.addEventListener('mouseenter', () => cursor.enter());
                link.addEventListener('mouseleave', () => cursor.leave());
            });
        }
    },

    onMounted() {
        this.init();
    }
    
}
</script>

<template>
    <div>
        <svg class="cursor" width="50" height="50" viewBox="0 0 50 50">
            <circle class="cursor__inner" cx="25" cy="25" r="12.5"/>
        </svg>
    </div>
</template>
<style scoped lang="scss">
.cursor {
	display: none;
}

@media (any-pointer:fine) {
	.cursor {
		position: fixed;
		top: 0;
		left: 0;
		display: block;
		pointer-events: none;
		z-index: 10000;
		mix-blend-mode: exclusion;
	}

	.cursor__inner {
		fill: var(--cursor-fill);
		border: 1px solid var(--cursor-fill);
	}

	.no-js .cursor {
		display: none;
	}

}
</style>