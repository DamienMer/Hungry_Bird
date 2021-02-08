<html>
  
  <head>

    <title>Angry Birds</title>
    <meta charset="UTF-8"></meta>
    <link rel="stylesheet" type="text/css" href="style.css">

  </head>


  <body>

    <div id="gridcol">
      <div class="bulle">
        <h2>Informations</h2>
        <p id="FPS">FPS : 0</p>
        <p id="tirs">Tirs : 0</p>
        <p id="niveau">Niveau : 0 / 0</p>
        <h2>Commandes Clavier</h2>
        <p> p : pause/unpause<br/></p>
        <p id="charge">c : charge : 0</p>
        <p id="seisme">s : seisme : 0</p>
        <!-- <p id="niveau">Niveau : 0 / 0</p> -->

      </div>
      
      <div>
        <canvas id="myCanvas" width="1200" height="600" style="border:1px solid #c55252;"></canvas>
      </div>
    </div>
    

    	<!-- inclure les  autres fichier ici -->
      <script type="text/javascript" src="vector.js"></script>
      <script type="text/javascript" src="constants.js"></script>
      <script type="text/javascript" src="rect.js"></script>
      <script type="text/javascript" src="engine.js" ></script>
      <script type="text/javascript" src="renderer.js" ></script>
      <script type="text/javascript" src="body.js" ></script>
      <script type="text/javascript" src="sprite.js" ></script>
      <script type="text/javascript" src="main.js" ></script>

      <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>

  </body>

</html>
