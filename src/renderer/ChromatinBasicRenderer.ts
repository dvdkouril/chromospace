export class ChromatinBasicRenderer {
    canvasElement: HTMLCanvasElement | null;

    constructor(canvas: HTMLCanvasElement | null = null) {
        this.canvasElement = canvas;
        
        if (canvas == null) {
            this.canvasElement = document.createElement('canvas');
        }

        this.render = this.render.bind(this);
    }

    startDrawing() {
        requestAnimationFrame(this.render);
    }

    render() {
        requestAnimationFrame(this.render);

        console.log("drawing");

        // threeRenderer.render();
    }
};
