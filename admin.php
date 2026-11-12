<?php
session_start();
$pdo = new PDO('mysql:host=localhost;dbname=gestion_immobilier', 'root', '');

// Connexion admin
if (isset($_POST['admin_login'])) {
    $email = $_POST['email'];
    $mdp = $_POST['mdp'];
    $recup = $pdo->prepare('SELECT * FROM user WHERE email = ? AND mdp = ? AND role = ?');
    $recup->execute(array($email, $mdp, 'admin'));
    if ($recup->rowCount() > 0) {
        $_SESSION['admin'] = $email;
        header('Location: dashboard.php');
        exit;
    } else {
        $erreur = "Accès refusé. Identifiants administrateur invalides.";
    }
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="admin.css">
    <title>Administration - Gestion Immobilier</title>
    <link rel="stylesheet" href="css/all.css">
</head>
<body>
    <div class="login-wrapper">
        <form action="" method="post" class="login-form">
            <div class="login-header">
                <i class="fa-solid fa-user-shield"></i>
                <h1>Espace Administrateur</h1>
                <p>Connectez-vous pour gérer les comptes</p>
            </div>
            <?php if (!empty($erreur)) { echo '<div class="alert">'.$erreur.'</div>'; } ?>
            <div class="input-group">
                <i class="fa-solid fa-envelope"></i>
                <input type="email" name="email" placeholder="Email administrateur" required>
            </div>
            <div class="input-group">
                <i class="fa-solid fa-lock"></i>
                <input type="password" name="mdp" placeholder="Mot de passe" required>
            </div>
            <button type="submit" name="admin_login">Se connecter <i class="fa-solid fa-arrow-right"></i></button>
            <a href="index.php" class="back-link"><i class="fa-solid fa-arrow-left"></i> Retour au site</a>
        </form>
    </div>
</body>
</html>
