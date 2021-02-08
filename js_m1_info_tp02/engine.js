class Engine {
    constructor () {
        this.bodies = [];
    }

    addBody (b) {
        this.bodies.push(b);
    }
    removeBody (b) {
        let i = this.bodies.findIndex (function (e) { return e == b; });
        if (i >= 0)
        this.bodies.splice(i, 1);
    }
    update (dt) {

        for (let i = 0; i < this.bodies.length; i ++) {

            let body = this.bodies[i];

            // On regarde si avec une telle vitesse il peut y avoir collision avec les autres objets.
            for (let j = i+1; j < this.bodies.length; j++) {

                let otherBody = this.bodies[j];

                let res = body.collision(otherBody);

                if (res != null) {
                    // mise à jour des vitesses
                    body.velocity = res.velocity1;
                    otherBody.velocity = res.velocity2;

                };
            };
            
            //si on l'objet et movable en x
            if(body.movable[0]){
                if(body.origin.x <= body.movement[0]){
                    body.direction[0] = 1;
                }
                else if(body.origin.x >= body.movement[2] - body.width){
                    body.direction[0] = -1;
                }
                body.move(new Vector(body.direction[0], 0));
            }

            //si on l'objet et movable en y
            if(body.movable[1]){
                if(body.origin.y <= body.movement[1]){
                    body.direction[1] = 1;
                }
                else if(body.origin.y >= body.movement[3] - body.height){
                    body.direction[1] = -1;
                }
                body.move(new Vector(0, body.direction[1]));
            }


            /* begin extra */
            if (Number.isFinite(body.mass)){
                body.force = body.force.add(Constants.gravity.mult(body.mass));
            }

            /* end extra */

            // On calcule la nouvelle accéleration :
            let a = body.force.mult(body.invMass);

            body.force = Vector.ZERO;
            let delta_v = a.mult(dt);
            body.velocity = body.velocity.add(delta_v);

            //frottements
            body.velocity = body.velocity.multX(Constants.airFrictionX);
            body.velocity = body.velocity.multY(Constants.airFrictionY);


            // On met à jour la position.
            body.move(body.velocity.mult(dt));
            
            //on enlève les structures ou cibles qui n'ont pas survécus
            clearResidus();

            //on vérifie s'il reste des cibles en vie
            checkVictoire();
        }
    }
}
