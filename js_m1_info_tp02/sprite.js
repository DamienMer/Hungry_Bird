class Sprite extends Body{
    constructor(v, w, h, m, e, dom, projectile, cible, destructible, pvmax, pv, movable, movement, direction){
        super(v, w, h, m, e, projectile, cible, destructible, pvmax, pv, movable, movement, direction);
        this.display = dom;
    }

    draw(a){
    

        this.display.beginPath();

        //le projectile est en rose
        if(this.projectile){
            this.display.fillStyle = "#e27eeb";
        }

        else if(this.destructible){
            //une cible est en nuances de rouge
            if(this.cible){
                if(this.pv >= this.pvmax * 0.66){
                    this.display.fillStyle = "red";
                }
                else if(this.pv < this.pvmax * 0.66 && this.pv >= this.pvmax * 0.33){
                    this.display.fillStyle = "#bb0000";
                }
                else{
                    this.display.fillStyle = "#770000";
                }
            }
            //un obstacle déstructible est en nuances de gris
            else{
                if(this.pv >= this.pvmax * 0.66){
                    this.display.fillStyle = "#555555";
                }
                else if(this.pv < this.pvmax * 0.66 && this.pv >= this.pvmax * 0.33){
                    this.display.fillStyle = "#777777";
                }
                else{
                    this.display.fillStyle = "#999999";
                }
            }
        }
        //un objet non déstructible
        else{
            //la glase est en bleu
            if(this.e > 0.5){
                this.display.fillStyle = "#9dfbfe";
            }
            //la boue en marron
            else if(this.e < 0.5){
                this.display.fillStyle = "#402b00";
            }
            //le reste en noir
            else{
                this.display.fillStyle = "black";
            }
        }
        

        this.display.rect(this.origin.x, this.origin.y, this.width, this.height);
        this.display.fill();
        this.display.closePath();

    }
}