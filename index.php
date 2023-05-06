<?php
    session_start();
    $bd = new pdo('mysql:host=localhost;dbname=gestion_immobilier', 'root', '');
    if(isset($_POST['connexion'])){
        if(!empty($_POST['email']) AND !empty($_POST['mdp'])){
            $email = $_POST['email'];
            $mdp = $_POST['mdp'];

            $recupuser = $bd->prepare('SELECT * FROM user where email = ? AND mdp = ?');
            $recupuser->execute(array($email, $mdp));
            if($recupuser->rowCount() > 0){
                $_SESSION['email'] = $email;
                $_SESSION['mdp'] = $mdp;
                header('Location: accueil.php');
                exit;
            }else{
                echo '<script> window.location.href = "index.php";
                     alert ("le mot de passe ou utilisateur invalide")</script>';
            }
        }else{
            echo '<script> window.location.href = "index.php";
            alert("veillez remplir tous les champs svp!")</script>';
        }
    }
?>


<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="./connexion.css">
    <link rel="stylesheet" href="css/bootsrap.min.css">
    <link rel="stylesheet" href="css/all.css">
    <title>Document</title>
</head>
<body>
    <form action="" method="post">
        <h1>Se connecter</h1>
        <div class="media">
            <p><a href=""><i class="fa-brands fa-google"></i></a></p>
            <p><a href=""><i class="fa-brands fa-instagram"></a></i></p>
            <p><a href=""><i class="fa-brands fa-facebook"></i></a></p>
            <p><a href=""><i class="fa-brands fa-twitter"></i></a></p>
        </div>
        <p class="use-email">Ou utiliser mon adresse email:</p>
        <div class="input">
            <input type="email" name="email" placeholder="Email" required>
            <input type="password" name="mdp" placeholder="Mot de passe" required>
        </div>
        <p class="incription">je n'ai pas de <span>compte</span>. je m'en <a href="inscription.php" class="new">crée</a> un.</p>
        <div align="center">
            <button type="submit" name="connexion">Se connecter</button>
        </div>
    </form>
</body>
</html>