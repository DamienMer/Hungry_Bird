class Rect{
    constructor(v, w, h){
        this.origin = v;
        Object.defineProperty(this, "width", { value : w, writable : false });
        Object.defineProperty(this, "height", { value : h, writable : false });
    }

    move(v){

        /* attention on ne peut pas modifier this.origin.x ou this.origin.y
         * on s'arrange donc pour modifier this.origin qui n'est pas en read-only
         */
        this.origin = this.origin.add(v);
    }

    mDiff(r){
        let vec = new Vector(r.origin.x - this.origin.x - this.width, r.origin.y - this.origin.y - this.height);
        return new Rect(vec, r.width + this.width, r.height + this.height);
    }

    hasOrigin(){
        if(this.origin.x < 0 && this.origin.x + this.width > 0){
            if(this.origin.y < 0 && this.origin.y + this.height > 0){
                return true;
            }
        }
        return false;
    }
}