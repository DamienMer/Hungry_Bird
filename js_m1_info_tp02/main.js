let can = document.getElementById("myCanvas");
let ctx = can.getContext("2d");

//compteur du nombre de tirs effectués
let tirs = 0;

//contient le nombre de fps
let fps = 0;

let engine;
let rendered;

//passe dans le json
let pause = false;

//contient la coordonnée de la souris en x
let mx;
//contient la coordonnée de la souris en y
let my;

//true si l'user a le clic enfoncé
let mouse;

//contient l'interval
let interval;

//contient l'objet regroupant tous les niveaux
let lvl_json;

//numéros du niveau qui est actuellement joué
let niveau = 0;

//phase_jeu entre 0 et 3 (0 : génération des objets, 1 : armer le tir, 2 : tir, 3 : voyage)
let phase_jeu = 0;

//contient le projectile (permet d'y accéder plus facilemenet qu'en faisant un for sur l'engine)
let bird;

// vector contenant le point d'origine des tirs
let oriShoot;

// puissance du tir (de 0 à 100)
let puissance = 0;

/* POUVOIR POUR CHAQUE NIVEAU */
//compteur du nombre de charges que l'utilisateur peut déclencher
let charge = 0;
//compteur du nombre de séismes que l'utilisateur peut déclencher
let seisme = 0;

//initialisation du parcour
async function initialisation(){
    //on récupère le json contenant tous les niveaux
    await recupJson();
    try{
        //on créer le niveau en commençant par le premier du parcours
        createLevel();
    }catch(e){console.log("Erreur avec la récupération du JSon")}
}


//création du niveau
async function createLevel(){

    //initialisation de l'engine et du render
    engine = new Engine();
    rendered = new Renderer(engine);

    //initialise phase_jeu à 0 en attendant que les obstacles se génèrent
    phase_jeu = 0;
    fps = 0;
    pause = false;

    //on récupère le point initial des tirs
    oriShoot = new Vector(lvl_json[niveau].origine[0], lvl_json[niveau].origine[1]);

    //variable pour les murs du canva
    let taille = 100;
    let visible = 20;

    //mur haut
    let wall1 = new Sprite( new Vector(-taille, -taille), 2 * taille + 1200, taille + visible, Infinity, 0.5,
                            can.getContext("2d"), false, false, false, 1000, 1000,
                            [false, false], [0, 0, 0, 0], [true, true]);
    //mur bas
    let wall2 = new Sprite( new Vector(-taille, 600 - visible), 2 * taille + 1200, taille, Infinity, 0.5,
                            can.getContext("2d"), false, false, false, 1000, 1000,
                            [false, false], [0, 0, 0, 0], [true, true]);
    //mur gauche
    let wall3 = new Sprite( new Vector(-taille, visible), taille + visible, 600 - visible, Infinity, 0.5,
                            can.getContext("2d"), false, false, false, 1000, 1000,
                            [false, false], [0, 0, 0, 0], [true, true]);
    //mur droite
    let wall4 = new Sprite( new Vector(1200 - visible, visible), taille + visible, 600 - visible, Infinity, 0.5,
                            can.getContext("2d"), false, false, false, 1000, 1000,
                            [false, false], [0, 0, 0, 0], [true, true]);


    //créer le projectile
    bird = new Sprite(      new Vector(lvl_json[niveau].origine[0], lvl_json[niveau].origine[1]), 30, 30, Infinity, 0.5, 
                            can.getContext("2d"), true, false, false, 1000, 1000,
                            [false, false], [0, 0, 0, 0], [true, true]);



    //ajouter les 4 murs au moteur
    engine.addBody(wall1);
    engine.addBody(wall2);
    engine.addBody(wall3);
    engine.addBody(wall4);

    //ajout du projectile au moteur
    engine.addBody(bird);



    /*
     *  CHARGEMENT DES DONNEES DES NIVEAUX
     */
    
    //chargement des obstacles
    lvl_json[niveau].obstacles.forEach(element => {
        engine.addBody( new Sprite(new Vector(element.x, element.y), element.width, element.height, element.masse, 0.5, 
                        can.getContext("2d"), false, false, element.destructible, element.pvmax, element.pv,
                        [false, false], [0, 0, 0, 0], [true, true]));
    });

    //chargement des cibles
    lvl_json[niveau].cibles.forEach(element => {
        engine.addBody( new Sprite(new Vector(element.x, element.y), element.width, element.height, element.masse, 0.5,
                        can.getContext("2d"), false, true, true, element.pvmax, element.pv,
                        [false, false], [0, 0, 0, 0], [true, true]));
    });

    //chargement des murs mobiles
    lvl_json[niveau].murs.forEach(element => {
        engine.addBody( new Sprite(new Vector(element.x, element.y), element.width, element.height, Infinity, element.elasticite, 
                        can.getContext("2d"), false, false, false, 1000, 1000,
                        element.movableXY, [element.mouvement[0], element.mouvement[1], element.mouvement[2], element.mouvement[3]], element.directionDroiteBas));
    });

    //trie de engine.bodies en fonction de la masse croissante des bodies (en particulier pour mettre les objets de masse infinie à la fin)
    trie();

    //lance l'interval pour les updates
    setUpInterval();

    //passe à la phase 1 au bout de 1.2 secondes. En phase 1 on peut armer son tire et tirer. Les objets destrctibles peuvent maintenant être brisés.
    changePhase(1200, 1);

    //règle l'affichage dans la partie "Informations"
    setNiveaux();

    //on donne des coups spéciaux à l'utilisateur. On met à jour la partie "Commande Clavier"
    charge = 2;
    document.getElementById("charge").innerHTML = '<p id="charge">c : charge : '+charge+'</p>';
    seisme = 1;
    document.getElementById("seisme").innerHTML = '<p id="seisme">s : seisme : '+seisme+'</p>';

}

