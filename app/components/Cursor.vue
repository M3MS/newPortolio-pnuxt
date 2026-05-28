<script setup>
import gsap from 'gsap'

// Linear interpolation
const lerp = (a, b, n) => (1 - n) * a + n * b

// Gets mouse position
const getMousePos = (e) => ({
  x: e.clientX,
  y: e.clientY
})

let mouse = { x: 0, y: 0 }

const cursorRef = ref(null)

let mouseMoveHandler = null
let cursorInstance = null

class Cursor {
  constructor(el) {
    this.DOM = { el }
    this.DOM.el.style.opacity = 0

    this.bounds = this.DOM.el.getBoundingClientRect()

    this.renderedStyles = {
      tx: { previous: 0, current: 0, amt: 0.15 },
      ty: { previous: 0, current: 0, amt: 0.15 },
      scale: { previous: 1, current: 1, amt: 0.15 },
      opacity: { previous: 1, current: 1, amt: 0.1 }
    }

    this.onMouseMoveEv = () => {
      this.renderedStyles.tx.previous =
          this.renderedStyles.tx.current =
              mouse.x - this.bounds.width / 2

      this.renderedStyles.ty.previous =
          this.renderedStyles.ty.current =
              mouse.y - this.bounds.height / 2

      gsap.to(this.DOM.el, {
        duration: 0.9,
        ease: 'power3.out',
        opacity: 1
      })

      requestAnimationFrame(() => this.render())

      window.removeEventListener('mousemove', this.onMouseMoveEv)
    }

    window.addEventListener('mousemove', this.onMouseMoveEv)
  }

  enter() {
    this.renderedStyles.scale.current = 1.8
    this.renderedStyles.opacity.current = 0.8
  }

  leave() {
    this.renderedStyles.scale.current = 1
    this.renderedStyles.opacity.current = 1
  }

  render() {
    this.renderedStyles.tx.current =
        mouse.x - this.bounds.width / 2

    this.renderedStyles.ty.current =
        mouse.y - this.bounds.height / 2

    for (const key in this.renderedStyles) {
      this.renderedStyles[key].previous = lerp(
          this.renderedStyles[key].previous,
          this.renderedStyles[key].current,
          this.renderedStyles[key].amt
      )
    }

    this.DOM.el.style.transform = `
      translateX(${this.renderedStyles.tx.previous}px)
      translateY(${this.renderedStyles.ty.previous}px)
      scale(${this.renderedStyles.scale.previous})
    `

    this.DOM.el.style.opacity =
        this.renderedStyles.opacity.previous

    requestAnimationFrame(() => this.render())
  }
}

onMounted(() => {
  if (!cursorRef.value) return

  cursorInstance = new Cursor(cursorRef.value)

  mouseMoveHandler = (ev) => {
    mouse = getMousePos(ev)
  }

  window.addEventListener('mousemove', mouseMoveHandler)

  document.querySelectorAll('a').forEach((link) => {
    link.addEventListener('mouseenter', () => cursorInstance.enter())
    link.addEventListener('mouseleave', () => cursorInstance.leave())
  })
})

onBeforeUnmount(() => {
  if (mouseMoveHandler) {
    window.removeEventListener('mousemove', mouseMoveHandler)
  }
})
</script>
<template>
    <svg ref="cursorRef" class="cursor" width="50" height="50" viewBox="0 0 50 50">
        <circle class="cursor__inner" cx="25" cy="25" r="12.5"/>
    </svg>
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