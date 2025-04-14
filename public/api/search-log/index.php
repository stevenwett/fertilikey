<?php
// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Ensure only POST requests are processed
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['message' => 'Only POST method is allowed', 'status' => 405]);
    exit();
}

// Get the base directory and load environment variables
$base_dir = dirname(dirname(dirname(__DIR__)));
require_once $base_dir . '/vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable($base_dir);
$dotenv->load();

// Get JSON input
$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

// Response structure
$message = '';
$status = 400;

// Get client IP address
$ip_address = $_SERVER['REMOTE_ADDR'];
if (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
    $ip_parts = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
    $ip_address = trim($ip_parts[0]);
}

// Handle local development IP addresses
if ($ip_address === '::1' || $ip_address === '127.0.0.1') {
    $ip_address = 'localhost';
}

try {
    // Validate required data
    if (!isset($data['institution_name'])) {
        throw new Exception('Institution name is required');
    }

    $sponsor_code = $data['sponsor_code'] ?? null;
    $institution_name = $data['institution_name'];
    $is_debug = (isset($_ENV['APP_ENV']) && 'production' === $_ENV['APP_ENV']) ? false : true;

    // Database configuration
    $db_host = $_ENV['DB_HOST'] ?? 'localhost';
    $db_user = $_ENV['DB_USER'] ?? 'root';
    $db_password = $_ENV['DB_PASSWORD'] ?? '';
    $db_name = $_ENV['DB_NAME'] ?? 'fertilikey';
    
    // Create database connection
    $conn = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Insert search log
    $stmt = $conn->prepare("INSERT INTO searchLog (sponsor_code, institution_name, ip_address, is_debug) VALUES (?, ?, ?, ?)");
    $stmt->execute([$sponsor_code, $institution_name, $ip_address, $is_debug]);
    
    // Set success response
    $message = 'Search logged successfully';
    $status = 201; // Created
} catch(PDOException $e) {
    // Set error response for database issues
    $message = 'Database error: ' . $e->getMessage();
    $status = 500;
} catch(Exception $e) {
    // Handle other exceptions
    $message = 'Error: ' . $e->getMessage();    
}

// Return JSON response
http_response_code($status);
echo json_encode([
    'message' => $message,
    'status' => $status,
    'data' => isset($data) ? $data : null,
]);