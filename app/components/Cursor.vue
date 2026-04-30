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
        this.animationId = null; // Track animation frame
        this.isAnimating = false; // Prevent multiple loops
        
        this.renderedStyles = {
            tx: {previous: 0, current: 0, amt: 0.15},
            ty: {previous: 0, current: 0, amt: 0.15},
            scale: {previous: 1, current: 1, amt: 0.15},
            opacity: {previous: 1, current: 1, amt: 0.1}
        };

        this.onMouseMoveEv = () => {
            this.renderedStyles.tx.previous = this.renderedStyles.tx.current = mouse.x - this.bounds.width/2;
            this.renderedStyles.ty.previous = this.renderedStyles.ty.current = mouse.y - this.bounds.height/2;
            gsap.to(this.DOM.el, {duration: 0.9, ease: 'power3.out', opacity: 1});
            this.startAnimation(); // Start controlled animation
            window.removeEventListener('mousemove', this.onMouseMoveEv);
        };
        window.addEventListener('mousemove', this.onMouseMoveEv);
    }

    startAnimation() {
        if (this.isAnimating) return; // Prevent multiple loops
        this.isAnimating = true;
        this.render();
    }

    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.isAnimating = false;
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
        if (!this.isAnimating) return;

        this.renderedStyles['tx'].current = mouse.x - this.bounds.width/2;
        this.renderedStyles['ty'].current = mouse.y - this.bounds.height/2;

        let hasChanged = false;
        
        for (const key in this.renderedStyles) {
            const style = this.renderedStyles[key];
            const prev = style.previous;
            style.previous = lerp(style.previous, style.current, style.amt);
            
            // Check if there's significant change
            if (Math.abs(prev - style.previous) > 0.01) {
                hasChanged = true;
            }
        }
                    
        this.DOM.el.style.transform = `translateX(${this.renderedStyles['tx'].previous}px) translateY(${this.renderedStyles['ty'].previous}px) scale(${this.renderedStyles['scale'].previous})`;
        this.DOM.el.style.opacity = this.renderedStyles['opacity'].previous;

        // Only continue animation if there are significant changes
        if (hasChanged) {
            this.animationId = requestAnimationFrame(() => this.render());
        } else {
            this.isAnimating = false;
        }
    }

    destroy() {
        this.stopAnimation();
        window.removeEventListener('mousemove', this.onMouseMoveEv);
    }
}

export default {
    data() {
        return {
            cursor: null
        };
    },

    methods: {
        init() {
            this.cursor = new Cursor(document.querySelector('.cursor'));
            
            // Throttle mouse move events
            let mouseMoveTimeout;
            window.addEventListener('mousemove', ev => {
                clearTimeout(mouseMoveTimeout);
                mouseMoveTimeout = setTimeout(() => {
                    mouse = getMousePos(ev);
                }, 16); // ~60fps
            });

            [...document.querySelectorAll('a')].forEach(link => {
                link.addEventListener('mouseenter', () => this.cursor.enter());
                link.addEventListener('mouseleave', () => this.cursor.leave());
            });
        }
    },

    mounted() {
        this.init();
    },

    beforeUnmount() {
        if (this.cursor) {
            this.cursor.destroy();
        }
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
        display: block;
		position: fixed;
		top: 0;
		left: 0;
		pointer-events: none;
		z-index: 10000;
		mix-blend-mode: exclusion;
	}

	.cursor__inner {
		fill: $red;
		border: 1px solid $red;
	}

	.no-js .cursor {
		display: none;
	}

}
</style>