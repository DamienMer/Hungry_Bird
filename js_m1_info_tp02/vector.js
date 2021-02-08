class Vector {

    constructor (x, y){
        Object.defineProperty(this, "x", { value : x, writable : false });
        Object.defineProperty(this, "y", { value : y, writable : false });
    }

    // static get ZERO(){
    //     return new Vector(0, 0);
    // }

    add(v){
        return new Vector(this.x + v.x, this.y + v.y);
    }

    sub(v){
        return new Vector(this.x - v.x, this.y - v.y);
    }

    mult(k){
        return new Vector(k * this.x, k * this.y);
    }

    dot(v){
        return (v.x * this.x + v.y * this.y);
    }

    norm(){
        return (Math.sqrt(this.x * this.x + this.y * this.y));
    }

    normalize(){
        let a = this.norm();
        return new Vector(this.x / a, this.y / a);
    }

    multX(x){
        return new Vector(this.x * x, this.y);
    }

    setX(x){
        return new Vector(x, this.y);
    }

    multY(y){
        return new Vector(this.x, this.y * y);
    }

}

Vector.ZERO = new Vector(0, 0);