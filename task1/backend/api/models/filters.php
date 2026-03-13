<?php 
function getYearsOfOlympics(PDO $pdo): array {
    $stmt = $pdo->prepare("SELECT DISTINCT year FROM olympics ORDER BY year");
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_COLUMN);
}

function getDisciplines(PDO $pdo): array {
    $stmt = $pdo->prepare("SELECT DISTINCT name FROM discipline ORDER BY name");
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_COLUMN);
}
?>