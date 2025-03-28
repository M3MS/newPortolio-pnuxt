import gsap from 'gsap'
import SplitText from 'gsap/SplitText';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(SplitText);
gsap.registerPlugin(ScrollTrigger);

export default function textEffect() {
    
    let textSplit = new SplitText('.text-split', {type: "lines, words"});
    let wavyText = textSplit.words;

    wavyText.forEach(word => {

        gsap.from(word, {
            opacity: 0,
            y: 150,
            stagger: 0.5,
            ease: "power3inOut",
            scrollTrigger: {
            trigger: word,
            start: "top 70%"
            }
        })
    });
}