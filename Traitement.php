<?php
$pdo = new pdo('mysql:host=localhost;dbname=gestion_immobilier', 'root', '');
if(isset($_POST['valider'])){
    if(!empty($_POST['user']) && !empty($_POST['password'])){
        $user = $_POST['user'];
        $password = $_POST['password'];

        $recupuser = $pdo->prepare('SELECT * FROM user WHERE email = ? AND mdp = ?');
        $recupuser->execute(array($user, $password));
        if($recupuser->rowCount() > 0){
            session_start();
            $_SESSION['email'] = $user;
            header('Location: accueil.php');
            exit;
        }else{
            echo '<script>
                window.location.href = "index.php";
                alert("connexion echoue. nom utilisateur ou mot de passe invalide");
            </script>';
        }
    }else{
        echo '<script>
            window.location.href = "index.php";
            alert("veillez remplir tous les champs svp!");
        </script>';
    }
}
?>
