<html>
  
  <head>

    <title>Angry Birds</title>
    <meta charset="UTF-8"></meta>
    <link rel="stylesheet" type="text/css" href="style.css">

  </head>


  <body>

    <?php session_start();?>

    <div id= "gridcolaccueil">
			<p id="shortdescribe">Universite Paris Sud/Orsay<br/>damien.merret@u-psud.fr<br/>Master 1 Informatique</p>
			<img id="wink" src="./ressources/wink.png">
		</div>

    <h1 id="titre">Angry Box</h1>

    <div id="instructions">
      <p>Bienvenue dans Angry Box, </p>
      <p> Le but du jeu est de détruire toutes les cibles en un nombre de tirs minimum. Plusieurs niveaux vont se succéder et la difficulté augmentera au fur et à mesure.</p>

      <form action='jeu.php' method='post'>
          <input type='submit' value="JOUER" id='boutonJouer'>
      </form>

      <?php
        if(isset($_POST["tirs"])){
          $_SESSION["score"] = $_POST["tirs"];
          echo "<p id='ancienScore'>Score précédent : ".$_SESSION["score"]."</p>";
        }
        else{
          echo "<p id='ancienScore'>Score précédent : ...</p>";
        }

        
      ?>

    </div>

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>

  </body>

</html>