//affiche et actualise les fps
let print_fps;
//créer un interval afin d'actualiser les fps toutes les secondes
print_fps = setInterval(() => {
    document.getElementById("FPS").innerHTML = '<p id="FPS">FPS : '+fps+'</p>';
    fps = 0;
}, 1000);


//met à jour les tirs dans la partie "Informations"
function setTirs(){
    tirs++;
    document.getElementById("tirs").innerHTML = '<p id="tirs">Tirs : '+tirs+'</p>';
}

//met à jour les niveaux dans la partie "Informations"
function setNiveaux(){
    let numNiveau = niveau + 1;
    document.getElementById("niveau").innerHTML = '<p id="niveau">Niveau : '+numNiveau+'/'+lvl_json.length+'</p>';
}


//récupère les données relatives au Json pour les niveaux
async function recupJson(){
    
    let ajax = function(){
        return new Promise((resolve) => {
            let pr = new XMLHttpRequest();

            // Dès que le json est chargé.
            pr.onloadend = function(){

                // Si json n'existe pas.
                if (pr.status == 404) {
                    resolve({ recup: false });
                    return;
                }

                // Pas d'erreur, on return le json.
                resolve(pr.response);
            }

            // On donne l'url dujson.
            pr.open("get", "parcours1.json", true);

            // Type du fichier : json.
            pr.responseType = "json";

            // On recherche le json.
            pr.send();

        });
    }
    lvl_json = await ajax();
}

//fonction utilisé pour le débugage
function clearEngine(){
    for(let i = 0; i < engine.bodies.length; i++){
        if(engine.bodies[i].mass != Infinity){
            engine.removeBody(engine.bodies[i]);
            i--;
        }
    }
}

//fonction utilisé pour le débugage
function clearProjectile(){
    for(let i = 0; i < engine.bodies.length; i++){
        if(engine.bodies[i].projectile == true){
            engine.removeBody(engine.bodies[i]);
            i--;
        }
    }
    return;
}


//efface puis remet le projectile à sa place
function resetProjectile(){
    if(phase_jeu != 3){
        return;
    }

    //on cherche le projectile et on le détruit
    for(let i = 0; i < engine.bodies.length; i++){
        if(engine.bodies[i].projectile == true){
            engine.removeBody(engine.bodies[i]);
            i--;
        }
    }

    //recréer le projectile
    bird = new Sprite(  new Vector(oriShoot.x, oriShoot.y), 30, 30, Infinity, 0.5, 
                        can.getContext("2d"), true, false, false, 1000, 1000,
                        [false, false], [0, 0, 0, 0], [true, true]);

    //on l'ajoute à l'engine
    engine.addBody(bird);

    //on repasse phase_jeu à 1 (pour pouvoir réarmer le tir)
    phase_jeu = 1;

    return;
}


