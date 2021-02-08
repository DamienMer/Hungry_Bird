class Body extends Rect{
    constructor(v, w, h, m, e, projectile, cible, destructible, pvmax, pv, movable, movement, direction){
        super(v, w, h);
        this.mass = m;
        this.e = e;
        this.invMass = 1 / this.mass;
        this.velocity = Vector.ZERO;
        this.force = Vector.ZERO;
        
        this.projectile = projectile;
        this.cible = cible;

        this.destructible = destructible;
        Object.defineProperty(this, "pvmax", { value : pvmax, writable : false });
        this.pv = pv;

        this.movable = movable;
        this.movement = movement;
        this.direction = direction;
    }

    collision(b){
        let minko = this.mDiff(b);
        
        //s'il y a collision entre this et b
        if(minko.hasOrigin()){
            let vectors = [new Vector(minko.origin.x, 0),
            new Vector(0, minko.origin.y + minko.height), 
            new Vector(minko.origin.x + minko.width, 0), 
            new Vector(0, minko.origin.y)];
            
            let n = vectors[0];

            for(let i = 1; i < vectors.length; i++){
                if(vectors[i].norm() < n.norm()){
                    n = vectors[i];
                }
            }


            // let norm_v = this.velocity.norm();
            // let norm_vb = b.velocity.norm();

            // let nc = norm_v / (norm_v + norm_vb);
            // let nb = norm_vb / (norm_v + norm_vb);


            let nc = this.velocity.norm() / (this.velocity.norm() + b.velocity.norm());
            let nb = b.velocity.norm() / (b.velocity.norm() + this.velocity.norm());
            
            if(this.velocity.norm() == 0 && b.velocity.norm() == 0){

                //si les deux masses des sprites en collision sont Infinity, on ne fait rien
                if(b.mass == Infinity && this.mass == Infinity){
                    return null;
                }
                //si masse de b supérieur à masse de this
                else if(b.mass > this.mass){
                    nc = 1;
                }
                else if(b.mass < this.mass){
                    nb = 1;
                }
            }
        
            //on déplace les deux sprites de manière à ce qu'ils ne soient plus l'un dans l'autre
            this.move(n.mult(nc));
            b.move(n.mult(-nb));

            
            n = n.normalize();

            let v = this.velocity.sub(b.velocity);
            let e = Constants.elasticity;
            let j = (-(1 + b.e) * v.dot(n)) / (this.invMass + b.invMass);

            let vc = this.velocity.add(n.mult(j * this.invMass));
            let vb = b.velocity.sub(n.mult(j * b.invMass));

            //force de frottements, pour réduire la vitesse en continue
            vc = vc.multX(0.95);
            vb = vb.multX(0.95);

            if(vc.norm() < 0.02){
                vc = vc.multX(0);
            }
            if(vb.norm() < 0.02){
                vb = vb.multX(0);
            }

            
            /* PARTIE REDUCTION DE PV */
            //les points de vie peuvent être retiré que en phase_jeu == 1 ou 2

            //puissance max du choc
            let maxChoc = 2;
            //puissance min
            let minChoc = 0.6;
            //on met les dégats max à 3
            let degatMax = 3;

            //on additionne les chocs
            let choc = (this.velocity.add(b.velocity.mult(-1))).norm();
            if(choc >= maxChoc){
                //on limite à maxchoc
                choc = maxChoc;
            }

            //on calcul les dégats en fonction du choc
            let degat = choc / maxChoc * degatMax;
          
            if(phase_jeu != 0){
                if(choc >= minChoc){
                    if(this.destructible){

                        this.display.beginPath();
                        this.display.fillStyle = "red";
                        this.display.rect(this.origin.x, this.origin.y, this.width, this.height);
                        this.display.fill();
                        this.display.closePath();
                        //on applique les dégats
                        this.pv -= degat;
                        console.log(this.pv);

                    }
                    if(b.destructible){
                        b.display.beginPath();
                        b.display.fillStyle = "red";
                        b.display.rect(this.origin.x, this.origin.y, this.width, this.height);
                        b.display.fill();
                        b.display.closePath();
                        //on applique les dégats
                        b.pv -= degat;
                        console.log(b.pv);

                    }
                }
            }
            

            return { velocity1 : vc, velocity2 : vb};

        }
        else{
            return null;
        }
    }
}