<?php
include("login.php");
if(isset($_POST['valider'])){
    $user = stripcslashes($_POST['user']);
    $password = stripcslashes($_POST['password']);

    $sql = "select *from login where user_name = '$user' and password = '$password' ";
    $resultat = mysqli_query($conn,$sql);
    $ligne = mysqli_fetch_array($resultat,MASQLI_ASSOC);
    $count = mysqli_num_rows($resultat);
    if($count==1){
        header("Location::Bienvenue.php");
    }
    else{
        echo '<script>
        windows.Location.href="login.php";
        alert("connexion echoue. nom utilisateur ou mot de passe invalide")
              <script>'
    }
}
?>