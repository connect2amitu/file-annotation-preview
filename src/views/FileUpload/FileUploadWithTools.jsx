import React from "react";
let Zwibbler = window["Zwibbler"];

export class ZwibblerComponent extends React.Component {
    render() {
        //@ts-ignore
        return (
            <div ref={el => (this.el = el)}
                showtoolbar="false">
                <br />
                <button onClick={() => this.ctx.useBrushTool()}>Brush</button>
                <button onClick={() => this.ctx.useTextTool()}>Text</button>
                <div
                    z-canvas=""
                    style={{ width: "500px", height: "500px", border: "1px solid black" }}
                />
            </div>
        );
    }

    async componentDidMount() {

        const script = document.createElement("script");

        script.src = "https://zwibbler.com/zwibbler-demo.js";
        script.async = true;

        document.body.appendChild(script);

        // HACK FOR STACKBLITZ ONLY
        await waitForZwibblerLoad();
        console.log('Zwibbler.attach(this.el, {}) =>', Zwibbler.attach(this.el, {}));

        console.log('this.el =>', this.el);
        //@ts-ignore
        this.ctx = Zwibbler.attach(this.el, {})?.ctx;
    }

    componentWillUnmount() {
        this.ctx.destroy();
        console.log("Destroying");
    }
}

// HACK for STACKBLIZ ONLY. THIS IS NOT NECESSARY IF YOU INCLUDE
// zwibbler-demo.js in your index.html file or as part of  your project.
function waitForZwibblerLoad() {
    return new Promise(resolve => {
        let interval = setInterval(() => {
            if ("Zwibbler" in window) {
                console.log("Zwibbler loaded.");
                Zwibbler = window["Zwibbler"];
                clearInterval(interval);
                var canvas = document.getElementById("canvas");

                let id = Zwibbler.attach(canvas, {});
                console.log('id =>', id);
                resolve();
                return;
            }
            console.log("Zwibbler not loaded yet.");
        }, 100);
    });
}
