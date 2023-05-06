<?php
session_start();
$pdo = new pdo('mysql:host=localhost;dbname=gestion_immobilier', 'root','');
if(!empty($_POST)){
    extract($_POST);
    $valid = true;

    if(isset($_POST['inscription'])){
        $nom = $_POST['nom'];
        $prenom = $_POST['prenom'];
        $contact = $_POST['contact'];
        $email = $_POST['email'];
        $mdp = $_POST['mdp'];
        $vmdp = $_POST['vmdp'];

        // verification du nom
        if(empty($nom)){
            $valid = false;
        }
        // verification du prenom
        if(empty($prenom)){
            $valid = false;
        }
        // verification du contact
        if(empty($contact)){
            $valid = false;
        }
        // verification du mail
        if(empty($email)){
            $valid = false;
            // verification du est dans le bon format
        }elseif(!preg_match("/^[a-z0-9\-_.]+@[a-z]+\.[a-z]{2,3}$/i",$email)){
            $valid = false;

        }else{
            // on verifie que le mail est disponible
            $er_email = $bd->prepare('SELECT email FROM user where email = ?');
            $er_email->execute(array($email));
            $er_email = $er_email->fetch();

            if($er_email['email'] <> ""){
                $valid = false;
                $er_email = ("Ce mail exist deja");
            }
        }
        // verification du mot de passe
        if(empty($mdp)){
            $valid = false;
            // $er_mdp = ("le mot de passe ne peut pas etre vide");
        }else($mdp != $vmdp){
            $valid = false;
            $er_mdp = ("le mot de passe de confirmation est incorrect");
        }
    }
    // si toutes conditions sont sont remplies alors on fait le traitement
    if($valid){
        $insertuser = $bd->prepare('INSERT INTO user(nom, prenom, contact, email, mdp) VALUES(?, ?, ?, ?, ?)');
        $insertuser->execute(array($nom, $prenom, $contact, $email, $mdp));

        $recupuser = $bd->prepare('SELECT * FROM user where email = ? AND mdp = ?');
        $recupuser->execute($email, $mdp);
        if($recupuser->rowCount() > 0){
            $_SESSION['email'] = $email;
            $_SESSION['mdp'] = $mdp;

            // echo $_SESSION['email'];
            header('location: acceuil.php');
            exit;
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="Inscription.css">
</head>
<body>
    <form action="" method="post">
    <fieldset class="fie">
        <div class="container">
            <legend><h2>Inscription</h2></legend>
            <div class="user">
                <label for="Nom">Nom</label><br>
                <input type="text" name="nom" id="" placeholder="votre nom" value="<?php if(isset($nom)){echo $nom}?>" required>
            </div>
            <div>
                <label for="Prenom">Prenom</label><br>
                <input type="text" name="prenom" placeholder="votre prenom" value="<?php if(isset($prenom)){echo $prenom}?>">
            </div>
            <div>
                <label for="Contact">Contact</label><br>
                <input type="text" name="contact" placeholder="votre contact" value="<?php if(isset($contact)){echo $contact}?>">
            </div>
            <div>
                <label for="Email">Email</label><br>
                <input type="email" name="email" placeholder="votre mail" value="<?php if(isset($email)){echo $email}?>">
            </div>
            <div>
                <label for="password">PassWord</label><br>
                <input type="password" name="mdp" placeholder="votre mot de passe" value="<?php if(isset($mdp)){echo $mdp}?>">
            </div>
            <div>
                <label for="password">verification de mot de passe</label><br>
                <input type="password" name="vmdp" placeholder="confimation mot de passe" value="<?php if(isset($vmdp)){echo $vmdp}?>">
            </div><br>
            <button><input type="submit" name="inscription" value="Valider" id=""></button>
            <!-- <input type="reset" name="ennuler" value="Ennuler" id=""> -->
        </div>
    </fieldset>
    </form>
</body>
</html>