//fonction utilisé pour le débugage
function clearCibles(){
    for(let i = 0; i < engine.bodies.length; i++){
        if(engine.bodies[i].cible == true){
            engine.removeBody(engine.bodies[i]);
            i--;
        }
    }
    return;
}


//élimine les obstacles ou cibles qui n'ont plus de PV
function clearResidus(){
    for(let i = 0; i < engine.bodies.length; i++){
        if(engine.bodies[i].pv <= 0){
            engine.removeBody(engine.bodies[i]);
            i--;
        }
    }
    return;
}


//vérifie s'il y a encore des cibles vivantes, si oui il ne se passe à rien, sinon on passe au niveau suivant ou on termine le parcours s'il n'y en a plus
function checkVictoire(){
    let flag = true;
    //on vérifie s'il y a encore des cibles en vie
    for(let i = 0; i < engine.bodies.length; i++){
        if(engine.bodies[i].cible){
            flag = false;
            return;
        }
    }


    if(flag){
        clearInterval(interval);
        //il y a encore des niveaux, on charge le prochain
        if(niveau + 1 < lvl_json.length){
            niveau ++;
            setNiveaux();
            createLevel();
        }
        //victoire on revient à l'écran d'accueil et le score doit se sauvegarder (ne fonctionne pas)
        else{
            console.log("Victoire");
            jQuery.post({
                url: "index.php",
                async: false,
                dataType: "text",
                data: {"tirs": tirs},
            })
            window.location="index.php";
        }
    }

    return flag;
}


//affiche la ligne de visée
function aim(){
    let r = 100;
    ctx.beginPath();

    //on cherche l'angle entre le point de visé et la souris
    let angle = Math.atan((my - oriShoot.y) / (mx - oriShoot.x));
    if(mx < oriShoot.x){
        angle += Math.PI;
    }

    let myPosition = new Vector(mx, my);
    let res = myPosition.sub(oriShoot);

    ctx.moveTo(oriShoot.x + bird.width/2, oriShoot.y + bird.height / 2);

    //si la souris n'est pas dans un cercle de rayon r, alors on met la ligne de visée et le projectile à r
    if(res.norm() > r){
        puissance = r;
        ctx.lineTo( Math.cos(angle) * r + oriShoot.x + bird.width / 2,
                    Math.sin(angle) * r + oriShoot.y + bird.height / 2);
        bird.origin = new Vector(Math.cos(angle) * r + oriShoot.x, Math.sin(angle) * r + oriShoot.y);
    }
    //si la souris se trouve dans le cercle de rayon r, on met la ligne de visée et le projectile aux coordonnées de la souris
    else{
        puissance = res.norm();
        ctx.lineTo( Math.cos(angle) * res.norm() + oriShoot.x + bird.width / 2,
                    Math.sin(angle) * res.norm() + oriShoot.y + bird.height / 2);
        bird.origin = new Vector(mx, my);
    }

    //on trace
    ctx.stroke();
    ctx.closePath();
}

//fonction qui gère l'interval
function setUpInterval(){
    interval = setInterval(function(){
        try{
            //on incrémente les fps dès que la fonction est appelée
            fps++;

            //on efface le contenu du canvas
            ctx.clearRect(0, 0, 1200, 600);

            //on supprime les évènement de souris dans certain cas
            if(pause || phase_jeu == 0 || phase_jeu == 2){
                can.removeEventListener("mousedown", detectionMouseDown);
                can.removeEventListener("mousemove", detectionMouseMove);
                can.removeEventListener("mouseup", detectionMouseUp);
            }
            //on laisse à l'utilisateur le mouseUP pour pouvoir faire revenir le projectile à sa position initiale
            else if(phase_jeu == 3){
                can.addEventListener("mouseup", detectionMouseUp);
            }
            else{
                can.addEventListener("mousedown", detectionMouseDown)
            }

            //si le clic souris est enfoncé, on appelle aim (permet de viser)
            if(mouse){
                aim();
            }

            //on met à jour le render et l'engine
            rendered.update(1000/80);

        }catch(e){
            clearInterval(interval);
            throw(e);
        }
    }, 1000/80);
}


