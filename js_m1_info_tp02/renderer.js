class Renderer {
    constructor (e) {
        this.engine = e;
    }

    update (dt) {
        //recalcul toutes les positions ainsi que les accélérations
        this.engine.update(dt);
        this.engine.bodies.forEach(function (b) {
            b.draw(false);
        });
    }
}