//fonction pour le tir (lorsque mouseUP)
function shoot(ev){
        if(phase_jeu != 1) return;

        //recherche de l'angle
        let x = ev.offsetX;
        let y = ev.offsetY;
        
        //donne l'origine
        let dx = x - oriShoot.x;
        let dy = y - oriShoot.y;

        //on récupère l'angle de tir
        let angle = Math.atan(dy / dx);
        if(x < oriShoot.x){
            angle += Math.PI;
        }

        //on passe la masse du projectile à l'infini
        bird.mass = 10;
        bird.invMass = 1/bird.mass;

        //on lance le projectile dans la direction voulue
        bird.force = new Vector(Math.cos(angle) * -0.2 * (puissance /100) * bird.mass,
                                Math.sin(angle) * -0.2 * (puissance /100) * bird.mass);

        //on incrémente les tirs
        setTirs();

        //on trie pour remettre les objets les plus lourds à la fin
        trie();

        return;
}


//changement de phase au bout de ms
async function changePhase(ms, phase){
    //on attend un temps ms
    await sleep(ms)
    console.log("Changement de phase de jeu");
    console.log(phase);
    //on change la phase de jeu
    phase_jeu = phase;
}


//permet de ne rien faire pendant ms
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


//trie engine.bodies fonction de la mass des bodies (croissant)
function trie(){
    engine.bodies.sort((a, b) => a.mass - b.mass);
    return;
}







/* PARTIE DETECTION CONTROLEUR */

//event lorsque mousedown
function detectionMouseDown(ev){
    //on empeche l'utilisateur de faire mouse down dans les situations suivantes
    if(pause || phase_jeu == 0 || phase_jeu == 2 || phase_jeu == 3){
        return;
    }

    //on débloque mousemove et mouseup
    can.addEventListener("mousemove", detectionMouseMove);
    can.addEventListener("mouseup", detectionMouseUp);

    //on précise que l'utilisateur a le clic enfoncé
    mouse = true;

    //on met à jour les positions de la souris
    mx = ev.offsetX;
    my = ev.offsetY;

    return;
}


function detectionMouseMove(ev){
    if(pause || phase_jeu == 0 || phase_jeu == 2 || phase_jeu == 3){
        return;
    }
    mx = ev.offsetX;
    my = ev.offsetY;

    return;
}


function detectionMouseUp(ev){

    if(pause || phase_jeu == 0 || phase_jeu == 2){
        return;
    }

    //si en phase_jeu 3, on reset la position du projectile
    if(phase_jeu == 3){
        resetProjectile();
        can.removeEventListener("mouseup", detectionMouseUp);
    }
    //sinon on tir
    else{
        mouse = false;
        shoot(ev);
        phase_jeu = 2;

        //on attend 1 seconde avant de lancer la phase 3 (phase 3, le joueur peut reset le projectile)
        changePhase(1000, 3);
        bird.mass = 10;
    }

    return;
}


function DetectionKeyboard(ev){
    switch (ev.keyCode) {
        case 80: /* p pause */
            if(pause){
                setUpInterval();
                pause = false;
            }
            else{
                clearInterval(interval);
                pause = true;
            }
            break;

        case 83: /* s */
            if(!pause){
                commandeSeisme();
            }
            break;

        case 67: /* c */
            if(!pause){
                commandeCharge();
            }
            break;



        default:
            console.log("unknown key");
    }
}

//lorsque l'utilisateur déclenche un seisme
function commandeSeisme(){
    if(seisme > 0 && (phase_jeu == 2 || phase_jeu == 3)){
        bird.velocity = bird.velocity.multX(0);
        bird.velocity = bird.velocity.add(new Vector(0, 2));
        seisme --;
        document.getElementById("seisme").innerHTML = '<p id="seisme">s : seisme : '+seisme+'</p>';

    }
    return;
}


function commandeCharge(){
    if(charge > 0 && (phase_jeu == 2 || phase_jeu == 3)){
        bird.velocity = bird.velocity.normalize();
        bird.velocity = bird.velocity.mult(2);
        charge --;
        document.getElementById("charge").innerHTML = '<p id="charge">c : charge : '+charge+'</p>';
    }
    return;
}


//fonction utilisé pour le débugage
function funtest(){
    return;
}


window.addEventListener("keydown", DetectionKeyboard);
window.addEventListener("load", initialisation);
